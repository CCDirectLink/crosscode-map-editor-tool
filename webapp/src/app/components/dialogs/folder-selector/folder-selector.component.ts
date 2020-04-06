import { Component, OnInit, Output, OnDestroy } from '@angular/core';
import { MapFileSystemService } from '../../../shared/map-filesystem/map-filesystem.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { MapFolder } from '../../../shared/map-filesystem/map-filesystem.model';

@Component({
	selector: 'app-folder-selector',
	templateUrl: './folder-selector.component.html',
	styleUrls: ['./folder-selector.component.scss']
})
export class FolderSelectorComponent implements OnInit, OnDestroy {

	@Output() selectedPath = '';
	private fsSub: Subscription | undefined;

	private root: MapFolder | undefined;

	constructor(private mapFs: MapFileSystemService) {
		// console.log('owo', this);
	}

	ngOnInit() {
		this.fsSub = this.mapFs.fs.subscribe(
			(root: MapFolder) => this.setRoot(root),
		);
	}

	setRoot(root: MapFolder) {
		this.root = root;
		console.log('New root', this.root);
	}

	ngOnDestroy() {
		if (this.fsSub) {
			this.fsSub.unsubscribe();
		}
	}

}
