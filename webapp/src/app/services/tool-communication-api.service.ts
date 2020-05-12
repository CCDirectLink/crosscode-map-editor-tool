import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolCommunicationAPIService {
  public devModLoader: any;
  constructor() {
    // @ts-ignore
    this.devModLoader = window.DevModLoader;
  }

  getMaps() {
    return this.devModLoader.getAllMaps();
  }

  loadJSON(jsonPath: string) {
    const fullPath = this.devModLoader.relativeToFullPath(jsonPath);
    return this.devModLoader.loadJSON(fullPath);
  }

  patchJSON(jsonData: any, url: string) {
    return this.devModLoader.loadJSON(jsonData, url);
  }


  getAssetsOverride(path: string) {
    const overrideURL = this.devModLoader.getAssetPathOveride(path);
    return this.devModLoader.relativeToFullPath(overrideURL);
  }

  makeFolder(path: string) {
    return this.devModLoader.makeFolder('assets/' + path);
  }

  save(path: string, data: any) {
    return this.devModLoader.save('assets/' + path, data);
  }
}
