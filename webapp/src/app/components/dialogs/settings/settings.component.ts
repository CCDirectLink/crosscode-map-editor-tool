import {Component, OnInit} from '@angular/core';
import {OverlayRefControl} from '../../../shared/overlay/overlay-ref-control';
import {FormControl} from '@angular/forms';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
	
	folderFormControl = new FormControl();
	icon = 'help_outline';
	iconCss = 'icon-undefined';
	
	constructor(
		private ref: OverlayRefControl,
	) {
	}
	
	ngOnInit() {}
	
	
	save() {

	}
	
	close() {
		this.ref.close();
	}
	
}
