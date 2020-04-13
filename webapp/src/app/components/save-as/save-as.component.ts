import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';
import { Subscription } from 'rxjs';
import { MapFolder, MapFile } from '../../shared/map-filesystem/map-filesystem.model';
import { MapFileSystemUtils } from '../../shared/map-filesystem/map-filesystem.utils';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-save-as',
	templateUrl: './save-as.component.html',
	styleUrls: ['./save-as.component.scss']
})
export class SaveAsComponent implements OnInit, OnDestroy {
	private fsSubcription!: Subscription;
	private pathToRoot: string = '';
	// true parent 
	private trueRootFolder!: MapFolder;
	currentRootFolder!: MapFolder;
	constructor(
		public dialogRef: MatDialogRef<SaveAsComponent>,
		private mapFsService: MapFileSystemService,
		@Inject(MAT_DIALOG_DATA) public data: any) {

	}

	ngOnInit() {
		this.fsSubcription = this.mapFsService.fs.subscribe(
			(rootFolder) => {
				this.trueRootFolder = rootFolder;
				this.refresh();
			}
		);
	}

	ngOnDestroy() {
		this.fsSubcription.unsubscribe();
	}

	refresh() {
		if (this.trueRootFolder) {
			this.currentRootFolder = MapFileSystemUtils.resolveFolderPath(this.trueRootFolder, this.pathToRoot);
			this.pathToRoot = this.currentRootFolder.relativePath;
		}
	}

	onClick(file: MapFile) {
		if (file instanceof MapFolder) {

		} else {

		}
	}

	onDoubleClick(file: MapFile) {
		if (file instanceof MapFolder) {
			console.log('Go to folder', file.name);
			this.currentRootFolder = file;
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
