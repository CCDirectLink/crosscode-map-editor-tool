import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import { MapContext } from '../components/load-map/mapContext.model';
import { CrossCodeMap } from '../models/cross-code-map';

@Injectable({
  providedIn: 'root'
})
export class ToolCommunicationAPIService {
  public devModLoader: any;
  constructor() { 
    // @ts-ignore
    this.devModLoader = window.DevModLoader;

    this.devModLoader.setBaseURL('http://localhost:8080/assets/');
    
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

  private toObservable<T>(promise: Promise<T>): Observable<T> {
		return new Observable<T>(subsriber => {
			promise
				.then(value => subsriber.next(value))
				.catch(err => subsriber.error(err))
				.finally(() => subsriber.complete());
		});
	}
}
