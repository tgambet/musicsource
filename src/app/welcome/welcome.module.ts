import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { WelcomeComponent } from '@app/welcome/welcome.component';
import { RouterModule, Routes } from '@angular/router';
import { ScannerModule } from '@app/scanner/scanner.module';
import { DatabaseModule } from '@app/database/database.module';

const routes: Routes = [
  {
    path: '',
    component: WelcomeComponent,
    data: { animation: 'default' },
  },
];

@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CoreModule,
    RouterModule.forChild(routes),
    DatabaseModule,
    ScannerModule,
  ],
  providers: [],
})
export class WelcomeModule {}
