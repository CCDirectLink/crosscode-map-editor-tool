import { Injectable, OnInit } from '@angular/core';

import { IMapFile, MapFile, MapFolder, MapFileType } from './map-filesystem.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';

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
			(err) => console.error(err),
			() => {
				sub.unsubscribe();
				console.log('Unsubscribed from getMaps');
			}
		);
		// this._fs.next()
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
						if (fileName.endsWith('.json')) {
							fileName = fileName.substring(0, fileName.length - 5);
						} else if (fileName.endsWith('.patch')) {
							continue;
						}

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
	 * @param {string} path (virtual) to target folder
	 * @param {IMapFile} file info to add
	 */
	addFile(path: string, file: IMapFile) {
		const rootFolder = this.resolveFolderPath(path);

		if (!rootFolder) {
			throw Error(`${path} doesn't exist`);
		}
		rootFolder.addChild(file);

		this._fs.next(rootFolder);
	}


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

	get fs(): Observable<MapFolder> {
		return this._fs.asObservable();
	}
}
