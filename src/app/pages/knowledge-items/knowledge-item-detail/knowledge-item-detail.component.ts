import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { ODataService } from '../../../services';

@Component({
  selector: 'app-knowledge-item-detail',
  templateUrl: './knowledge-item-detail.component.html',
  styleUrls: ['./knowledge-item-detail.component.scss'],
})
export class KnowledgeItemDetailComponent implements OnInit {

  private _destroyed$: ReplaySubject<boolean>;
  currentMode: string;
  // Step: Generic info
  public itemFormGroup: FormGroup;

  constructor(
    private activateRoute: ActivatedRoute,
    private odataService: ODataService) {
    this.itemFormGroup = new FormGroup({
      titleControl: new FormControl('', Validators.required),
      contentControl: new FormControl('', Validators.required),
    });

    this.currentMode = 'Create';
  }

  ngOnInit(): void {
  }

  onOK(): void {
    // On OK
    if (this.currentMode === 'Create') {
      if (!this.itemFormGroup.valid) {
        if (this.itemFormGroup.hasError) {
          let err = this.itemFormGroup.errors;
          console.log(err);
        }
        return;
      }

      // Create a new knowlege item
      this.odataService.createKnowledgeItem({
        Category: 'Concept',
        Title: this.itemFormGroup.get('titleControl').value,
        Content: this.itemFormGroup.get('contentControl').value
      }).subscribe({
        next: val => {
          // Val
        },
        error: err => {
          // Error
        }
      });
    }
  }
}
