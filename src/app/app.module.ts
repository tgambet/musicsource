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
import { ExplorerComponent } from './pages/explorer.component';
import { RoutedDialogDirective } from '@app/directives/routed-dialog.directive';
import { LibrarySettingsComponent } from './dialogs/library-settings.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SettingsComponent } from './dialogs/settings.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StoreModule } from '@ngrx/store';
import { reducers } from '@app/store';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from '@app/store/library';
import { FileService } from '@app/services/file.service';
import { ScanComponent } from '@app/dialogs/scan.component';
import { ScannerEffects } from '@app/store/scanner';
import { ExtractorService } from '@app/services/extractor.service';
import { ResizerService } from '@app/services/resizer.service';
import { LibraryFacade } from '@app/store/library/library.facade';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';
import { AlbumPageComponent } from './pages/album-page.component';
import { ArtistPageComponent } from './pages/artist-page.component';
import { ContainerComponent } from './components/container.component';
import { ContainerHomeComponent } from './components/container-home.component';
import { ContainerPageComponent } from './components/container-page.component';
import { SongListComponent } from './components/song-list.component';
import { DurationPipe } from '@app/pipes/duration.pipe';
import { TrackListComponent } from '@app/components/track-list.component';
import { MatTabsModule } from '@angular/material/tabs';
import { LibraryAlbumsComponent } from './pages/library-albums.component';
import { SelectComponent } from './components/select.component';

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
    ExplorerComponent,
    RoutedDialogDirective,
    LibrarySettingsComponent,
    SettingsComponent,
    ScanComponent,
    AlbumPageComponent,
    ArtistPageComponent,
    ContainerComponent,
    ContainerHomeComponent,
    ContainerPageComponent,
    SongListComponent,
    TrackListComponent,
    DurationPipe,
    LibraryAlbumsComponent,
    SelectComponent,
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
    DragDropModule,
    A11yModule,
    MatDialogModule,
    MatTabsModule,
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictActionWithinNgZone: false,
        strictActionTypeUniqueness: false,
      },
    }),
    EffectsModule.forRoot([LibraryEffects, ScannerEffects]),
    // StoreDevtoolsModule.instrument({ maxAge: 150, logOnly: true }),
  ],
  providers: [
    FileService,
    ExtractorService,
    ResizerService,
    LibraryFacade,
    ScannerFacade,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
