import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';

import { ODataService } from '../../../services';

@Component({
  selector: 'app-question-bank-item-detail',
  templateUrl: './question-bank-item-detail.component.html',
  styleUrls: ['./question-bank-item-detail.component.scss']
})
export class QuestionBankItemDetailComponent implements OnInit {

  private _destroyed$: ReplaySubject<boolean>;
  currentMode: string;
  // Step: Generic info
  public itemFormGroup: FormGroup;
  editorOptions = { theme: 'vs-dark' };
  content = `function x() {\nconsole.log("Hello world!");\n}`;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  constructor(
    private activateRoute: ActivatedRoute,
    private odataService: ODataService) {
    this.itemFormGroup = new FormGroup({
      titleControl: new FormControl('', Validators.required),
//      contentControl: new FormControl('', Validators.required),
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
//        Content: this.itemFormGroup.get('contentControl').value
        Content: this.content,
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
