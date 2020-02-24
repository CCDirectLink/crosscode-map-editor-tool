import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolCommunicationAPIService {

  constructor() { 
    // @ts-ignore
    console.log(window.toolsApi);
  }

  getMaps() {
    
  }
}
