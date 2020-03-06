import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import { MapContext } from '../components/load-map/mapContext.model';
import { CrossCodeMap } from '../models/cross-code-map';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ToolCommunicationAPIService {
  public devModLoader: any;
  constructor() { 
    // @ts-ignore
    this.devModLoader = window.DevModLoader;
  }

  getMaps(): Observable<MapContext[]>{
    return this.toObservable<MapContext[]>(this.devModLoader.getAllMaps()); 
  }

  loadJSON(jsonPath: string) {
    return this.toObservable<CrossCodeMap>(this.devModLoader.loadJSON(jsonPath));
  }

  patchJSON(jsonData: any, url: string) {
    return this.toObservable<CrossCodeMap>(this.devModLoader.loadJSON(jsonData, url));
  }

  getAssetsOverride(path: string) {
    return this.devModLoader.getAssetPathOveride(path, false);
  }

  save(path: string, data: any) {
    return this.toObservable<boolean>(this.devModLoader.save('assets/' + path, data));
  }

  private toObservable<T>(promise: Promise<T>): Observable<T> {
		return new Observable<T>(subsriber => {
			promise
				.then(value => subsriber.next(value))
				.catch(err => subsriber.error(err))
				.finally(() => subsriber.complete());
		});
	}
}
