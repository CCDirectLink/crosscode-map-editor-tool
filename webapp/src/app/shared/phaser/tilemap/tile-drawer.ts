import {CCMapLayer} from './cc-map-layer';
import {Globals} from '../../globals';
import {Helper} from '../helper';
import {Point} from '../../../models/cross-code-map';
import {Vec2} from '../vec2';
import {SelectedTile} from '../../../models/tile-selector';
import * as Phaser from 'phaser';
import {Subscription} from 'rxjs';
import {Filler} from './fill';
import {BaseObject} from '../BaseObject';

export class TileDrawer extends BaseObject {
	
	private layer?: CCMapLayer;
	private selectedTiles: SelectedTile[] = [];
	
	private rect?: Phaser.GameObjects.Rectangle;
	
	private previewTileMap!: Phaser.Tilemaps.Tilemap;
	private previewLayer?: Phaser.Tilemaps.DynamicTilemapLayer;
	
	private rightClickStart?: Point;
	private rightClickEnd?: Point;
	private renderLayersTransparent = false;
	
	private container!: Phaser.GameObjects.Container;
	
	private transparentKey!: Phaser.Input.Keyboard.Key;
	private visibilityKey!: Phaser.Input.Keyboard.Key;
	private fillKey!: Phaser.Input.Keyboard.Key;
	
	constructor(scene: Phaser.Scene) {
		super(scene, 'tileDrawer');
	}
	
