import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@env/environment';
import { TitleComponent } from './components/title.component';
import { LabelComponent } from './components/label.component';
import { ArtistComponent } from './components/artist.component';
import { MatRippleModule } from '@angular/material/core';
import { AlbumComponent } from './components/album.component';
import { MatButtonModule } from '@angular/material/button';
import { GenreComponent } from './components/genre.component';
import { MenuComponent } from './components/menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from './components/icon.component';
import { PlayerButtonComponent } from './components/player-button.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SongComponent } from './components/song.component';
import { PlaylistComponent } from './components/playlist.component';
import { A11yModule } from '@angular/cdk/a11y';
import { CoverComponent } from './components/cover.component';
import { MixComponent } from './components/mix.component';
import { TopBarComponent } from './components/top-bar.component';
import {
  HListComponent,
  HListItemDirective,
} from './components/h-list.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkTreeModule } from '@angular/cdk/tree';
import { HomeComponent } from './pages/home.component';
import { LibraryComponent } from './pages/library.component';
import { SearchComponent } from './pages/search.component';
import { HistoryComponent } from './pages/history.component';

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
    HomeComponent,
    LibraryComponent,
    SearchComponent,
    HistoryComponent,
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
    MatSnackBarModule,
    CdkTreeModule,
    A11yModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
