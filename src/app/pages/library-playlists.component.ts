import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-library-playlists',
  template: `
    <app-library-content
      [selectedSortOption]="selectedSortOption"
      [sortOptions]="sortOptions"
    >
      <div class="playlists">
        <div class="playlist">
          <a class="cover" [routerLink]="[]" matRipple>
            <app-icon [path]="icons.plus" [size]="36"></app-icon>
          </a>
          <app-label
            [topLabel]="{ text: 'New playlist', routerLink: [] }"
            size="small"
          ></app-label>
        </div>
      </div>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 1200px;
      }
      .playlists {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -12px;
        padding: 0 0 64px;
      }
      .playlist {
        margin: 0 12px 32px;
      }
      .cover {
        width: 160px;
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        background-color: #212121;
        border-radius: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryPlaylistsComponent implements OnInit {
  sortOptions: SelectOption[] = [
    { name: 'Added recently', value: 'addedOn_desc' },
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  constructor() {}

  ngOnInit(): void {}
}
