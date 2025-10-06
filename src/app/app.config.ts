import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import { UserOutline, LockOutline, EyeInvisibleOutline, EyeOutline } from '@ant-design/icons-angular/icons';
import es from '@angular/common/locales/es';

import { routes } from './app.routes';

registerLocaleData(es);

const icons: IconDefinition[] = [UserOutline, LockOutline, EyeInvisibleOutline, EyeOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNzI18n(es_ES),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideNzIcons(icons)
  ]
};
