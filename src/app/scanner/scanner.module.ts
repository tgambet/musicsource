import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { ScanComponent } from '@app/scanner/scan.component';
import { EffectsModule } from '@ngrx/effects';
import { scannerReducer } from '@app/scanner/store';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';
import { StoreModule } from '@ngrx/store';
import { ExtractorService } from '@app/scanner/extractor.service';
import { FileService } from '@app/scanner/file.service';
import { ScannerEffects2 } from '@app/scanner/store/scanner2.effects';

@NgModule({
  declarations: [ScanComponent],
  imports: [
    CoreModule,
    StoreModule.forFeature('scanner', scannerReducer),
    EffectsModule.forFeature([ScannerEffects2]),
  ],
  providers: [ScannerFacade, ExtractorService, FileService],
})
export class ScannerModule {}
