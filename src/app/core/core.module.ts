import { NgModule } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { CdkTreeModule } from '@angular/cdk/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { ReactiveFormsModule } from '@angular/forms';
import { DurationPipe } from '@app/core/pipes/duration.pipe';
import { RoutedDialogDirective } from '@app/core/directives/routed-dialog.directive';
import { TitleComponent } from '@app/core/components/title.component';
import { CoverComponent } from '@app/core/components/cover.component';
import {
  HListComponent,
  HListItemDirective,
} from '@app/core/components/h-list.component';
import { IconComponent } from '@app/core/components/icon.component';
import { LabelComponent } from '@app/core/components/label.component';
import { MenuComponent } from '@app/core/components/menu.component';
import { TopBarComponent } from '@app/core/components/top-bar.component';
import { CommonModule } from '@angular/common';
import { PlayerButtonComponent } from '@app/core/components/player-button.component';
import { IconLikesComponent } from '@app/core/components/icon-likes.component';
import { IconLikes2Component } from '@app/core/components/icon-likes2.component';
import { ContainerComponent } from '@app/core/components/container.component';
import { ContainerPageComponent } from '@app/core/components/container-page.component';
import { SongListComponent } from '@app/core/components/song-list.component';
import { SongListItemComponent } from '@app/core/components/song-list-item.component';
import { RouterModule } from '@angular/router';
import { ContainerHomeComponent } from '@app/core/components/container-home.component';
import { GenreComponent } from '@app/core/components/genre.component';
import { SelectComponent } from '@app/core/components/select.component';
import { TrackListItemComponent } from '@app/core/components/track-list-item.component';
import { AlbumComponent } from '@app/core/components/album.component';
import { ArtistComponent } from '@app/core/components/artist.component';
import { PlaylistComponent } from '@app/core/components/playlist.component';
import { PlaylistLikesComponent } from '@app/core/components/playlist-likes.component';
import { PlaylistNewComponent } from '@app/core/dialogs/playlist-new.component';
import { PlaylistAddComponent } from '@app/core/dialogs/playlist-add.component';
import { HistoryService } from '@app/core/services/history.service';
import { ArtistListItemComponent } from '@app/core/components/artist-list-item.component';
import { ConfirmComponent } from '@app/core/dialogs/confirm.component';
import { FiltersComponent } from '@app/core/components/filters.component';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { RouterComponent } from '@app/core/components/router.component';
import {
  ListComponent,
  OptMatRippleDirective,
} from '@app/core/components/list.component';
import { LinkComponent } from '@app/core/components/link.component';

const IMPORTS = [
  CommonModule,
  A11yModule,
  CdkTreeModule,
  DragDropModule,
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatInputModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatSnackBarModule,
  MatTabsModule,
  ReactiveFormsModule,
  RouterModule,
];

const DECLARATIONS = [
  AlbumComponent,
  ArtistComponent,
  ArtistListItemComponent,
  ConfirmComponent,
  ContainerComponent,
  ContainerHomeComponent,
  ContainerPageComponent,
  CoverComponent,
  DurationPipe,
  FiltersComponent,
  GenreComponent,
  HListComponent,
  HListItemDirective,
  IconComponent,
  IconLikes2Component,
  IconLikesComponent,
  LabelComponent,
  LinkComponent,
  ListComponent,
  MenuComponent,
  OptMatRippleDirective,
  PlaylistComponent,
  PlaylistNewComponent,
  PlaylistAddComponent,
  PlaylistLikesComponent,
  PlayerButtonComponent,
  // RecentActivityComponent,
  RouterComponent,
  SelectComponent,
  RoutedDialogDirective,
  SongListComponent,
  SongListItemComponent,
  TitleComponent,
  TopBarComponent,
  TrackListItemComponent,
];

const PROVIDERS = [
  // AudioService,
  // ExtractorService,
  // FileService,
  HistoryService,
  // MediaSessionService,
  // ResizerService,
  // StorageService,
  // LibraryFacade,
  // PlayerFacade,
];

@NgModule({
  declarations: DECLARATIONS,
  imports: IMPORTS,
  providers: PROVIDERS,
  exports: [...IMPORTS, ...DECLARATIONS],
})
export class CoreModule {}
