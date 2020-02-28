import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import { MapContext } from '../components/load-map/mapContext.model';

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

  private toObservable<T>(promise: Promise<T>): Observable<T> {
		return new Observable<T>(subsriber => {
			promise
				.then(value => subsriber.next(value))
				.catch(err => subsriber.error(err))
				.finally(() => subsriber.complete());
		});
	}
}
