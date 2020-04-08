import { Component, OnInit, Input } from '@angular/core';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';
import { MatSidenav, MatTreeNestedDataSource } from '@angular/material';

@Component({
    selector: 'app-map-fs-tree-view',
    templateUrl: './map-fs-tree-view.component.html',
    styleUrls: ['./map-fs-tree-view.component.scss']
})
export class MapFsTreeViewComponent implements OnInit {
    @Input()
    sidenav!: MatSidenav;

    constructor(private mapFsService: MapFileSystemService) { }

    ngOnInit() {
        this.mapFsService.fs.subscribe(
            (rootFolder) => {
                console.log(rootFolder);
            }
        );
    }

    refresh() {
        this.mapFsService.refresh();
    }

    close() {
        return this.sidenav.close();
    }

}
