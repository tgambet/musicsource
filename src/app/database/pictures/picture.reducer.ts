import { createReducer, on } from '@ngrx/store';
import {
  loadPictures,
  loadPicturesFailure,
  loadPicturesSuccess,
  removeAllPictures,
} from './picture.actions';
import { Picture } from '@app/database/pictures/picture.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';

export const pictureFeatureKey = 'pictures';

export type PictureState = IDBEntityState<Picture, never>;

export const pictureAdapter = createIDBEntityAdapter<Picture, never>({
  keySelector: (model) => model.id,
  indexes: [],
});

export const initialState = pictureAdapter.getInitialState();

export const pictureReducer = createReducer(
  initialState,

  on(removeAllPictures, (state) => pictureAdapter.removeAll(state)),
  on(loadPictures, (state) => state),
  on(loadPicturesSuccess, (state, { data }) =>
    pictureAdapter.addMany(data, state)
  ),
  on(loadPicturesFailure, (state) => state)
);
