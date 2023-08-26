import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveIDBDatabaseOptions } from '@creasource/reactive-idb';
import { IndexedDBService } from './indexed-db.service';

export const Database = (name: string) => 'DATABASE_' + name;

@NgModule()
export class IndexedDBModule {
  static forRoot(
    ...databases: ReactiveIDBDatabaseOptions[]
  ): ModuleWithProviders<IndexedDBModule> {
    return {
      ngModule: IndexedDBModule,
      providers: databases.map((options) => ({
        provide: Database(options.name),
        useValue: new IndexedDBService(options),
      })),
    };
  }
}
