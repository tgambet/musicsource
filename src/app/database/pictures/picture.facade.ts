import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectPictureAll,
  selectPictureByHash,
  selectPictureTotal,
} from '@app/database/pictures/picture.selectors';
import { Picture } from '@app/database/pictures/picture.model';

@Injectable()
export class PictureFacade {
  constructor(private store: Store) {}

  getAll(): Observable<Picture[]> {
    return this.store.select(selectPictureAll);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPictureTotal);
  }

  getByHash(hash: string): Observable<Picture | undefined> {
    return this.store.select(selectPictureByHash(hash));
  }
}