	protected init() {
		this.fillKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F, false);
		this.transparentKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R, false);
		this.visibilityKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V, false);
		
		this.container = this.scene.add.container(0, 0);
		this.container.depth = 1000;
		
		this.drawRect(1, 1);
		
		this.resetSelectedTiles();
		
		this.previewTileMap = this.scene.add.tilemap(undefined, Globals.TILE_SIZE, Globals.TILE_SIZE);
	}
	
	private selectLayer(selectedLayer?: CCMapLayer) {
		this.layer = selectedLayer;
		
		this.setLayerAlpha();
		
		if (!selectedLayer || !selectedLayer.details.tilesetName) {
			this.container.visible = false;
			return;
		}
		this.container.visible = true;
		const tileset = this.previewTileMap.addTilesetImage('only', selectedLayer.details.tilesetName);
		tileset.firstgid = 1;
	}
	
	private updateSelectedTiles(selected: SelectedTile[]) {
		this.selectedTiles = selected;
		this.renderPreview();
		
		let x = 0;
		let y = 0;
		selected.forEach(tile => {
			const o = tile.offset;
			if (o.x > x) {
				x = o.x;
			}
			if (o.y > y) {
				y = o.y;
			}
		});
		
		this.drawRect(x + 1, y + 1, 0, 0);
	}
	
	
	preUpdate() {
		// hide cursor when no map loaded
		if (!this.layer) {
			this.container.visible = false;
			return;
		}
		const pointer = this.scene.input.activePointer;
		const p = Helper.worldToTile(pointer.worldX, pointer.worldY);
		
		// render selection border
		if (this.rightClickStart) {
			Helper.clampToBounds(this.layer, p);
			
			if (this.rightClickEnd && this.rightClickEnd.x === p.x && this.rightClickEnd.y === p.y) {
				// shortcut to avoid redrawing rectangle every frame
				return;
			}
			
			this.rightClickEnd = p;
			const diff = Vec2.sub(p, this.rightClickStart, true);
			const start = {x: 0, y: 0};
			if (diff.x >= 0) {
				diff.x++;
			} else {
				start.x = Globals.TILE_SIZE;
				diff.x--;
			}
			if (diff.y >= 0) {
				diff.y++;
			} else {
				start.y = Globals.TILE_SIZE;
				diff.y--;
			}
			
			this.drawRect(diff.x, diff.y, start.x, start.y);
			return;
		}
		
		// position tile drawer border to cursor
		const container = this.container;
		container.x = pointer.worldX;
		container.y = pointer.worldY;
		
		if (container.x < 0) {
			container.x -= Globals.TILE_SIZE;
		}
		if (container.y < 0) {
			container.y -= Globals.TILE_SIZE;
		}
		
		container.x -= container.x % Globals.TILE_SIZE;
		container.y -= container.y % Globals.TILE_SIZE;
		
		if (this.previewLayer) {
			Vec2.assign(this.previewLayer, container);
		}
		
		// draw tiles (skip when tile selector is open)
		// trigger only when mouse is over canvas element (the renderer), avoids triggering when interacting with ui
		if (pointer.leftButtonDown() && pointer.downElement.nodeName === 'CANVAS' && this.layer) {
			const finalPos = {x: 0, y: 0};
			this.selectedTiles.forEach(tile => {
				finalPos.x = p.x + tile.offset.x;
				finalPos.y = p.y + tile.offset.y;
				
				if (Helper.isInBounds(this.layer!, finalPos)) {
					const phaserLayer = this.layer!.getPhaserLayer();
					if (!phaserLayer) {
						return;
					}
					phaserLayer.putTileAt(tile.id, finalPos.x, finalPos.y);
				}
			});
		}
	}
	
	protected deactivate() {
		this.container.visible = false;
		if (this.previewLayer) {
			this.previewLayer.visible = false;
		}
	}
	
	protected activate() {
		if (this.previewLayer) {
			this.previewLayer.visible = true;
		}
		const sub = Globals.mapLoaderService.selectedLayer.subscribe(layer => this.selectLayer(layer));
		this.addSubscription(sub);
		
		const sub2 = Globals.phaserEventsService.changeSelectedTiles.subscribe(tiles => this.updateSelectedTiles(tiles));
		this.addSubscription(sub2);
		
		const pointerDown = (pointer: Phaser.Input.Pointer) => {
			if (pointer.rightButtonDown()) {
				this.onMouseRightDown();
			}
		};
		this.addKeybinding({event: 'pointerdown', fun: pointerDown, emitter: this.scene.input});
		
		const pointerUp = (pointer: Phaser.Input.Pointer) => {
			if (pointer.rightButtonReleased()) {
				this.onMouseRightUp();
			}
		};
		this.addKeybinding({event: 'pointerup', fun: pointerUp, emitter: this.scene.input});
		
		
		const fill = () => {
			if (!Helper.isInputFocused()) {
				this.fill();
			}
		};
		this.addKeybinding({event: 'up', fun: fill, emitter: this.fillKey});
		
		
		const leftUp = (pointer: Phaser.Input.Pointer) => {
			if (!pointer.leftButtonReleased()) {
				return;
			}
			
			if (!this.layer) {
				return;
			}
			
			Globals.stateHistoryService.saveState({
				name: 'Tile Drawer',
				icon: 'create',
			});
		};
		this.addKeybinding({event: 'pointerup', fun: leftUp, emitter: this.scene.input});
		
		const transparent = () => {
			if (!Helper.isInputFocused()) {
				this.renderLayersTransparent = !this.renderLayersTransparent;
				this.setLayerAlpha();
			}
		};
		this.addKeybinding({event: 'up', fun: transparent, emitter: this.transparentKey});
		
		const visible = () => {
			if (!Helper.isInputFocused()) {
				Globals.globalEventsService.toggleVisibility.next();
			}
		};
		this.addKeybinding({event: 'up', fun: visible, emitter: this.visibilityKey});
	}
	
	private setLayerAlpha() {
		const map = Globals.map;
		if (map) {
			map.layers.forEach(layer => {
				layer.alpha = this.renderLayersTransparent ? 0.5 : 1;
			});
			if (this.layer) {
				this.layer.alpha = 1;
			}
		}
	}
	
	private onMouseRightDown() {
		if (!this.layer) {
			return;
		}
		
		
		// only start tile copy when cursor in bounds
		const pointer = this.scene.input.activePointer;
		const p = Helper.worldToTile(pointer.worldX, pointer.worldY);
		if (!Helper.isInBounds(this.layer, p)) {
			return;
		}
		
		this.resetSelectedTiles();
		this.renderPreview();
		this.rightClickStart = p;
	}
	
	private drawRect(width: number, height: number, x = 0, y = 0) {
		if (this.rect) {
			this.rect.destroy();
		}
		this.rect = this.scene.add.rectangle(x, y, width * Globals.TILE_SIZE, height * Globals.TILE_SIZE);
		this.rect.setOrigin(0, 0);
		this.rect.setStrokeStyle(1, 0xffffff, 0.6);
		
		this.container.add(this.rect);
	}
	
	private onMouseRightUp() {
		if (!this.layer) {
			return;
		}
		this.selectedTiles = [];
		
		// cancel current selection when out of bounds
		const phaserLayer = this.layer.getPhaserLayer();
		if (!this.rightClickStart || !this.rightClickEnd || !phaserLayer) {
			this.drawRect(1, 1);
			this.resetSelectedTiles();
			this.renderPreview();
			return;
		}
		
		// select tiles
		const start = this.rightClickStart;
		const end = this.rightClickEnd;
		
		const smaller = {
			x: Math.min(start.x, end.x),
			y: Math.min(start.y, end.y)
		};
		
		const bigger = {
			x: Math.max(start.x, end.x),
			y: Math.max(start.y, end.y)
		};
		
		const width = bigger.x - smaller.x + 1;
		const height = bigger.y - smaller.y + 1;
		
		const tilesWithin = phaserLayer.getTilesWithin(smaller.x, smaller.y, width, height);
		
		tilesWithin.forEach((tile: Phaser.Tilemaps.Tile) => {
			this.selectedTiles.push({
				id: tile.index,
				offset: Vec2.sub(tile, smaller, true)
			});
		});
		
		this.renderPreview();
		
		this.drawRect(width, height);
		
		
		this.rightClickStart = undefined;
		this.rightClickEnd = undefined;
	}
	
	private renderPreview() {
		this.previewTileMap.removeAllLayers();
		const layer = this.previewTileMap.createBlankDynamicLayer('layer', 'only', 0, 0, 40, 40);
		this.previewLayer = layer;
		layer.depth = this.container.depth - 1;
		layer.alpha = 0.6;
		
		this.selectedTiles.forEach(tile => {
			layer.putTileAt(tile.id, tile.offset.x, tile.offset.y);
		});
	}
	
	private resetSelectedTiles() {
		this.selectedTiles = [{id: 0, offset: {x: 0, y: 0}}];
	}
	
	private fill() {
		if (!this.layer) {
			return;
		}
		
		const pointer = this.scene.input.activePointer;
		const p = Helper.worldToTile(pointer.worldX, pointer.worldY);
		
		if (this.selectedTiles.length > 0) {
			Filler.fill(this.layer, this.selectedTiles[0].id, p);
		}
		
	}
}
