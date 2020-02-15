import {Injectable} from '@angular/core';
import {CCMap} from '../shared/phaser/tilemap/cc-map';
import {MatSnackBar} from '@angular/material';
import {Helper} from '../shared/phaser/helper';
import {EventManager} from '@angular/platform-browser';
import {MapLoaderService} from '../shared/map-loader.service';

@Injectable({
	providedIn: 'root'
})
export class SaveService {
	
	constructor(
		private snackbar: MatSnackBar,
		mapLoader: MapLoaderService,
		eventManager: EventManager
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
					this.saveMapAs(map);
				} else {
					this.saveMap(map);
				}
			}
		});
	}
	
	saveMap(map: CCMap) {
		if (!map.path) {
			console.error('map has no path :/');
			return this.saveMapAs(map);
		}

	}
	
	saveMapAs(map: CCMap) {
		/**
		 * 
		 */
	}
	
	private generateMapJson(map: CCMap) {
		const out = map.exportMap();
		out.path = undefined;
		out.filename = undefined;
		return JSON.stringify(out);
	}
}
