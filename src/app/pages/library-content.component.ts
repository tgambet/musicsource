import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { LibraryFacade } from '@app/store/library/library.facade';
import { ActivatedRoute, Router } from '@angular/router';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-library-content',
  template: `
    <a id="top"></a>
    <div class="filters" #filters [class.scrolled-top]="scrolledTop">
      <app-container>
        <app-select
          [options]="sortOptions"
          [selected]="selectedSortOption"
          (selectionChange)="sort($event)"
        ></app-select>
      </app-container>
    </div>
    <app-container>
      <ng-content></ng-content>
    </app-container>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 1200px;
      }
      #top {
        position: relative;
        top: -112px;
        display: block;
      }
      .filters {
        position: sticky;
        top: 112px;
        z-index: 101;
        display: flex;
        align-items: center;
        padding: 16px 0;
        transition: background-color ease 200ms;
      }
      .filters.scrolled-top {
        background-color: #212121;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: rgba(0, 0, 0, 0.4) 0 5px 6px -3px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryContentComponent implements OnInit, AfterViewInit {
  @ViewChild('filters', { static: true })
  filters!: ElementRef;

  @Input()
  sortOptions!: SelectOption[];

  @Input()
  selectedSortOption!: SelectOption;

  scrolledTop = false;

  constructor(
    private library: LibraryFacade,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('window:scroll')
  update(): void {
    this.scrolledTop =
      this.filters.nativeElement.getBoundingClientRect().y <= 112;
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    setTimeout(() => this.update());
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        take(1),
        tap(
          (params) =>
            (this.selectedSortOption =
              this.sortOptions.find(
                (o) => o.value === `${params.get('sort')}_${params.get('dir')}`
              ) || this.sortOptions[0])
        )
      )
      .subscribe();
  }

  async sort(option: string) {
    const [sort, dir] = option.split('_');
    await this.router.navigate([], {
      queryParams: { sort, dir },
      preserveFragment: true,
    });
  }
}
