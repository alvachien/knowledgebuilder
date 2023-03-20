import { NgModule } from '@angular/core';
import { OperatorFilterPipe } from 'src/app/pipes';

@NgModule({
  declarations: [OperatorFilterPipe],
  exports: [OperatorFilterPipe],
})
export class AppUIModule {}
