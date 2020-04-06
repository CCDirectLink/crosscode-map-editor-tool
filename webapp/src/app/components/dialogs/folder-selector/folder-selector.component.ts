import { Component, OnInit, Output } from '@angular/core';
import { MapFileSystemService } from '../../../shared/map-filesystem/map-filesystem.service';

@Component({
	selector: 'app-folder-selector',
	templateUrl: './folder-selector.component.html',
	styleUrls: ['./folder-selector.component.scss']
})
export class FolderSelectorComponent implements OnInit {

	@Output() selectedPath = '';
	constructor(private mapFs: MapFileSystemService) {
		console.log(this.mapFs);
	}

	ngOnInit() {
	}

}
