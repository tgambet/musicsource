import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  pictureAdapter,
  pictureFeatureKey,
  PictureState,
} from './picture.reducer';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export const selectPictureState =
  createFeatureSelector<PictureState>(pictureFeatureKey);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  pictureAdapter.getSelectors();

export const selectAllPictures = createSelector(selectPictureState, selectAll);

export const selectPictureEntities = createSelector(
  selectPictureState,
  selectEntities
);

export const selectPictureIds = createSelector(selectPictureState, selectIds);

export const selectPictureTotal = createSelector(
  selectPictureState,
  selectTotal
);

export const selectPictureByHash = (hash: string) =>
  createSelector(selectPictureEntities, (entities) => entities[hash]);
