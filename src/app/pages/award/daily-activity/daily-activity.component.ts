/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { DailyTrace, } from 'src/app/models/award';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-daily-activity',
  templateUrl: './daily-activity.component.html',
  styleUrls: ['./daily-activity.component.scss'],
})
export class DailyActivityComponent implements OnInit {
  public itemFormGroup: FormGroup;
  private objectDetail: DailyTrace | null = null;

  constructor(private odataSrv: ODataService) {
    this.itemFormGroup = new FormGroup({
      recordDate: new FormControl(null, Validators.required),
      goToBedTime: new FormControl(),
      schooldWorkTime: new FormControl(),
    });
  }

  ngOnInit(): void {
    // Do nothing
    this.objectDetail = new DailyTrace();
  }

  onAdd(): void {
    this.itemFormGroup.markAsPristine();
  }
  onEdit(): void {

  }
  onDelete(): void {
  }

  onSimulatePoints(): void {
    if (this.objectDetail !== null) {
      this.objectDetail.recordDate = moment(this.itemFormGroup.get('recordDate')?.value);
      if (this.itemFormGroup.get('goToBedTime')?.value) {
        this.objectDetail.goToBedTime = this.itemFormGroup.get('goToBedTime')?.value;
      } else {
        this.objectDetail.goToBedTime = null;
      }
      if (this.itemFormGroup.get('schooldWorkTime')?.value) {
        this.objectDetail.schoolWorkTime = this.itemFormGroup.get('schooldWorkTime')?.value;
      } else {
        this.objectDetail.schoolWorkTime = null;
      }
      this.objectDetail.targetUser = 'AAA';

      this.odataSrv.simulatePoint(this.objectDetail).subscribe({
        next: val => {
          if (val) {
            // TBD.
          }
        }, 
        error: err => {
          // TBD.
        }
      })
    }
  }
  onSave(): void {

  }
}
