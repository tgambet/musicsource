import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  selectPictureAll,
  selectPictureByKey,
  selectPictureTotal,
} from '@app/database/pictures/picture.selectors';
import { Picture, PictureId } from '@app/database/pictures/picture.model';
import { map } from 'rxjs/operators';

@Injectable()
export class PictureFacade {
  constructor(private store: Store) {}

  getByKey(key: PictureId): Observable<Picture | undefined> {
    return this.store.select(selectPictureByKey(key));
  }

  getCover(key?: PictureId): Observable<string | undefined> {
    return !key
      ? of(undefined)
      : this.store
          .select(selectPictureByKey(key))
          .pipe(map((picture) => picture && picture.src));
  }

  getAll(): Observable<Picture[]> {
    return this.store.select(selectPictureAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPictureTotal);
  }
}
