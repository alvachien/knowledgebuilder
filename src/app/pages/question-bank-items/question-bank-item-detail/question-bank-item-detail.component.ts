import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class QuestionBankItemDetailComponent implements OnInit, OnDestroy {

  private _destroyed$: ReplaySubject<boolean>;
  private routerID = -1;

  currentMode: string;
  // Step: Generic info
  public itemFormGroup: FormGroup;
  editorOptions = { theme: 'vs-dark' };
  content = `New Question Bank Item`;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  get isDisplayMode(): boolean {
    return this.currentMode === 'Display';
  }

  constructor(
    private activateRoute: ActivatedRoute,
    private odataService: ODataService) {
    this.itemFormGroup = new FormGroup({
      idControl: new FormControl(),
      knowledgeControl: new FormControl(),
      parentControl: new FormControl(),
      typeControl: new FormControl(),
//      contentControl: new FormControl('', Validators.required),
    });

    this.currentMode = 'Create';
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe({
      next: val => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'create') {
            this.routerID = -1;
            this.currentMode = 'Create';
          } else if (val[0].path === 'edit') {
            this.routerID = +val[1].path;
            this.currentMode = 'Edit';
          } else if (val[0].path === 'display') {
            this.routerID = +val[1].path;
            this.currentMode = 'Display';
          }
        }

        if (this.routerID !== -1) {
          this.odataService.readQuestionBankItem(this.routerID)
            .subscribe({
              next: val => {
                this.itemFormGroup.get('idControl').setValue(val.ID);
                this.itemFormGroup.get('idControl').disable();
                this.itemFormGroup.get('knowledgeControl').setValue(val.KnowledgeItemID);
                this.itemFormGroup.get('parentControl').setValue(val.ParentID);
                this.itemFormGroup.get('typeControl').setValue(val.QBType);
                this.content = val.Content;

                if (this.currentMode === 'Display') {
                  this.itemFormGroup.disable(); // Readonly mode
                } else {
                  this.itemFormGroup.markAsPristine();
                }
              },
              error: err => {
                console.error(err);
              }
            });
        } else {
          this.itemFormGroup.get('idControl').setValue('NEW');
          this.itemFormGroup.get('idControl').disable();
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.complete();
      this._destroyed$ = undefined;
    }
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

      // Create a new question bank item
      this.odataService.createQuestionBankItem({
        KnowledgeItemID: this.itemFormGroup.get('knowledgeControl').value,
        ParentID: this.itemFormGroup.get('parentControl').value,
        QBType: this.itemFormGroup.get('typeControl').value,
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
