import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {BehaviorSubject, Observable} from 'rxjs';
import {CrossCodeMap} from '../models/cross-code-map';
import {CCMap} from './phaser/tilemap/cc-map';
import {CCMapLayer} from './phaser/tilemap/cc-map-layer';
import { ToolCommunicationAPIService } from '../services/tool-communication-api.service';

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
				let path: string | undefined;
				this.loadRawMap(map, file.name, path);
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
	
	loadRawMap(map: CrossCodeMap, name?: string, path?: string) {
		if (!map.mapHeight) {
			throw new Error('Invalid map');
		}
		map.filename = name;
		map.path = path;
		this._map.next(map);
	}
	
	loadMapByPath(path: string) {
		this.toolApi.loadJSON(path).subscribe((map: CrossCodeMap) => {
			map.path = path;
			this._map.next(map);
		});
	}
	
	get map(): Observable<CrossCodeMap> {
		return this._map.asObservable();
	}
}
