import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { Router } from '@angular/router';
import { SettingsComponent } from '@app/dialogs/settings.component';
import { Icons } from '@app/utils/icons.util';
import { NestedTreeControl } from '@angular/cdk/tree';
import { first, map, publish, scan, tap } from 'rxjs/operators';
import { merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { FileService, isDirectory } from '@app/services/file.service';

interface FileSystemTreeNode {
  name: string;
  path: string;
  hasChild: boolean;
}

const isDirectChild = (
  parent: { path: string },
  child: { path: string }
): boolean =>
  parent.path !== child.path &&
  child.path.replace(/\/[^\/]+$/, '') === parent.path;

const isChild = (parent: { path: string }, child: { path: string }): boolean =>
  parent.path !== child.path && child.path.startsWith(parent.path + '/');

@Component({
  selector: 'app-library-settings',
  template: `
    <div class="folders">
      <!--      <button mat-button title="Synchronize Linkin Park">
        <app-icon [path]="icons.chevronRight" class="status"></app-icon>
        <span>Linkin Park</span>
        <app-icon [path]="icons.sync" class="refresh"></app-icon>
      </button>-->
      <div class="folder" *ngFor="let folder of folders">
        <button
          mat-button
          (click)="folder.expanded = !folder.expanded"
          class="folder-button"
          [class.expanded]="folder.expanded"
        >
          <app-icon
            [path]="folder.expanded ? icons.chevronDown : icons.chevronRight"
            class="status alert"
            title="No access"
          ></app-icon>
          <span>
            {{ folder.name }} {{ getChildrenCount(folder) | async }}
          </span>
          <app-icon [path]="icons.sync" class="refresh"></app-icon>
        </button>
        <cdk-tree
          *ngIf="folder.expanded"
          [dataSource]="getDirectChildren(folder)"
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
        padding-left: 52px;
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

  folders: { name: string; path: string; expanded: boolean }[] = [];
  nodes$: Subject<FileSystemTreeNode[]> = new ReplaySubject(1);

  treeControl = new NestedTreeControl<FileSystemTreeNode>(
    // (node) => this.nodes.filter((n) => isDirectChild(node, n))
    (node) =>
      this.nodes$.pipe(
        map((nodes) => nodes.filter((n) => isDirectChild(node, n)))
      )
  );

  constructor(
    private cdr: ChangeDetectorRef,
    private files: FileService,
    private router: Router,
    private parent: SettingsComponent
  ) {}

  hasChild = (_: number, node: FileSystemTreeNode): boolean => node.hasChild;

  trackByFn = (index: number, node: FileSystemTreeNode): string => node.path;

  navigate() {
    this.parent.close().then(() => this.router.navigate(['/', 'explorer']));
  }

  getDirectChildren(folder: {
    path: string;
  }): Observable<FileSystemTreeNode[]> {
    return this.nodes$.pipe(
      map((nodes) => nodes.filter((n) => isDirectChild(folder, n)))
    );
  }

  getChildrenCount(folder: {
    name: string;
    path: string;
    expanded: boolean;
  }): Observable<number> {
    return this.nodes$.pipe(
      map((nodes) => nodes.filter((n) => isChild(folder, n)).length)
    );
  }

  test() {
    this.files
      .scan()
      .pipe(
        publish((m$) =>
          merge(
            m$.pipe(
              first(),
              tap((dir) => {
                this.folders.push({
                  path: dir.path,
                  name: dir.name,
                  expanded: false,
                });
                this.cdr.markForCheck();
              })
            ),
            m$.pipe(
              scan(
                (acc, val) => [
                  ...acc,
                  {
                    name: val.name,
                    path: val.path,
                    hasChild: isDirectory(val),
                  },
                ],
                [] as FileSystemTreeNode[]
              ),
              tap((l) => {
                this.nodes$.next(l);
              })
            )
          )
        )
      )
      .subscribe();
  }
}
