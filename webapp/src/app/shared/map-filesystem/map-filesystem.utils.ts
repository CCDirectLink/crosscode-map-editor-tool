import { MapFolder, MapFile, IMapFile, MapFileType } from "./map-filesystem.model";

export class MapFileSystemUtils {
    /**
     * 
     * @param root {MapFolder}
     * @param maps {}
     */
    static generateFromMapTree(root: MapFolder, maps: any) {
        for (const map of maps) {
            const mapFolder: IMapFile = {
                type: MapFileType.FOLDER,
                name: map.name,
                path: map.path
            };

            const cacheSubFolders: any = {

            };

            const parent: MapFolder = root.addChildFolder(mapFolder);

            parent.isRoot = true;
            parent.setRelativePath();
            for (const childPath of map.children) {
                const pathParts = childPath.split('/');
                let subParent: MapFolder = parent;
                let subCacheFolder: any = cacheSubFolders;
                for (let i = 0; i < pathParts.length; i++) {
                    const pathPart = pathParts[i];


                    if (i < pathParts.length - 1) {
                        if (!subCacheFolder[pathPart]) {
                            subCacheFolder[pathPart] = {
                                value: subParent.addChildFolder({
                                    type: MapFileType.FOLDER,
                                    name: pathPart,
                                    path: pathPart + '/'
                                }),
                                children: {}
                            };
                        }
                        subParent = subCacheFolder[pathPart].value;
                        subParent.setRelativePath();
                        subCacheFolder = subCacheFolder[pathPart].children;
                    } else if (pathPart.length) {
                        let fileName: string = pathPart;
                        if (!fileName.endsWith('.json')) {
                            continue;
                        }

                        fileName = fileName.substring(0, fileName.length - 5);

                        const leafFile = subParent.addChildFile({
                            type: MapFileType.FILE,
                            name: fileName,
                            path: pathPart
                        });
                        leafFile.setRelativePath();
                    }

                }
            }
        }
    }
    /**
     * 
     * @param {string} path (virtual) to target folder
     * @returns {MapFolder| null}
     */
    static resolveFolderPath(root: MapFolder, path: string): MapFolder {

        if (path.length) {
            const fileNames = path.split('/');
            for (let i = 0; i < fileNames.length; ++i) {
                const child: MapFile | MapFolder | null = root.findChildByName(fileNames[i]);

                if (!child) {
                    throw `${fileNames.slice(0, i + 1).join('/')} does not exist.`;
                } else if (!(child instanceof MapFolder)) {
                    throw `${fileNames.slice(0, i).concat(child.name).join('/')} is a MapFile.`;
                } else {
                    root = child;
                }
            }
        }
        return root;
    }

    /**
 * 
 * @param {string} path (virtual) to target folder
 * @returns {MapFile | null}
 */
    static resolveFilePath(root: MapFolder, path: string): MapFile | null {
        const pathParts = path.split('/');
        let rootFolder: MapFolder = MapFileSystemUtils.resolveFolderPath(root, pathParts.slice(0, -1).join('/'));

        let fileName = pathParts[pathParts.length - 1];
        return rootFolder.findChildByName(fileName);
    }
}