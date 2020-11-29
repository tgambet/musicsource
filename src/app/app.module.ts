import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TitleComponent } from './common/components/title.component';
import { LabelComponent } from './common/components/label.component';
import { ArtistComponent } from './common/components/artist.component';
import { MatRippleModule } from '@angular/material/core';
import { AlbumComponent } from './common/components/album.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GenreComponent } from './common/components/genre.component';

@NgModule({
  declarations: [
    AppComponent,
    TitleComponent,
    LabelComponent,
    ArtistComponent,
    AlbumComponent,
    GenreComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
