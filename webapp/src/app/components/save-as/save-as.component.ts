import { Component, Inject, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';
import { Subscription } from 'rxjs';
import { MapFolder, MapFile, IMapFile } from '../../shared/map-filesystem/map-filesystem.model';
import { MapFileSystemUtils } from '../../shared/map-filesystem/map-filesystem.utils';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	encapsulation: ViewEncapsulation.None,
	selector: 'app-save-as',
	templateUrl: './save-as.component.html',
	styleUrls: ['./save-as.component.scss']
})
export class SaveAsComponent implements OnInit, OnDestroy {
	testObject: MapFolder = new MapFolder({ name: 'root', path: 'root/' } as IMapFile, null);
	testPath: string[] = [];
	private fsSubcription!: Subscription;
	private pathToRoot: string = '';
	// true parent 
	private trueRootFolder!: MapFolder;
	currentRootFolder!: MapFolder;
	constructor(
		public dialogRef: MatDialogRef<SaveAsComponent>,
		private mapFsService: MapFileSystemService,
		@Inject(MAT_DIALOG_DATA) public data: any) {
		this.testObject.isRoot = true;
		MapFileSystemUtils.generateFromMapTree(this.testObject, [{
			name: 'mod1',
			path: 'mod1/',
			children: [
				'test1/test2/test3/'
			]
		}]);
		this.pathToRoot = 'mod1/test1';
	}

	ngOnInit() {
		/*this.fsSubcription = this.mapFsService.fs.subscribe(
			(rootFolder) => {
				this.trueRootFolder = rootFolder;
				this.refresh();
			}
		);*/
		this.trueRootFolder = this.testObject;
		this.refresh();
	}

	ngOnDestroy() {
		if (this.fsSubcription) {
			this.fsSubcription.unsubscribe();
		}
	}


	isFolder(file: MapFile) {
		return file instanceof MapFolder;
	}

	private createNewPath(file: MapFolder) {
		const newFile = file.name;
		if (file.relativePath) {
			return file.relativePath + '/' + newFile;
		}
		return newFile;
	}

	refresh() {
		if (this.trueRootFolder) {
			this.currentRootFolder = MapFileSystemUtils.resolveFolderPath(this.trueRootFolder, this.pathToRoot);
			this.pathToRoot = this.createNewPath(this.currentRootFolder);
		}
	}

	onClick(file: MapFile) {

	}

	onDoubleClick(file: MapFile) {
		if (file instanceof MapFolder) {
			this.currentRootFolder = file;
			this.pathToRoot = this.createNewPath(file);
		} else {
			if (confirm(`The current map will be saved into an already existing map named ${file.name}.`)) {
				console.log('User chose', file.name);
				// this.closeDialog(file);
			} else {
				console.log('Clicked', file);
			}
		}

	}

	closeDialog(choice: MapFile | undefined) {
		console.log('Selected', choice);
		this.dialogRef.close(choice);
	}

}
