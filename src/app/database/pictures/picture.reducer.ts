import { createReducer, on } from '@ngrx/store';
import {
  addPicture,
  loadPictures,
  loadPicturesFailure,
  loadPicturesSuccess,
  removeAllPictures,
  updatePicture,
  upsertPicture,
} from './picture.actions';
import { Picture } from '@app/database/pictures/picture.model';
import { createIDBEntityAdapter, IDBEntityState } from '@creasource/ngrx-idb';

export const pictureFeatureKey = 'pictures';

export interface PictureState
  extends IDBEntityState<Picture, 'artists' | 'albums' | 'songs'> {
  loaded: boolean;
  error?: any;
}

export const pictureAdapter = createIDBEntityAdapter<
  Picture,
  'artists' | 'albums' | 'songs'
>({
  keySelector: (model) => model.id,
  indexes: [
    { name: 'artists', multiEntry: true },
    { name: 'albums', multiEntry: true },
    { name: 'songs', multiEntry: true },
  ],
});

export const initialState = pictureAdapter.getInitialState({
  loaded: false,
});

export const pictureReducer = createReducer<PictureState>(
  initialState,

  on(removeAllPictures, (state) => pictureAdapter.removeAll(state)),
  on(loadPictures, (state) => state),
  on(loadPicturesSuccess, (state, { data }) =>
    pictureAdapter.addMany(data, { ...state, loaded: true })
  ),
  on(loadPicturesFailure, (state, { error }) => ({ ...state, error })),
  on(addPicture, (state, action) =>
    pictureAdapter.addOne(action.picture, state)
  ),
  on(upsertPicture, (state, action) =>
    pictureAdapter.upsertOne(action.picture, state)
  ),
  on(updatePicture, (state, action) =>
    pictureAdapter.updateOne(action.update, state)
  )
);
