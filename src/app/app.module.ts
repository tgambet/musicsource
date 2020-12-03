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
import { MatButtonModule } from '@angular/material/button';
import { GenreComponent } from './common/components/genre.component';
import { MenuComponent } from './common/components/menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from './common/components/icon.component';
import { PlayerButtonComponent } from './common/components/player-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongComponent } from './common/components/song.component';
import { PlaylistComponent } from './common/components/playlist.component';
import { A11yModule } from '@angular/cdk/a11y';
import { CoverComponent } from './common/components/cover.component';
import { MixComponent } from './common/components/mix.component';
import { TopBarComponent } from './common/components/top-bar.component';
import {
  HListComponent,
  HListItemDirective,
} from './common/components/h-list.component';

@NgModule({
  declarations: [
    AppComponent,
    TitleComponent,
    LabelComponent,
    ArtistComponent,
    AlbumComponent,
    GenreComponent,
    MenuComponent,
    IconComponent,
    PlayerButtonComponent,
    SongComponent,
    PlaylistComponent,
    CoverComponent,
    MixComponent,
    TopBarComponent,
    HListItemDirective,
    HListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    MatRippleModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    A11yModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
