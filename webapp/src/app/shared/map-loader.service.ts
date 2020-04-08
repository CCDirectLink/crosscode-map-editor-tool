import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { BehaviorSubject, Observable } from 'rxjs';
import { CrossCodeMap } from '../models/cross-code-map';
import { CCMap } from './phaser/tilemap/cc-map';
import { CCMapLayer } from './phaser/tilemap/cc-map-layer';
import { ToolCommunicationAPIService } from '../services/tool-communication-api.service';
import { MapFile } from './map-filesystem/map-filesystem.model';

@Injectable()
export class MapLoaderService {

	private _map = new BehaviorSubject<CrossCodeMap>(undefined as any);
	tileMap = new BehaviorSubject<CCMap | undefined>(undefined);
	selectedLayer = new BehaviorSubject<CCMapLayer | undefined>(undefined);

	constructor(
		private snackBar: MatSnackBar,
		private toolApi: ToolCommunicationAPIService,
	) {
	}

	loadMap(event: Event) {
		const files: FileList = (event.target as HTMLInputElement).files!;
		if (files.length === 0) {
			return;
		}

		const file = files[0];
		const reader = new FileReader();

		reader.onload = (e: any) => {
			try {
				const map: any = JSON.parse(e.target.result);
				this.loadRawMap(map);
			} catch (e) {
				console.error(e);
				this.snackBar.open('Error: ' + e.message, undefined, {
					duration: 2500
				});
				return;
			}
		};

		reader.readAsText(file);
	}

	loadRawMap(map: CrossCodeMap) {
		if (!map.mapHeight) {
			throw new Error('Invalid map');
		}
		this._map.next(map);
	}

	get map(): Observable<CrossCodeMap> {
		return this._map.asObservable();
	}
}
