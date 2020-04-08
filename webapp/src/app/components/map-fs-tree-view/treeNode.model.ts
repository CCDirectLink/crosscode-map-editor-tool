import { MapFile, MapFolder } from "../../shared/map-filesystem/map-filesystem.model";

export class FileTreeNode {
    name: string;
    original: MapFile;
    children!: FileTreeNode[];

    constructor(original: MapFile) {
        this.name = original.name;
        this.original = original;
        if (original instanceof MapFolder) {
            this.children = original.children.map(child => new FileTreeNode(child));
        }
    }
}