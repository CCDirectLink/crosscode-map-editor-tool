import { Injectable } from '@angular/core';
import {Observable} from "rxjs";

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

  getMaps(): Observable<string[]>{
    return this.toObservable<string[]>(Promise.resolve(["a.b"]));
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
