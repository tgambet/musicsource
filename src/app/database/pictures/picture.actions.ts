import { createAction, props } from '@ngrx/store';
import { Picture } from '@app/database/pictures/picture.model';
import { IdUpdate } from '@app/core/utils';

export const removeAllPictures = createAction('pictures/remove-all');

export const loadPictures = createAction('[Picture] Load Pictures');

export const loadPicturesSuccess = createAction(
  '[Picture] Load Pictures Success',
  props<{ data: Picture[] }>()
);

export const loadPicturesFailure = createAction(
  '[Picture] Load Pictures Failure',
  props<{ error: any }>()
);

export const addPicture = createAction(
  'pictures/add',
  props<{ picture: Picture }>()
);

export const updatePicture = createAction(
  'pictures/update',
  props<{ update: IdUpdate<Picture> }>()
);

export const upsertPicture = createAction(
  'pictures/upsert',
  props<{ picture: Picture }>()
);
