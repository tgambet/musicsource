import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  pictureAdapter,
  pictureFeatureKey,
  PictureState,
} from './picture.reducer';
import { PictureId } from '@app/database/pictures/picture.model';
import { AlbumId } from '@app/database/albums/album.model';
import { SongId } from '@app/database/songs/song.model';
import { ArtistId } from '@app/database/artists/artist.model';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const selectPictureState =
  createFeatureSelector<PictureState>(pictureFeatureKey);

export const {
  selectIndexKeys: selectPictureIndexKeys,
  selectIndexEntities: selectPictureIndexEntities,
  selectIndexAll: selectPictureIndexAll,
  selectKeys: selectPictureKeys,
  selectEntities: selectPictureEntities,
  selectAll: selectPictureAll,
  selectTotal: selectPictureTotal,
} = pictureAdapter.getSelectors(selectPictureState);

export const selectPictureByKey = (key: PictureId) =>
  createSelector(selectPictureEntities, (entities) => entities[key]);

export const selectPicturesLoaded = createSelector(
  selectPictureState,
  (state) => state.loaded
);

export const selectPictureByAlbum = (id: AlbumId) =>
  createSelector(
    selectPictureEntities,
    selectPictureIndexEntities('albums'),
    (entities, index) => index[id]?.map((key) => entities[key])[0]
  );

export const selectPictureBySong = (id: SongId) =>
  createSelector(
    selectPictureEntities,
    selectPictureIndexEntities('songs'),
    (entities, index) => index[id]?.map((key) => entities[key])[0]
  );

export const selectPicturesByArtist = (id: ArtistId) =>
  createSelector(
    selectPictureEntities,
    selectPictureIndexEntities('artists'),
    (entities, index) => index[id]?.map((key) => entities[key])
  );

// export const selectPictureByFolder = (folder: string, fileNames: string[]) =>
//   createSelector(
//     selectPictureEntities,
//     selectPictureIndexEntities('entries'),
//     (entities, index) => {
//       const pictures = index[folder]?.map(
//         (key) => entities[key as any] as Picture
//       );
//       return fileNames
//         .map((name) =>
//           pictures?.find((picture) => picture.name?.startsWith(name))
//         )
//         .filter((p) => !!p)[0];
//     }
//   );
