import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { KatexOptions } from 'ngx-markdown';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { UIMode } from 'actslib';

import { ODataService, UIUtilityService, } from '../../../services';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';
import { KnowledgeItemCategory, KnowledgeItem, getKnowledgeItemCategoryNames, } from 'src/app/models';

@Component({
  selector: 'app-knowledge-item-detail',
  templateUrl: './knowledge-item-detail.component.html',
  styleUrls: ['./knowledge-item-detail.component.scss'],
})
export class KnowledgeItemDetailComponent implements OnInit, OnDestroy {
  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;

  uiMode: UIMode = UIMode.Create;
  currentMode = '';
  // Generic info
  public itemFormGroup: UntypedFormGroup;
  editorOptions = {
    theme: 'vs-dark',
  };
  content = `New Knowledge Item`;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  // Chip for tags
  selectable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: string[] = [];
  arKnowledgeCtgies: any[] = [];
  currentItem: KnowledgeItem | undefined;

  get isDisplayMode(): boolean {
    return this.uiMode === UIMode.Display;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isUpdateMode(): boolean {
    return this.uiMode === UIMode.Update;
  }
  get isEditable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Update;
  }

  constructor(public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private uiUtilSrv: UIUtilityService,
    private odataService: ODataService) {
    this.arKnowledgeCtgies = getKnowledgeItemCategoryNames();
    this.itemFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({
        value: null,
        disabled: true
      }),
      titleControl: new UntypedFormControl('', Validators.required),
      ctgyControl: new UntypedFormControl({
        value: KnowledgeItemCategory.Concept,
      }),
      tagControl: new UntypedFormControl(),
    });
  }

  ngOnInit(): void {
    this.destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe({
      next: val => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'create') {
            this.routerID = -1;
            this.uiMode = UIMode.Create;
            this.currentMode = 'Common.Create';
          } else if (val[0].path === 'edit') {
            this.routerID = +val[1].path;
            this.uiMode = UIMode.Update;
            this.currentMode = 'Common.Change';
          } else if (val[0].path === 'display') {
            this.routerID = +val[1].path;
            this.uiMode = UIMode.Display;
            this.currentMode = 'Common.Display';
          }
        }

        if (this.routerID !== -1) {
          this.odataService.readKnowledgeItem(this.routerID, this.uiMode === UIMode.Update)
            .subscribe({
              next: val2 => {
                this.itemFormGroup.get('idControl')?.setValue(val2.ID);
                this.itemFormGroup.get('titleControl')?.setValue(val2.Title);
                this.itemFormGroup.get('ctgyControl')?.setValue(+val2.ItemCategory);
                this.content = val2.Content;
                this.tags = val2.Tags;
                this.currentItem = val2;

                if (this.isDisplayMode) {
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
          this.itemFormGroup.markAsPristine();
          this.itemFormGroup.markAsUntouched();
        }
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.destroyed$) {
      this.destroyed$.complete();
      this.destroyed$ = undefined;
    }
  }

  onOK(): void {
    // On OK
    if (this.isCreateMode) {
      if (!this.itemFormGroup.valid) {
        if (this.itemFormGroup.errors) {
          const err = this.itemFormGroup.errors;
          this.uiUtilSrv.showSnackInfo(err.toString());
        }
        return;
      }

      // Create a new knowlege item
      const kitem = new KnowledgeItem();
      kitem.ItemCategory = this.itemFormGroup.get('ctgyControl')?.value;;
      kitem.Content = this.content;
      kitem.Title = this.itemFormGroup.get('titleControl')?.value;
      kitem.Tags = this.tags;
      this.odataService.createKnowledgeItem(kitem).subscribe({
        next: val => {
          // Succeed
          this.uiUtilSrv.navigateKnowledgeItemDisplayPage(val.ID);
        },
        error: err => {
          this.uiUtilSrv.showSnackInfo(err);
        }
      });
    } else if(this.isUpdateMode) {
      if (!this.itemFormGroup.valid) {
        if (this.itemFormGroup.errors) {
          const err = this.itemFormGroup.errors;
          this.uiUtilSrv.showSnackInfo(err.toString());
        }
        return;
      }

      // Update a new knowlege item
      if (this.currentItem) {
        this.currentItem.ItemCategory = this.itemFormGroup.get('ctgyControl')?.value;;
        this.currentItem.Content = this.content;
        this.currentItem.Title = this.itemFormGroup.get('titleControl')?.value;
        this.currentItem.Tags = this.tags;
        this.odataService.changeKnowledgeItem(this.currentItem).subscribe({
          next: val => {
            // Succeed
            this.uiUtilSrv.navigateKnowledgeItemDisplayPage(val.ID);
          },
          error: err => {
            this.uiUtilSrv.showSnackInfo(err);
          }
        });
      }
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

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
  onReturnToList() {
    this.uiUtilSrv.navigateKnowledgeItemListPage();
  }
  onCreateNewOne(): void {
    this.uiUtilSrv.navigateKnowledgeItemCreatePage();
  }
}
