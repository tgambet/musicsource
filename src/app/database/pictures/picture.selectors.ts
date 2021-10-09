import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  pictureAdapter,
  pictureFeatureKey,
  PictureState,
} from './picture.reducer';
import { PictureId } from '@app/database/pictures/picture.model';

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
