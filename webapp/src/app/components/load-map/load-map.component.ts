import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatSidenav, MatTreeNestedDataSource} from '@angular/material';
import {MapLoaderService} from '../../shared/map-loader.service';
import {MapNode, MapNodeRoot, MapContextNode} from './mapNode.model';
import {MapContext} from './mapContext.model';
import {VirtualMapNode} from './virtualMapNode.model';
import { ToolCommunicationAPIService } from '../../services/tool-communication-api.service';


@Component({
	selector: 'app-load-map',
	templateUrl: './load-map.component.html',
	styleUrls: ['./load-map.component.scss']
})
export class LoadMapComponent {
	
	@Input()
	sidenav!: MatSidenav;
	
	loading = false;

	treeControl = new NestedTreeControl<VirtualMapNode>(node => node.children);
	mapsSource = new MatTreeNestedDataSource<VirtualMapNode>();
	
	rootCopy: MapNodeRoot = {name: 'root', type: 'root', displayed: true, children: []}; // A copy of the root
	root: MapNodeRoot = {name: 'root', type: 'root',  displayed: true, children: []}; // The root itself is never displayed. It is used as a datasource for virtualRoot.
	virtualRoot = new VirtualMapNode(this.root); // To reuse the children filtering.
	filter = '';

	focusPath: string = '';
	
	constructor(
		private mapLoader: MapLoaderService,
		private toolCommunicationApi: ToolCommunicationAPIService,
	) {
		this.mapsSource.data = [];
		this.refresh();
	}

	findNode(nodePath: string) : MapNode {
		// split by .
		const parts = nodePath.split('.');

		let roots: MapNode[] = [];
		let root: MapNode = this.rootCopy;;
		
		for (const part of parts) {
			if (root.children === null) {
				roots.pop();
				break;
			}
			const found = root.children.filter((e: MapNode) => e.name === part);
			if (found.length) {	
				root = found[0];
				roots.push(root);
			} else {
				break;
			}
		}

		const bestRoot: MapNode| undefined = roots.pop();
		if (bestRoot) {
			return bestRoot;
		}

		return this.rootCopy;
	}
	
	onFocusChange() {
		
		// from root copy
		// find path
		let newNode: MapNode = this.findNode(this.focusPath);

		if (newNode.children) {
			this.root.children = newNode.children;
		} else {
			this.root.children = [];
		}
		this.update();	
	}
	
	refresh() {
		this.loading = false;
		this.toolCommunicationApi.getMaps().subscribe(contexts => {
			this.loading = false;
			this.displayMaps(contexts);
			this.onFocusChange();
		});
	}
	
	update() {
		this.mapsSource.data = [];
		this.mapsSource.data = this.virtualRoot.children || [];
	}
	
	loadMap(event: Event) {
		this.mapLoader.loadMap(event);
	}
	
	load(node: VirtualMapNode) {
		this.mapLoader.loadMapByPath(node.absolutePath);
	}
	
	hasChild(_: number, node: VirtualMapNode) {
		return node.children !== undefined;
	}
	
	close() {
		return this.sidenav.close();
	}
	
	private displayMaps(contexts: MapContext[]) {

		const data: MapNode[] = [];
		
		let lastPath = '';
		let lastNode;
		let root: MapContextNode = {
			name: '',
			type: 'context-root',
			path: '',
			displayed: true,
			children: []
		};
		for (const context of contexts) {
			root = {
				name: context.name,
				path: context.path,
				type: 'context-root',
				children: [],
				displayed: true
			};

			lastPath = '';
			lastNode = root.children;
			for (const path of context.children) {
				const res : any = this.resolve(root, root.children, path, lastNode, lastPath);
				let node: MapNode[] = res[0];
				let parent: MapNode = res[1];
				const name = path.substr(path.lastIndexOf('.') + 1);
				
				node.push({name, path, type: 'leaf', children: null, displayed: true, parent });
				
				lastPath = path;
				lastNode = node;
			}
			data.push(root);
		}
		this.root.children = data;
		this.rootCopy.children = data;
	}
	
	private resolve(parentNode: MapNode, data: MapNode[], path: string, lastNode: MapNode[], lastPath: string): [MapNode[], MapNode| null] {
		if (path.substr(0, path.lastIndexOf('.')) === lastPath.substr(0, lastPath.lastIndexOf('.'))) {
			const lastAddedNode = lastNode[lastNode.length - 1];
			if (lastAddedNode.parent) {
				return [lastNode, lastAddedNode.parent];
			} else {
				return [lastNode, null];
			}
			
		}
		
		if (!path.includes('.')) {
			return [data, parentNode];
		}
		

		let parent = parentNode;
		let node = data;
		const parts = path
			.substr(0, path.lastIndexOf('.'))
			.split('.');
		for (const name of parts) {
			const child = node.find(n => n.name === name);
			if (child && child.children) {
				parent = child;
				node = child.children;
			} else {
				const children: MapNode[] = [];
				const newNode: MapNodeRoot = {
					name: name,
					children: children,
					type: 'root',
					displayed: true,
					parent
				};
				node.push(newNode);
				parent = newNode;
				node = children;
			}
		}
		return [node, parent];
	}
	
	private filterNode(node: MapNode, filter: string): boolean {
		if (node.name.includes(filter)) {
			node.displayed = true;
			this.displayChildren(node);
			return true;
		}
		
		if (!node.children) {
			node.displayed = false;
			return false;
		}
		
		let displayed = false;
		for (const child of node.children) {
			if (this.filterNode(child, filter)) {
				displayed = true;
			}
		}
		
		node.displayed = displayed;
		return displayed;
	}
	
	private displayChildren(node: MapNode) {
		if (!node.children) {
			return;
		}
		
		for (const child of node.children) {
			child.displayed = true;
			this.displayChildren(child);
		}
	}
}
