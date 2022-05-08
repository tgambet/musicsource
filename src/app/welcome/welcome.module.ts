import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { WelcomeComponent } from '@app/welcome/welcome.component';
import { RouterModule, Routes } from '@angular/router';
import { SupportService } from '@app/welcome/support.service';

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
    // DatabaseModule,
    // ScannerModule,
  ],
  providers: [SupportService],
})
export class WelcomeModule {}
