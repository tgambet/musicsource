import { createReducer, on } from '@ngrx/store';
import * as PictureActions from './picture.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Picture } from '@app/database/pictures/picture.model';

export const pictureFeatureKey = 'pictures';

export type PictureState = EntityState<Picture>;

export const pictureAdapter: EntityAdapter<Picture> =
  createEntityAdapter<Picture>({
    selectId: (model) => model.hash,
  });

export const initialState: PictureState = pictureAdapter.getInitialState();

export const pictureReducer = createReducer(
  initialState,

  on(PictureActions.loadPictures, (state) => state),
  // on(PictureActions.loadPicturesSuccess, (state, { data }) =>
  //   pictureAdapter.setAll(data, state)
  // ),
  on(PictureActions.loadPicturesSuccess, (state, { data }) =>
    pictureAdapter.addMany(data, state)
  ),
  on(PictureActions.loadPicturesFailure, (state, action) => state)
);
