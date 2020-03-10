import {Component, ElementRef,HostListener, OnInit} from '@angular/core';
import {MapLoaderService} from '../../shared/map-loader.service';
import {GlobalEventsService} from '../../shared/global-events.service';
import {Globals} from '../../shared/globals';
import {StateHistoryService} from '../../shared/history/state-history.service';
import {PhaserEventsService} from '../../shared/phaser/phaser-events.service';
import * as Phaser from 'phaser';
import {MainScene} from '../../shared/phaser/main-scene';
import {HeightMapService} from '../../services/height-map/height-map.service';
import {AutotileService} from '../../services/autotile/autotile.service';
import {EntityRegistryService} from '../../shared/phaser/entities/registry/entity-registry.service';
import { Helper } from '../../shared/phaser/helper';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';

@Component({
	selector: 'app-phaser',
	templateUrl: './phaser.component.html',
	styleUrls: ['./phaser.component.scss']
})
export class PhaserComponent implements OnInit {
	
	constructor(private element: ElementRef,
	            private mapLoader: MapLoaderService,
	            private globalEvents: GlobalEventsService,
	            private stateHistory: StateHistoryService,
	            private phaserEventsService: PhaserEventsService,
	            private heightMap: HeightMapService,
	            registry: EntityRegistryService,
				autotile: AutotileService,
				loader: ToolCommunicationAPIService
	) {
		Helper.setLoader(loader);
		Globals.stateHistoryService = stateHistory;
		Globals.mapLoaderService = mapLoader;
		Globals.phaserEventsService = phaserEventsService;
		Globals.globalEventsService = globalEvents;
		Globals.autotileService = autotile;
		Globals.entityRegistry = registry;
	}
	
	
	ngOnInit() {
		this.heightMap.init();
		const scene = new MainScene();
		const scale = this.getScale();
		Globals.game = new Phaser.Game({
			type: Phaser.AUTO,
			parent: 'content',
			width: scale.width,
			height: scale.height,
			scale: {
				mode: Phaser.Scale.ScaleModes.NONE,
				zoom: 1 / window.devicePixelRatio
			},
			render: {
				pixelArt: true
			},
			zoom: 1,
			scene: [scene]
		});
		Globals.scene = scene;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: Event) {
		if (!Globals.game) {
			return;
		}
		const scale = this.getScale();
		const width = scale.width;
		const height = scale.height;
		Globals.game.scale.resize(width, height);
	}

	private getScale() {
		return {
			width: window.innerWidth * window.devicePixelRatio,
			height: window.innerHeight * window.devicePixelRatio - 64
		};
	}
}