import { MapNode } from './mapNode.model';

/**
 * A class that only returns the children that are included in the filter.
 */
export class VirtualMapNode {
    private original: MapNode;
    private knownChildren = new WeakMap<MapNode, VirtualMapNode>();

    public constructor(original: MapNode) {
        this.original = original;

        if (original.children) {
            for (const node of original.children) {
                this.knownChildren.set(node, new VirtualMapNode(node));
            }
        }
    }

    addMapNode(newNode: MapNode) {
        const original = this.original;

        newNode.parent = original;

        if (!original.children) {
            original.children = [];
        }

        original.children.push(newNode);

        const virtualNode = new VirtualMapNode(newNode);
        this.knownChildren.set(newNode, virtualNode);
        return virtualNode;
    }

    public get name(): string {
        return this.original.name;
    }

    public get path(): string | undefined {
        return this.original.path;
    }

    public get children(): VirtualMapNode[] | undefined {
        if (!this.original.children) {
            return undefined;
        }

        return this.original.children
            .filter(n => n.displayed)
            .map(n => this.resolve(n));
    }

    public get absolutePath(): string {
        let currentPath = '';
        let node: MapNode | null = this.original;
        do {
            if (node) {
                if (node.type === 'root') {
                    currentPath = node.name + '/' + currentPath;
                } else if (node.type === 'leaf') {
                    currentPath += node.name + '.json';
                } else if (node.type === 'context-root') {
                    currentPath = node.path + currentPath;
                }
                node = node.parent || null;
            } else {
                node = null;
            }

        } while (node !== null);

        return currentPath;
    }

    private resolve(node: MapNode): VirtualMapNode {
        const known = this.knownChildren.get(node);
        if (known) {
            return known;
        }

        const result = new VirtualMapNode(node);
        this.knownChildren.set(node, result);
        return result;
    }
}
