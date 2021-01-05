import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { KatexOptions } from 'ngx-markdown';

import { ODataService } from '../../../services';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';
import { KnowledgeItemCategory, KnowledgeItem, } from 'src/app/models';

@Component({
  selector: 'app-knowledge-item-detail',
  templateUrl: './knowledge-item-detail.component.html',
  styleUrls: ['./knowledge-item-detail.component.scss'],
})
export class KnowledgeItemDetailComponent implements OnInit, OnDestroy {

  private _destroyed$ ?: ReplaySubject<boolean>;
  private routerID = -1;

  currentMode: string;
  // Generic info
  public itemFormGroup: FormGroup;
  editorOptions = { theme: 'vs-dark' };
  content = `New Knowledge Item`;
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
    private router: Router,
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
              next: val2 => {
                this.itemFormGroup.get('idControl')?.setValue(val2.ID);
                this.itemFormGroup.get('idControl')?.disable();
                this.itemFormGroup.get('titleControl')?.setValue(val2.Title);
                // Category
                // this.itemFormGroup.get('')?.setValue();
                this.content = val2.Content;

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
          this.itemFormGroup.get('idControl')?.setValue('NEW');
          this.itemFormGroup.get('idControl')?.disable();
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
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
          const err = this.itemFormGroup.errors;
          console.log(err);
        }
        return;
      }

      // Create a new knowlege item
      let kitem = new KnowledgeItem();
      kitem.ItemCategory = KnowledgeItemCategory.Concept;
      kitem.Content = this.content;
      kitem.Title = this.itemFormGroup.get('titleControl')?.value;
      this.odataService.createKnowledgeItem(kitem).subscribe({
        next: val => {
          // Succeed
          this.router.navigate(['knowledge-item/display', val.ID]);
        },
        error: err => {
          // Error
        }
      });
    }
  }

  openUploadDialog(): void {
    const dialogRef = this.dialog.open(ImageUploadComponent, { width: '50%', height: '50%' });
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
