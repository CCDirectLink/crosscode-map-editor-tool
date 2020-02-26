import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolCommunicationAPIService {
  public devModLoader: any;
  constructor() { 
    // @ts-ignore
    console.log(window.DevModLoader);
    this.devModLoader = null;
  }

  getMaps() {
    
  }
}
