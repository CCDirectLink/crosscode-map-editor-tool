import { Injectable } from '@angular/core';
import { CCMap } from '../shared/phaser/tilemap/cc-map';
import { MatSnackBar } from '@angular/material';
import { Helper } from '../shared/phaser/helper';
import { EventManager } from '@angular/platform-browser';
import { MapLoaderService } from '../shared/map-loader.service';
import { ToolCommunicationAPIService } from './tool-communication-api.service';

@Injectable({
	providedIn: 'root'
})
export class SaveService {

	constructor(
		private snackbar: MatSnackBar,
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
				const map = mapLoader.tileMap.getValue();
				if (!map) {
					return;
				}
				if (event.shiftKey) {
					// this.saveMapAs(map);
				} else {
					this.saveMap(map);
				}
			}
		});
	}

	saveMap(ccMap: CCMap) {
		const { map, path } = ccMap.exportMap();
		if (!path) {
			console.error('map has no path :/');
			return;
		}
		this.toolsApi.save(path, JSON.stringify(map));
	}
}
