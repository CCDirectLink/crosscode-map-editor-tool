import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import 'hammerjs';

if (environment.production) {
	enableProdMode();
}

(window as any).importOfflineScripts().then(({DevModLoader} : any) => {
	const devModLoader = new DevModLoader;
	(window as any).DevModLoader = devModLoader;
	devModLoader.init().then(() => {
		platformBrowserDynamic().bootstrapModule(AppModule);
	});
	
});

