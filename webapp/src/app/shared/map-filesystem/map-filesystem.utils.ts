import { MapFolder, MapFile } from "./map-filesystem.model";

export class MapFileSystemUtils {
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