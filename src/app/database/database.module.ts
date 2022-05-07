import { NgModule } from '@angular/core';
import { IndexedDBModule } from '@creasource/ngx-idb';
import { DatabaseService } from '@app/database/database.service';
import { ReactiveIDBDatabaseOptions } from '@creasource/reactive-idb';
import { EffectsModule } from '@ngrx/effects';
import { AlbumEffects } from '@app/database/albums/album.effects';
import { ArtistEffects } from '@app/database/artists/artist.effects';
import { EntryEffects } from '@app/database/entries/entry.effects';
import { PictureEffects } from '@app/database/pictures/picture.effects';
import { PlaylistEffects } from '@app/database/playlists/playlist.effects';
import { SongEffects } from '@app/database/songs/song.effects';
import { StoreModule } from '@ngrx/store';
import {
  albumFeatureKey,
  albumReducer,
} from '@app/database/albums/album.reducer';
import {
  artistFeatureKey,
  artistReducer,
} from '@app/database/artists/artist.reducer';
import {
  entryFeatureKey,
  entryReducer,
} from '@app/database/entries/entry.reducer';
import {
  pictureFeatureKey,
  pictureReducer,
} from '@app/database/pictures/picture.reducer';
import {
  playlistFeatureKey,
  playlistReducer,
} from '@app/database/playlists/playlist.reducer';
import { songFeatureKey, songReducer } from '@app/database/songs/song.reducer';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { EntryFacade } from '@app/database/entries/entry.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { SettingsFacade } from '@app/database/settings/settings.facade';
import { SettingsEffects } from '@app/database/settings/settings.effects';

const musicSourceDatabase: ReactiveIDBDatabaseOptions = {
  name: 'musicsource',
  schema: [
    {
      version: 2,
      stores: [
        {
          name: 'settings',
        },
      ],
    },
    {
      version: 1,
      stores: [
        {
          name: 'entries',
          options: { keyPath: 'path' },
          indexes: ['parent'],
        },
        {
          name: 'songs',
          options: { keyPath: 'entryPath' },
          indexes: [
            // { name: 'artists', options: { multiEntry: true } },
            // { name: 'genre', options: { multiEntry: true } },
            // 'album',
            'title',
            'likedOn',
            'updatedOn',
          ],
        },
        {
          name: 'pictures',
          options: { keyPath: 'id' },
          indexes: [
            {
              name: 'artists',
              keyPath: 'artists',
              options: { multiEntry: true },
            },
            {
              name: 'albums',
              keyPath: 'albums',
              options: { multiEntry: true },
            },
            {
              name: 'songs',
              keyPath: 'songs',
              options: { multiEntry: true },
            },
          ],
        },
        {
          name: 'albums',
          options: { keyPath: 'id' },
          indexes: [
            'title',
            'year',
            'artistId',
            // { name: 'artists', options: { multiEntry: true } },
            // 'year',
            // 'albumArtist',
            'likedOn',
            'updatedOn',
          ],
        },
        {
          name: 'artists',
          options: { keyPath: 'id' },
          indexes: ['name', 'likedOn', 'updatedOn'],
        },
        {
          name: 'playlists',
          options: { keyPath: 'id' },
          indexes: ['title', 'createdOn'],
        },
      ],
    },
  ],
};

@NgModule({
  declarations: [],
  imports: [
    IndexedDBModule.forRoot(musicSourceDatabase),
    EffectsModule.forFeature([
      AlbumEffects,
      ArtistEffects,
      EntryEffects,
      PictureEffects,
      PlaylistEffects,
      SongEffects,
      SettingsEffects,
    ]),
    StoreModule.forFeature(albumFeatureKey, albumReducer),
    StoreModule.forFeature(artistFeatureKey, artistReducer),
    StoreModule.forFeature(entryFeatureKey, entryReducer),
    StoreModule.forFeature(pictureFeatureKey, pictureReducer),
    StoreModule.forFeature(playlistFeatureKey, playlistReducer),
    StoreModule.forFeature(songFeatureKey, songReducer),
  ],
  providers: [
    DatabaseService,
    AlbumFacade,
    ArtistFacade,
    EntryFacade,
    PictureFacade,
    PlaylistFacade,
    SongFacade,
    SettingsFacade,
  ],
})
export class DatabaseModule {}
