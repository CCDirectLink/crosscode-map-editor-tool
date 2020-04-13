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
    return this.devModLoader.loadJSON(jsonPath);
  }

  patchJSON(jsonData: any, url: string) {
    return this.devModLoader.loadJSON(jsonData, url);
  }

  getAssetsOverride(path: string) {
    return this.devModLoader.getAssetPathOveride(path, false);
  }

  makeFolder(path: string) {
    return this.devModLoader.makeFolder('assets/' + path);
  }

  save(path: string, data: any) {
    return this.devModLoader.save('assets/' + path, data);
  }
}
