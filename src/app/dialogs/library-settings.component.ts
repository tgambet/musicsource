import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsComponent } from '@app/dialogs/settings.component';
import { Icons } from '@app/utils/icons.util';
import { NestedTreeControl } from '@angular/cdk/tree';
import { EMPTY, Observable } from 'rxjs';
import { DirectoryEntry, Entry } from '@app/models/entry.model';
import { LibraryFacade } from '@app/store/library/library.facade';

@Component({
  selector: 'app-library-settings',
  template: `
    <div class="folders">
      <div class="folder" *ngFor="let folder of rootFolders$ | async">
        <button
          mat-button
          (click)="isExpanded[folder.path] = !!!isExpanded[folder.path]"
          class="folder-button"
          [class.expanded]="isExpanded[folder.path]"
        >
          <app-icon
            [path]="
              isExpanded[folder.path] ? icons.chevronDown : icons.chevronRight
            "
            class="status alert"
            title="No access"
          ></app-icon>
          <span>
            {{ folder.name }}
          </span>
          <app-icon [path]="icons.sync" class="refresh"></app-icon>
        </button>
        <cdk-tree
          *ngIf="isExpanded[folder.path]"
          [dataSource]="getChildren(folder)"
          [treeControl]="treeControl"
          [trackBy]="trackByFn"
        >
          <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="tree-leaf">
            <div class="file">
              <app-icon [path]="icons.fileMusic"></app-icon>
              {{ node.name }}
            </div>
          </cdk-nested-tree-node>
          <cdk-nested-tree-node
            *cdkTreeNodeDef="let node; when: hasChild"
            class="tree-node"
          >
            <div class="folder">
              <button
                mat-button
                [attr.aria-label]="'Toggle ' + node.name"
                cdkTreeNodeToggle
              >
                <app-icon
                  [path]="
                    treeControl.isExpanded(node)
                      ? icons.folderOpen
                      : icons.folder
                  "
                ></app-icon>
                {{ node.name }}
              </button>
            </div>
            <div *ngIf="treeControl.isExpanded(node)" class="node-container">
              <ng-container cdkTreeNodeOutlet></ng-container>
            </div>
          </cdk-nested-tree-node>
        </cdk-tree>
      </div>
    </div>
    <div class="actions">
      <button mat-raised-button color="primary">
        <app-icon [path]="icons.folderRefresh"></app-icon>
        <span>Synchronize all</span>
      </button>
      <button mat-raised-button color="primary" (click)="test()">
        <app-icon [path]="icons.folderPlus"></app-icon>
        <span>Add a folder</span>
      </button>
      <!--<a (click)="navigate()">File explorer</a>-->
    </div>
  `,
  styles: [
    `
      :host {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        padding: 24px;
      }
      .folders {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      .folder {
        display: flex;
        flex-direction: column;
      }
      .actions {
        flex: 0 0 40px;
        text-align: right;
        margin-top: 16px;
      }
      .folders button {
        height: 40px;
      }
      .folder-button {
        display: inline-flex;
        align-items: center;
        height: 50px !important;
        position: sticky;
        top: 0;
        background-color: #212121;
        z-index: 1;
        box-sizing: content-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      button span {
        line-height: 1;
      }
      .actions button {
        height: 40px;
      }
      .refresh {
        visibility: hidden;
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
      }
      button:hover .refresh {
        visibility: visible;
      }
      a {
        text-decoration: underline;
        cursor: pointer;
      }
      .actions button {
        margin-right: 8px;
      }
      app-icon {
        margin-right: 12px;
      }
      app-icon.alert {
        color: #ff6e40;
      }
      cdk-nested-tree-node {
        display: flex;
        flex-direction: column;
      }
      cdk-nested-tree-node cdk-nested-tree-node {
        padding-left: 40px;
      }
      button {
        text-align: left;
      }
      .file {
        height: 40px;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySettingsComponent {
  icons = Icons;

  isExpanded: { [key: string]: boolean } = {};
  rootFolders$: Observable<DirectoryEntry[]>;

  treeControl = new NestedTreeControl<Entry>((node) =>
    node.kind === 'directory' ? this.getChildren(node) : EMPTY
  );

  constructor(
    private parent: SettingsComponent,
    private router: Router,
    private library: LibraryFacade
  ) {
    this.rootFolders$ = EMPTY; //this.library.rootFolders$;
  }

  hasChild = (_: number, entry: Entry): boolean => entry.kind === 'directory';

  trackByFn = (index: number, entry: Entry): string => entry.path;

  navigate() {
    // this.parent.close().then(() => this.router.navigate(['/', 'explorer']));
  }

  getChildren = (folder: DirectoryEntry): Observable<Entry[]> =>
    this.library.getChildrenEntries(folder);

  test() {
    // this.files
    //   .open()
    //   .pipe(
    //     tap((directory) => this.store.dispatch(addEntry({ entry: directory })))
    //   )
    //   .subscribe();
    // this.store.dispatch(());
  }
}
