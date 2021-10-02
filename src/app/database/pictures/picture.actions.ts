import { createAction, props } from '@ngrx/store';
import { Picture } from '@app/database/pictures/picture.model';

export const loadPictures = createAction('[Picture] Load Pictures');

export const loadPicturesSuccess = createAction(
  '[Picture] Load Pictures Success',
  props<{ data: Picture[] }>()
);

export const loadPicturesFailure = createAction(
  '[Picture] Load Pictures Failure',
  props<{ error: any }>()
);
