import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';

@Component({
  selector: 'app-library-likes',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryLikesComponent {
  sortOptions: SelectOption[] = [
    { name: 'Latest likes', value: 'year_desc' },
    { name: 'Oldest likes', value: 'year_asc' },
    { name: 'A to Z', value: 'title_asc' },
    { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];
}
