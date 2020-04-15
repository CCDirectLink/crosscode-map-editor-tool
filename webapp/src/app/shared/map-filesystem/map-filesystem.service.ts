import { Injectable } from '@angular/core';

import { IMapFile, MapFile, MapFolder, MapFileType } from './map-filesystem.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable, throwError, ObservableLike } from 'rxjs';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';
import { ObservableHelper } from '../observable-helper';
import { MapContext } from '../../models/mapContext.model';
import { MapFileSystemUtils } from './map-filesystem.utils';

@Injectable({
	providedIn: 'root'
})
export class MapFileSystemService {

	// @ts-ignore
	private root: MapFolder = new MapFolder({ name: 'cc', path: '' }, null);

	private _fs = new BehaviorSubject<MapFolder>(undefined as any);

	constructor(private toolApi: ToolCommunicationAPIService) {
		this.refresh();
	}

	refresh() {
		ObservableHelper.toObservable<MapContext[]>(this.toolApi.getMaps()).subscribe(
			(maps) => {
				this.init(maps);
				this._fs.next(this.root);
			},
			(err) => {
				console.error(err)
			}
		);
	}


	init(maps: any) {
		this.root.clear();
		this.root.isRoot = true;
		MapFileSystemUtils.generateFromMapTree(this.root, maps);
	}


	loadMap(file: MapFile): Observable<any> {
		if (file instanceof MapFolder) {
			return throwError(`${file.name} is a folder.`);
		}
		return ObservableHelper.toObservable(this.toolApi.loadJSON(file.absolutePath));
	}

	/**
	 * 
	 * @param {string} path (virtual) to target map file 
	 * @param {string} data to save to map file
	 */
	saveMap(path: string, data: string): Observable<any> {
		let file = null;
		let error = '';

		try {
			file = MapFileSystemUtils.resolveFilePath(this.root, path);
		} catch (e) {
			error = e;
		}

		if (file) {
			return ObservableHelper.toObservable(this.toolApi.save(file.absolutePath, data));
		} else {
			return throwError(error);
		}
	}


	/**
	 * 
	 * @param {string} path (virtual) to target folder
	 * @param {IMapFile} folder info to add
	 */
	addFolder(path: string, folder: IMapFile): Observable<any> {
		let rootFolder: MapFolder | null = null;
		let error = '';
		try {
			rootFolder = MapFileSystemUtils.resolveFolderPath(this.root, path);
		} catch (e) {
			error = e;
		}

		if (!rootFolder) {
			return throwError(error);
		}

		const foundFolder = rootFolder.findChildByName(folder.name);
		if (foundFolder !== null) {
			if (foundFolder instanceof MapFolder) {
				return throwError(`a folder already exists with the name "${folder.name}"`);
			}

			return throwError(`a map file already exists with the name "${folder.name}"`);
		}

		const absolutePath = rootFolder.path + folder.path;

		const newFolderObservable = ObservableHelper.toObservable<any>(this.toolApi.makeFolder(absolutePath));

		newFolderObservable.subscribe(
			() => {
				if (rootFolder) {
					rootFolder.addChildFolder(folder);
					this._fs.next(this.root);
				}
			}
		);

		return newFolderObservable;
	}

	/**
	 * 
	 * @param {string} path (virtual) to target folder
	 * @param {IMapFile} file info to add
	 */
	addFile(path: string, file: IMapFile): Observable<any> {
		let rootFolder: MapFolder | null = null;
		let error = '';
		try {
			rootFolder = MapFileSystemUtils.resolveFolderPath(this.root, path);
		} catch (e) {
			error = e;
		}

		if (!rootFolder) {
			return throwError(error);
		}

		const foundFile = rootFolder.findChildByName(file.path);

		if (foundFile !== null) {
			if (foundFile instanceof MapFolder) {
				return throwError(`a folder already exists with the name "${file.name}"`);
			}

			return throwError(`a map file already exists with the name "${file.name}"`);
		}


		const absolutePath = rootFolder.path + file.path;

		const newFileObservable = ObservableHelper.toObservable<any>(this.toolApi.save(absolutePath, ''));

		newFileObservable.subscribe(
			() => {
				if (rootFolder) {
					rootFolder.addChildFile(file);
					this._fs.next(this.root);
				}
			}
		);

		return newFileObservable;

	}

	get fs(): Observable<MapFolder> {
		return this._fs.asObservable();
	}
}
