import { Injectable } from '@angular/core';

import { IMapFile, MapFile, MapFolder, MapFileType } from './map-filesystem.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable, throwError } from 'rxjs';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';
import { ObservableHelper } from '../observable-helper';

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
		const sub = this.toolApi.getMaps().subscribe(
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
		for (const map of maps) {

			const mapFolder: IMapFile = {
				type: MapFileType.FOLDER,
				name: map.name,
				path: map.path
			};

			const cacheSubFolders: any = {

			};

			const parent: MapFolder = this.root.addChildFolder(mapFolder);


			for (const childPath of map.children) {
				const pathParts = childPath.split('/');
				let subParent: MapFolder = parent;
				let subCacheFolder: any = cacheSubFolders;
				for (let i = 0; i < pathParts.length; i++) {
					const pathPart = pathParts[i];


					if (i < pathParts.length - 1) {
						if (!subCacheFolder[pathPart]) {
							subCacheFolder[pathPart] = {
								value: subParent.addChildFolder({
									type: MapFileType.FOLDER,
									name: pathPart,
									path: pathPart
								}),
								children: {}
							};
						}
						subParent = subCacheFolder[pathPart].value;
						subCacheFolder = subCacheFolder[pathPart].children;
					} else if (pathPart.length) {
						let fileName: string = pathPart;
						if (!fileName.endsWith('.json')) {
							continue;
						}

						fileName = fileName.substring(0, fileName.length - 5);

						subParent.addChildFile({
							type: MapFileType.FILE,
							name: fileName,
							path: pathPart
						})
					}

				}
			}
		}

	}



	/**
	 * 
	 * @param {string} path (virtual) to target map file 
	 * @param {string} data to save to map file
	 */
	saveData(path: string, data: string): Observable<any> {
		const file = this.resolveFilePath(path);

		if (!file) {
			return throwError(`No such virtual path "${path}"`);
		}

		return ObservableHelper.toObservable(this.toolApi.save(file.absolutePath, data));
	}


	/**
	 * 
	 * @param {string} path (virtual) to target folder
	 * @param {IMapFile} folder info to add
	 */
	addFolder(path: string, folder: IMapFile): Observable<any> {
		let rootFolder: MapFolder | null = this.resolveFolderPath(path);

		if (!rootFolder) {
			return throwError(`virtual path "${path}" doesn't exist.`);
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
		const rootFolder = this.resolveFolderPath(path);

		if (!rootFolder) {
			return throwError(`virtual path "${path}" doesn't exist`);
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
				rootFolder.addChildFile(file);
				this._fs.next(this.root);
			}
		);

		return newFileObservable;

	}

	/**
	 * 
	 * @param {string} path (virtual) to target folder
	 * @returns {MapFolder| null}
	 */
	private resolveFolderPath(path: string) {
		let root: MapFolder = this.root;

		if (path.length) {
			const fileNames = path.split('/');
			for (let i = 0; i < fileNames.length; ++i) {
				const child: MapFile | MapFolder | null = root.findChildByName(fileNames[i]);

				if (!(child instanceof MapFolder)) {
					return null;
				} else {
					root = child;
				}
			}
		}
		return root;
	}

	/**
	 * 
	 * @param {string} path (virtual) to target folder
	 * @returns {MapFile | null}
	 */
	private resolveFilePath(path: string) {
		const pathParts = path.split('/');
		let rootFolder: MapFolder | null = this.resolveFolderPath(pathParts.slice(0, -1).join('/'));
		if (rootFolder) {
			let fileName = pathParts[pathParts.length - 1];
			return rootFolder.findChildByName(fileName);
		}
		return null;
	}

	get fs(): Observable<MapFolder> {
		return this._fs.asObservable();
	}
}
