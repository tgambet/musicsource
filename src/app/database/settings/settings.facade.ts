import { Injectable } from '@angular/core';
import { DatabaseService } from '@app/database/database.service';
import { Observable } from 'rxjs';
import { Settings } from '@app/database/settings/settings.model';
import { Store } from '@ngrx/store';
import { clearDatabase } from '@app/database/settings/settings.actions';

@Injectable()
export class SettingsFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  clearDatabase(): void {
    this.store.dispatch(clearDatabase());
  }

  getRootDirectory(): Observable<Settings['rootDirectory'] | undefined> {
    return this.database.get$<Settings['rootDirectory']>(
      'settings',
      'rootDirectory'
    );
  }

  setRootDirectory(
    directory: Settings['rootDirectory']
  ): Observable<IDBValidKey> {
    return this.database.put$('settings', directory, 'rootDirectory');
  }
}
