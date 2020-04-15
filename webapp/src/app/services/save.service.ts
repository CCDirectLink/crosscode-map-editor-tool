import { Injectable } from '@angular/core';
import { CCMap } from '../shared/phaser/tilemap/cc-map';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Helper } from '../shared/phaser/helper';
import { EventManager } from '@angular/platform-browser';
import { MapLoaderService } from '../shared/map-loader.service';
import { ToolCommunicationAPIService } from './tool-communication-api.service';
import { SaveAsComponent } from '../components/save-as/save-as.component';
import { MapFile } from '../shared/map-filesystem/map-filesystem.model';

@Injectable({
	providedIn: 'root'
})
export class SaveService {

	constructor(
		private snackbar: MatSnackBar,
		private dialog: MatDialog,
		mapLoader: MapLoaderService,
		eventManager: EventManager,
		private toolsApi: ToolCommunicationAPIService
	) {
		eventManager.addEventListener(document as any, 'keydown', (event: KeyboardEvent) => {
			if (Helper.isInputFocused()) {
				return;
			}

			if (event.ctrlKey && event.key.toLowerCase() === 's') {
				event.preventDefault();
				const map: any = mapLoader.tileMap.getValue() || {};
				if (!map) {
					return;
				}
				if (event.shiftKey) {
					this.saveMapAs(map);
				} else {
					this.saveMap(map);
				}
			}
		});
	}

	saveMapAs(ccMap: CCMap) {
		const ref = this.dialog.open(SaveAsComponent, {
			width: '80vw',
			height: '70vh'
		});

		ref.afterClosed().subscribe((file: MapFile | undefined) => {
			console.log('It closed', file);
			if (file) {
				ccMap.file = file;
				this.saveMap(ccMap);
			}
		});
	}

	saveMap(ccMap: CCMap) {
		if (!ccMap.file) {
			return this.saveMapAs(ccMap);
		}

		const { map, path } = ccMap.exportMap();
		this.toolsApi.save(path, JSON.stringify(map));
	}
}
