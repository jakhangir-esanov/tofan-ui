import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { API_ORIGIN } from './core/config/api-origin';
import { serverApiOrigin } from './core/config/api-origin.server';
import { serverRoutes } from './routes/app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: API_ORIGIN, useFactory: serverApiOrigin },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
