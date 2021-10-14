import { NgModule } from '@angular/core';
import { RootComponent } from '@app/root.component';
import { UpdateService } from '@app/update.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@env/environment';
import { RouterModule, Routes } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: '',
    loadChildren: () => import('./main/main.module').then((m) => m.MainModule),
  },
  // { path: '**', component: WelcomeComponent }, // TODO Not found component
];

@NgModule({
  declarations: [RootComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'disabled',
      // anchorScrolling: 'enabled',
      // onSameUrlNavigation: 'reload',
    }),
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          strictStateSerializability: false,
          strictActionSerializability: false,
          strictStateImmutability: false,
          strictActionImmutability: false,
          strictActionWithinNgZone: false,
          strictActionTypeUniqueness: false,
        },
      }
    ),
    EffectsModule.forRoot([]),
    // StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: true }),
    MatSnackBarModule,
  ],
  providers: [UpdateService],
  bootstrap: [RootComponent],
})
export class RootModule {
  constructor(update: UpdateService) {
    update.register();
  }
}
