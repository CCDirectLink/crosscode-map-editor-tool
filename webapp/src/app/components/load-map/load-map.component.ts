import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatSidenav, MatTreeNestedDataSource } from '@angular/material';
import { MapLoaderService } from '../../shared/map-loader.service';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';
import { MapFolder } from '../../shared/map-filesystem/map-filesystem.model';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';


@Component({
	selector: 'app-load-map',
	templateUrl: './load-map.component.html',
	styleUrls: ['./load-map.component.scss']
})
export class LoadMapComponent {


}
