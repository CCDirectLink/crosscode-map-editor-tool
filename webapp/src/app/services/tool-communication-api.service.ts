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
    this.devModLoader.init();
  }

  getMaps(): Observable<MapContext[]>{
    const samples: MapContext[] = [
      {name: 'CrossCode', path: '', children: ['a.b']},
      {name: 'mod1', path: '', children: ['a.b']}
    ];
    return this.toObservable<MapContext[]>(Promise.resolve(samples));
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
