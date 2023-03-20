import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModulesModule } from '../../material-modules';
import { ImageUploadComponent } from './image-upload.component';

@NgModule({
  declarations: [ImageUploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
  ],
  exports: [ImageUploadComponent],
})
export class ImageUploadModule {}
