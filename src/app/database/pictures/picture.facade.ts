import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
  selectPictureAll,
  selectPictureByKey,
  selectPictureTotal,
} from '@app/database/pictures/picture.selectors';
import { getCover, Picture } from '@app/database/pictures/picture.model';
import { map } from 'rxjs/operators';

@Injectable()
export class PictureFacade {
  constructor(private store: Store) {}

  getByKey(key: string): Observable<Picture | undefined> {
    return this.store.select(selectPictureByKey(key));
  }

  getCover(hash?: string): Observable<string | undefined> {
    return !hash
      ? of(undefined)
      : this.store
          .select(selectPictureByKey(hash))
          .pipe(map((picture) => picture && getCover(picture)));
  }

  getAll(): Observable<Picture[]> {
    return this.store.select(selectPictureAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPictureTotal);
  }

  getByHash(hash: string): Observable<Picture | undefined> {
    return this.store.select(selectPictureByKey(hash));
  }
}
