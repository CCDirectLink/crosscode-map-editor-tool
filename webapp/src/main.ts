import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import 'hammerjs';

if (environment.production) {
	enableProdMode();
}

(window as any).importOfflineScripts().then(({DevModLoader} : any) => {
	(window as any).DevModLoader = new DevModLoader;
	platformBrowserDynamic().bootstrapModule(AppModule);
});

