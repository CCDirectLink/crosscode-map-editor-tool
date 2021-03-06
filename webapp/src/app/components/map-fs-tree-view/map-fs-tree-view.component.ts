import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MapFileSystemService } from '../../shared/map-filesystem/map-filesystem.service';
import { MatSidenav, MatTreeNestedDataSource } from '@angular/material';
import { Subscription } from 'rxjs';

import { FileTreeNode } from './treeNode.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MapFolder, MapFile } from '../../shared/map-filesystem/map-filesystem.model';
import { MapLoaderService } from '../../shared/map-loader.service';
import { CrossCodeMap } from '../../models/cross-code-map';


@Component({
    selector: 'app-map-fs-tree-view',
    templateUrl: './map-fs-tree-view.component.html',
    styleUrls: ['./map-fs-tree-view.component.scss']
})
export class MapFsTreeViewComponent implements OnInit, OnDestroy {
    @Input() sidenav!: MatSidenav;
    private fsSubcription!: Subscription;

    treeControl = new NestedTreeControl<FileTreeNode>(node => node.children);

    dataSource = new MatTreeNestedDataSource<FileTreeNode>();

    constructor(private mapFsService: MapFileSystemService,
        private mapLoaderService: MapLoaderService) { }

    ngOnInit() {
        this.dataSource.data = [];
        this.fsSubcription = this.mapFsService.fs.subscribe(
            (rootFolder) => {
                if (rootFolder) {
                    this.initFolders(rootFolder);
                } else {
                    this.dataSource.data = [];
                }

            }
        );
    }

    onClick(file: FileTreeNode) {
        this.mapFsService.loadMap(file.original).subscribe(
            (map: CrossCodeMap) => {
                map.file = file.original;
                this.mapLoaderService.loadRawMap(map);
            },
            (error: any) => {
                console.log(error);
            }
        )
    }

    private initFolders(rootFolder: MapFolder) {
        const children = [];
        for (const file of rootFolder.children) {
            children.push(new FileTreeNode(file));
        }
        this.dataSource.data = children;
    }

    hasChild = (_: number, node: FileTreeNode) => !!node.children;

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
