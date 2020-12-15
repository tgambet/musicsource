import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
} from '@angular/core';
import { ExtractorService } from '@app/services/extractor.service';
import { FileService } from '@app/services/file.service';
import {
  concatMap,
  filter,
  first,
  map,
  publish,
  scan,
  tap,
} from 'rxjs/operators';
import { collectRight } from '@app/utils/either.util';
import { AudioService } from '@app/services/audio.service';
import { merge, ReplaySubject, Subject } from 'rxjs';
import { NestedTreeControl } from '@angular/cdk/tree';
import { Icons } from '@app/utils/icons.util';
import { isDirectory, isFile } from '@app/utils/entry.util';

interface FileSystemTreeNode {
  name: string;
  path: string;
  hasChild: boolean;
}

const isDirectChild = (
  parent: FileSystemTreeNode,
  child: FileSystemTreeNode
): boolean =>
  parent.path !== child.path &&
  child.path.replace(/\/[^\/]+$/, '') === parent.path;

@Component({
  selector: 'app-explorer',
  template: `
    <button (click)="test()">Test</button>
    <cdk-tree
      [dataSource]="firstNode$"
      [treeControl]="treeControl"
      [trackBy]="trackByFn"
    >
      <cdk-nested-tree-node *cdkTreeNodeDef="let node" class="tree-leaf">
        <div class="file">
          <button mat-icon-button disabled>
            <app-icon [path]="icons.fileMusic"></app-icon>
          </button>
          {{ node.name }}
        </div>
      </cdk-nested-tree-node>
      <cdk-nested-tree-node
        *cdkTreeNodeDef="let node; when: hasChild"
        class="tree-node"
      >
        <div class="folder">
          <button
            mat-icon-button
            [attr.aria-label]="'Toggle ' + node.name"
            cdkTreeNodeToggle
          >
            <app-icon
              [path]="
                treeControl.isExpanded(node) ? icons.folderOpen : icons.folder
              "
            ></app-icon>
          </button>
          {{ node.name }}
        </div>
        <div *ngIf="treeControl.isExpanded(node)" class="node-container">
          <ng-container cdkTreeNodeOutlet></ng-container>
        </div>
      </cdk-nested-tree-node>
    </cdk-tree>
  `,
  styles: [
    `
      cdk-tree,
      .node-container {
        display: flex;
        flex-direction: column;
      }
      .folder,
      .file {
        display: flex;
        align-items: center;
        height: 40px;
      }
      .cdk-nested-tree-node .cdk-nested-tree-node {
        padding-left: 40px;
      }
      .tree-leaf {
        display: flex;
        align-items: center;
      }
    `,
  ],
  providers: [FileService, ExtractorService, AudioService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorerComponent {
  @HostBinding('class.scrolled-top')
  scrolledTop = true;

  subject: Subject<FileSystemTreeNode[]> = new ReplaySubject(1);

  treeControl = new NestedTreeControl<FileSystemTreeNode>((node) =>
    this.subject.pipe(
      map((nodes) => nodes.filter((n) => isDirectChild(node, n)))
    )
  );

  firstNode$ = this.subject.pipe(map((nodes) => [{ ...nodes[0] }]));

  icons = Icons;

  constructor(
    private files: FileService,
    private extractor: ExtractorService // private audio: AudioService
  ) {}

  @HostListener('window:scroll', ['$event'])
  setScrolledTop(event: any) {
    this.scrolledTop = event.target.scrollingElement.scrollTop === 0;
  }

  hasChild = (_: number, node: FileSystemTreeNode): boolean => node.hasChild;

  trackByFn = (index: number, node: FileSystemTreeNode): string => node.path;

  test() {
    this.files
      .scan()
      .pipe(
        publish((m$) =>
          merge(
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
              tap((l) => this.subject.next(l))
            ),
            m$.pipe(filter(isDirectory)),
            m$.pipe(
              filter(isFile),
              concatMap((entry) => this.extractor.extract(entry)),
              collectRight(),
              first(),
              concatMap((e) => e.entry.handle.getFile())
              // concatMap((file) => this.audio.play(file))
            )
          )
        )
      )
      .subscribe();
  }
}
