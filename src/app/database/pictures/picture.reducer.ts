import { createReducer, on } from '@ngrx/store';
import * as PictureActions from './picture.actions';
import { Picture } from '@app/database/pictures/picture.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';

export const pictureFeatureKey = 'pictures';

export type PictureState = IDBEntityState<Picture, never>;

export const pictureAdapter = createIDBEntityAdapter<Picture, never>({
  keySelector: (model) => model.hash,
  indexes: [],
});

export const initialState = pictureAdapter.getInitialState();

export const pictureReducer = createReducer(
  initialState,

  on(PictureActions.loadPictures, (state) => state),
  on(PictureActions.loadPicturesSuccess, (state, { data }) =>
    pictureAdapter.addMany(data, state)
  ),
  on(PictureActions.loadPicturesFailure, (state, action) => state)
);
