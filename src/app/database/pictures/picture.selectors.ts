import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  pictureAdapter,
  pictureFeatureKey,
  PictureState,
} from './picture.reducer';

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

export const selectPictureByHash = (hash: string) =>
  createSelector(selectPictureEntities, (entities) => entities[hash]);
