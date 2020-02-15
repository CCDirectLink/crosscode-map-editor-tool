import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToolLauncherAPIService {

  constructor() { 
    // @ts-ignore
    console.log(window.TOOL_LAUNCHER);
  }

  getMaps() {
    
  }
}
