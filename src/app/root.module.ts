import { NgModule } from '@angular/core';
import { RootComponent } from '@app/root.component';
import { UpdateService } from '@app/update.service';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@env/environment';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
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

export const debug =
  (reducer: ActionReducer<any>): ActionReducer<any> =>
  (state, action) => {
    console.log('action', action);
    return reducer(state, action);
  };

export const metaReducers: MetaReducer<any>[] = [];

@NgModule({
  declarations: [RootComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'disabled',
      // anchorScrolling: 'enabled',
      // onSameUrlNavigation: 'reload',
      preloadingStrategy: PreloadAllModules,
    }),
    StoreModule.forRoot(
      {},
      {
        metaReducers,
        runtimeChecks: {
          strictStateSerializability: false,
          strictActionSerializability: false,
          strictStateImmutability: false,
          strictActionImmutability: false,
          strictActionWithinNgZone: false,
          strictActionTypeUniqueness: false,
        },
      },
    ),
    EffectsModule.forRoot([]),
    // StoreDevtoolsModule.instrument({
    //   maxAge: 15,
    //   logOnly: true,
    //   actionsSafelist: ['scanner/extract/failure'],
    // }),
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
