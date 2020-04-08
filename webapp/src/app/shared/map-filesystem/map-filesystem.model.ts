export enum MapFileType {
    FOLDER,
    FILE
}

export interface IMapFile {
    type: MapFileType;
    name: string;
    path: string;
}

export class MapFile {
    private details: IMapFile;
    private _parent: MapFile | null = null;
    private fullPath: string = '';
    private _root = false;

    private _relPath = '';
    constructor(_details: IMapFile, parent: MapFolder | null) {
        this.details = _details;
        this.setParent(parent);
    }

    setParent(parent: MapFolder | null) {
        this._parent = parent;

        if (parent) {
            this.fullPath = parent.absolutePath + this.path;
        } else {
            this.fullPath = this.path;
        }
    }

    setRelativePath() {
        if (!this.isRoot) {
            let paths = [];
            let parentFile;
            let currentFile: MapFile = this;
            do {
                parentFile = currentFile.parent;
                paths.push(currentFile.name);
                if (parentFile) {
                    currentFile = parentFile;
                }
            } while (parentFile && !parentFile.isRoot);
            this._relPath = paths.reverse().join('/');
        }
    }

    set isRoot(value: boolean) {
        this._root = value;
    }

    get isRoot() {
        return this._root;
    }

    get name() {
        return this.details.name;
    }

    clear() {
        this._parent = null;
    }


    get parent() {
        return this._parent;
    }

    get absolutePath() {
        return this.fullPath;
    }

    get relativePath() {
        return this._relPath;
    }

    get path() {
        return this.details.path;
    }
}

export class MapFolder extends MapFile {
    private _children: MapFile[] = [];

    addChild(child: IMapFile): MapFile | MapFolder {
        let file: MapFile | MapFolder;
        if (child.type === MapFileType.FILE) {
            file = this.addChildFile(child);
        } else {
            file = this.addChildFolder(child);
        }

        return file;
    }

    addChildFile(child: IMapFile): MapFile {
        let file = new MapFile(child, this);
        this._children.push(file);
        return file;
    }

    addChildFolder(child: IMapFile): MapFolder {
        let folder = new MapFolder(child, this);
        this._children.push(folder);
        return folder;
    }

    findChildByName(name: string): MapFile | MapFolder | null {
        for (let i = 0; i < this._children.length; ++i) {
            const child = this._children[i];

            if (child instanceof MapFolder) {
                if (child.name === name) {
                    return child;
                }
            } else {
                if (child.path === name) {
                    return child;
                }
            }

        }
        return null;
    }

    removeChildByName(name: string) {
        for (let i = 0; i < this._children.length; ++i) {
            const child = this._children[i];

            if (child.name === name) {
                this._children.splice(i, 1);
                break;
            }
        }
    }

    clear() {
        super.clear();
        for (const child of this._children) {
            child.clear();
        }
        this._children.splice(0);
    }

    get children(): MapFile[] {
        return this._children.slice(0);
    }
}
