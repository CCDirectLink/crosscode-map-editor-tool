/**
 * An interface that contains the full information about a map tree.
 */
export interface MapNode {
	name: string;
	displayed: boolean;
	path?: string;
	children?: MapNode[];
}

export interface MapNodeRoot extends MapNode {
	children: MapNode[];
}

export interface MapContextNode extends MapNodeRoot {}