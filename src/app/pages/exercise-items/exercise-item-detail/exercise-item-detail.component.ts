import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { KatexOptions } from 'ngx-markdown';

import { ODataService } from '../../../services';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';

@Component({
  selector: 'app-exercise-item-detail',
  templateUrl: './exercise-item-detail.component.html',
  styleUrls: ['./exercise-item-detail.component.scss'],
})
export class ExerciseItemDetailComponent implements OnInit, OnDestroy {

  private _destroyed$ ?: ReplaySubject<boolean>;
  private routerID = -1;

  currentMode: string;
  // Generic info
  public itemFormGroup: FormGroup;
  editorOptions = { theme: 'vs-dark' };
  content = `New Exercise Item`;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  // Questoin bank items
  displayedColumns: string[] = ['id', 'type'];
  qbitems: any[] = [];

  get isDisplayMode(): boolean {
    return this.currentMode === 'Display';
  }
  get IsCreateMode(): boolean {
    return this.currentMode === 'Create';
  }

  constructor(
    public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private odataService: ODataService) {
    this.itemFormGroup = new FormGroup({
      idControl: new FormControl(),
      titleControl: new FormControl('', Validators.required),
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
          this.odataService.readKnowledgeItem(this.routerID)
            .subscribe({
              next: val => {
                this.itemFormGroup.get('idControl')?.setValue(val.ID);
                this.itemFormGroup.get('idControl')?.disable();
                this.itemFormGroup.get('titleControl')?.setValue(val.Title);
                this.content = val.Content;

                if (this.currentMode === 'Display') {
                  this.itemFormGroup.disable(); // Readonly mode
                } else {
                  this.itemFormGroup.markAsPristine();
                }

                this.qbitems = val.QuestionBankItems;
              },
              error: err => {
                console.error(err);
              }
            });
        } else {
          this.itemFormGroup.get('idControl')?.setValue('NEW');
          this.itemFormGroup.get('idControl')?.disable();
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
        if (this.itemFormGroup.errors) {
          let err = this.itemFormGroup.errors;
          console.log(err);
        }
        return;
      }

      // Create a new knowlege item
      this.odataService.createKnowledgeItem({
        Category: 'Concept',
        Title: this.itemFormGroup.get('titleControl')?.value,
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

  openUploadDialog() {
    let dialogRef = this.dialog.open(ImageUploadComponent, { width: '50%', height: '50%' });
    dialogRef.afterClosed().subscribe({
      next: val => {
        console.log(val);

        val.forEach((entry: any) => {
          this.content += `
![Img](${entry.url})
          `;
        });
        // {
        //   [key: string]: {
        //       progress: Observable<number>;
        //       imgurl: string;
        //   };
        // }
      }
    });
  }
}
