import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';

import { ODataService } from '../../services';

@Component({
  selector: 'khb-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @ViewChild('file', { static: false }) file: any;

  public files: Set<File> = new Set();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any;
  canBeClosed = true;
  primaryButtonText = 'Upload';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadResults: any[] = [];

  constructor(public dialogRef: MatDialogRef<ImageUploadComponent>, public uploadService: ODataService) {}

  onFilesAdded() {
    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (const key in files) {
      if (!isNaN(parseInt(key))) {
        this.files.add(files[key]);
      }
    }
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  closeDialog() {
    // if everything was uploaded already, just close the dialog
    if (this.uploadSuccessful) {
      return this.dialogRef.close(this.uploadResults);
    }

    // set the component state to "uploading"
    this.uploading = true;

    // start the upload and save the progress map
    this.results = this.uploadService.uploadFiles(this.files);
    // console.log(this.progress);
    for (const key in this.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.results[key].result.subscribe((val: any) => {
        // console.log(val);
        this.uploadResults.push(val);
      });
    }

    // convert the progress map into an array
    const allProgressObservables = [];
    for (const key in this.results) {
      allProgressObservables.push(this.results[key].result);
    }

    // Adjust the state variables

    // The OK-button should have the text "Finish" now
    this.primaryButtonText = 'Finish';

    // The dialog should not be closed while uploading
    this.canBeClosed = false;
    this.dialogRef.disableClose = true;

    // Hide the cancel-button
    this.showCancelButton = false;

    // When all progress-observables are completed...
    forkJoin(allProgressObservables).subscribe(() => {
      // ... the dialog can be closed again...
      this.canBeClosed = true;
      this.dialogRef.disableClose = false;

      // ... the upload was successful...
      this.uploadSuccessful = true;

      // ... and the component is no longer uploading
      this.uploading = false;
    });
  }
}
