import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';
import { MatSidenav, MatTreeNestedDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-map-fs-tree-view',
    templateUrl: './map-fs-tree-view.component.html',
    styleUrls: ['./map-fs-tree-view.component.scss']
})
export class MapFsTreeViewComponent implements OnInit, OnDestroy {
    @Input()
    sidenav!: MatSidenav;
    private fsSubcription!: Subscription;
    constructor(private mapFsService: MapFileSystemService) { }

    ngOnInit() {
        this.fsSubcription = this.mapFsService.fs.subscribe(
            (rootFolder) => {
                console.log(rootFolder);
            }
        );
    }

    ngOnDestroy() {
        if (this.fsSubcription) {
            this.fsSubcription.unsubscribe();
        }
    }


    refresh() {
        this.mapFsService.refresh();
    }

    close() {
        return this.sidenav.close();
    }

}
