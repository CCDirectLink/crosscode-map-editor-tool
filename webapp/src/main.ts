import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import 'hammerjs';

if (environment.production) {
	enableProdMode();
}

window.addEventListener('INJECTION_DONE', async function({detail}: any) {

	const baseUrl = detail.baseUrl;
	//@ts-ignore
	const devModLoader = window.DevModLoader = new DevModLoader;
	//@ts-ignore
	devModLoader.setBaseURL(baseUrl);
	//@ts-ignore
	await devModLoader.init();
	platformBrowserDynamic().bootstrapModule(AppModule);
});