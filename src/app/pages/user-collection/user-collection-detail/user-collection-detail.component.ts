import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { UIMode } from 'actslib';
import { UserCollection, UserCollectionItem } from 'src/app/models';
import { ODataService, UIUtilityService, } from 'src/app/services';

@Component({
  selector: 'app-user-collection-detail',
  templateUrl: './user-collection-detail.component.html',
  styleUrls: ['./user-collection-detail.component.scss'],
})
export class UserCollectionDetailComponent implements OnInit, OnDestroy {
  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;
  itemObject: UserCollection | undefined;
  displayedColumns: string[] = ['refid', 'createdat'];
  dataSource: UserCollectionItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;

  uiMode: UIMode = UIMode.Create;
  currentMode = '';
  // Generic info
  public itemFormGroup: FormGroup;
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
      this.itemFormGroup = new FormGroup({
      idControl: new FormControl({
        value: null,
        disabled: true
      }),
      userControl: new FormControl({
        value: this.odataService.currentUser,
        disabled: true
      }),
      nameControl: new FormControl(),
      commentControl: new FormControl(),
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
          this.odataService.readUserCollection(this.routerID, this.uiMode === UIMode.Update)
            .subscribe({
              next: exitem => {
                this.onSetHeaderData(exitem);
                this.itemObject = exitem;
                this.dataSource = exitem.Items;
              },
              error: err => {
                this.uiUtilSrv.showSnackInfo(err);
              }
            });
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
  onSetHeaderData(val: UserCollection): void {
    this.itemFormGroup.get('idControl')?.setValue(val.ID);
    this.itemFormGroup.get('idControl')?.disable();
    this.itemFormGroup.get('userControl')?.setValue(this.odataService.currentUser);
    this.itemFormGroup.get('userControl')?.disable();
    this.itemFormGroup.get('nameControl')?.setValue(val.Name);
    this.itemFormGroup.get('commentControl')?.setValue(val.Comment);

    if (this.isDisplayMode) {
      this.itemFormGroup.disable(); // Readonly mode
    } else {
      this.itemFormGroup.markAsPristine();
    }
  }

  public onOK(): void {
    if (this.isCreateMode) {
      if (!this.itemFormGroup.valid) {
        if (this.itemFormGroup.errors) {
          const err = this.itemFormGroup.errors;
          this.uiUtilSrv.showSnackInfo(err.toString());
        }
        return;
      }

      // Create a new exercise item
      this.itemObject = new UserCollection();
      this.itemObject.Name = this.itemFormGroup.get('nameControl')?.value;
      this.itemObject.Comment = this.itemFormGroup.get('commentControl')?.value;
      this.itemObject.User = this.odataService.currentUser;
      this.odataService.createUserCollection(this.itemObject).subscribe({
        next: val => {
          // Display current collection
          this.uiUtilSrv.navigateUserCollectionDisplayPage(val.ID); ;
        },
        error: err => {
          this.uiUtilSrv.showSnackInfo(err);
        }
      });
    } else if (this.isUpdateMode) {
    }
  }
  public onReturnToList(): void {
    this.uiUtilSrv.navigateUserCollectionListPage();
  }
  public onCreateNewOne(): void {
    this.uiUtilSrv.navigateUserCollectionCreatePage();
  }
  public onCreateItem(): void {
  }
  public onDeleteCollItem(row: UserCollectionItem): void {
    this.odataService.removeExerciseItemFromCollection(row).subscribe({
      next: val => {
        this.uiUtilSrv.showSnackInfo('DONE');
        const idx = this.dataSource.findIndex(item => item.RefID === row.RefID && item.RefType === row.RefType);
        if (idx !== -1) {
          this.dataSource.splice(idx, 1);
        }
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
  public onDisplayExerciseItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemDisplayPage(rid);
  }
  public onChangeExerciseItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemChangePage(rid);
  }
}
