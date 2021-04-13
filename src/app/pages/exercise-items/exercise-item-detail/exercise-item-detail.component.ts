import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { KatexOptions } from 'ngx-markdown';
import { MatChipInputEvent } from '@angular/material/chips';
import { UIMode } from 'actslib';
import { MonacoEditorConstructionOptions } from '@materia-ui/ngx-monaco-editor';

import { ExerciseItem, ExerciseItemType, getExerciseItemTypeNames } from '../../../models/exercise-item';
import { ODataService } from '../../../services';
import { ImageUploadComponent } from '../../image-upload/image-upload.component';

@Component({
  selector: 'app-exercise-item-detail',
  templateUrl: './exercise-item-detail.component.html',
  styleUrls: ['./exercise-item-detail.component.scss'],
})
export class ExerciseItemDetailComponent implements OnInit, OnDestroy {

  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;
  itemObject: ExerciseItem | undefined;

  uiMode: UIMode = UIMode.Create;
  currentMode = '';
  // Generic info
  public itemFormGroup: FormGroup;
  editorOptions: MonacoEditorConstructionOptions = {
    theme: 'vs-dark',
    wordWrap: 'on',
    roundedSelection: true
  };
  content = `New Exercise Item`;
  answerContent = ``;
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
  arExerciseTypes: any[] = [];

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

  constructor(
    public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private odataService: ODataService) {
      this.arExerciseTypes = getExerciseItemTypeNames();
      this.itemFormGroup = new FormGroup({
      idControl: new FormControl({
        value: null,
        disabled: true
      }),
      typeControl: new FormControl({
        value: ExerciseItemType.Question
      }),
      knowledgeControl: new FormControl(),
      tagControl: new FormControl(),
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
          this.odataService.readExerciseItem(this.routerID, this.uiMode === UIMode.Update)
            .subscribe({
              next: exitem => {
                this.onSetItemData(exitem);
                this.itemObject = exitem;
              },
              error: err => {
                console.error(err);
              }
            });
        }
      },
      error: err => {
        console.error(err);
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
          console.error(err);
        }
        return;
      }

      // Create a new exercise item
      this.itemObject = new ExerciseItem();
      this.itemObject.ItemType = this.itemFormGroup.get('typeControl')?.value as ExerciseItemType;
      this.itemObject.Content = this.content;
      this.itemObject.Tags = this.tags;
      this.itemObject.Answer = this.answerContent;
      this.odataService.createExerciseItem(this.itemObject).subscribe({
        next: val => {
          // Display current reason
          this.router.navigate(['/exercise-item/display', val.ID]);
        },
        error: err => {
          // Error
          console.error(err);
        }
      });
    } else if (this.isUpdateMode) {
      if (!this.itemFormGroup.valid) {
        if (this.itemFormGroup.errors) {
          const err = this.itemFormGroup.errors;
          console.log(err);
        }
        return;
      }

      // Update existing exercise item
      if (this.itemObject) {
        this.itemObject.ItemType = this.itemFormGroup.get('typeControl')?.value as ExerciseItemType;
        this.itemObject.Content = this.content;
        this.itemObject.Tags = this.tags;
        this.itemObject.Answer = this.answerContent;
        this.odataService.changeExerciseItem(this.itemObject).subscribe({
          next: val => {
            // Display current reason
            this.router.navigate(['/exercise-item/display', val.ID]);
          },
          error: err => {
            // Error
            console.error(err);
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

  openAnswerUploadDialog(): void {
      const dialogRef = this.dialog.open(ImageUploadComponent, { width: '50%', height: '50%' });
      dialogRef.afterClosed().subscribe({
        next: val => {
          console.log(val);

          val.forEach((entry: any) => {
            this.answerContent += `
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

  onSetItemData(val: ExerciseItem): void {
    this.itemFormGroup.get('idControl')?.setValue(val.ID);
    this.itemFormGroup.get('idControl')?.disable();
    this.itemFormGroup.get('typeControl')?.setValue(+val.ItemType);
    this.content = val.Content;
    this.tags = val.Tags;

    if (this.isDisplayMode) {
      this.itemFormGroup.disable(); // Readonly mode
    } else {
      this.itemFormGroup.markAsPristine();
    }
  }

  onReturnToList() {
    this.router.navigate(['exercise-item']);
  }

  onCreateNewOne(): void {
    this.router.navigate(['exercise-item', 'create']);
  }
}
