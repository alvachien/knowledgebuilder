import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { UIMode } from 'actslib';
import { TagReferenceType, UserCollection, UserCollectionItem, getTagReferenceTypeName } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'khb-user-collection-detail',
  templateUrl: './user-collection-detail.component.html',
  styleUrls: ['./user-collection-detail.component.scss'],
})
export class UserCollectionDetailComponent implements OnInit, OnDestroy {
  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;
  itemObject: UserCollection | undefined;
  displayedColumns: string[] = ['refid', 'reftype', 'createdat'];
  dataSource: UserCollectionItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;

  getTagReferenceTypeName = getTagReferenceTypeName;

  uiMode: UIMode = UIMode.Create;
  currentMode = '';
  userDisplayAs: string | undefined;

  // Generic info
  public itemFormGroup: UntypedFormGroup;
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
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService,
    private odataService: ODataService
  ) {
    this.itemFormGroup = new UntypedFormGroup({
      idControl: new UntypedFormControl({
        value: null,
        disabled: true,
      }),
      userControl: new UntypedFormControl({
        value: this.authService.userDetail?.userID,
        disabled: true,
      }),
      nameControl: new UntypedFormControl(),
      commentControl: new UntypedFormControl(),
    });
    this.userDisplayAs = this.authService.userDetail?.displayAs;
  }

  ngOnInit(): void {
    this.destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe({
      next: (val) => {
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
          this.odataService.readUserCollection(this.routerID, this.uiMode === UIMode.Update).subscribe({
            next: (exitem) => {
              this.onSetHeaderData(exitem);
              this.itemObject = exitem;
              this.dataSource = exitem.Items;
            },
            error: (err) => {
              this.uiUtilSrv.showSnackInfo(err);
            },
          });
        }
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
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
    this.itemFormGroup.get('userControl')?.setValue(this.authService.userDetail?.userID);
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.itemObject.User = this.authService.userDetail?.userID ?? '';
      this.odataService.createUserCollection(this.itemObject).subscribe({
        next: (val) => {
          // Display current collection
          this.uiUtilSrv.navigateUserCollectionDisplayPage(val.ID);
        },
        error: (err) => {
          this.uiUtilSrv.showSnackInfo(err);
        },
      });
    } else if (this.isUpdateMode) {
      // TBD.
    }
  }
  public onReturnToList(): void {
    this.uiUtilSrv.navigateUserCollectionListPage();
  }
  public onCreateNewOne(): void {
    this.uiUtilSrv.navigateUserCollectionCreatePage();
  }
  public onCreateItem(): void {
    // TBD.
  }
  public onDeleteCollItem(row: UserCollectionItem): void {
    if (row.RefType === TagReferenceType.ExerciseItem) {
      this.odataService.removeExerciseItemFromCollection(row).subscribe({
        next: () => {
          this.uiUtilSrv.showSnackInfo('DONE');
          const idx = this.dataSource.findIndex((item) => item.RefID === row.RefID && item.RefType === row.RefType);
          if (idx !== -1) {
            this.dataSource.splice(idx, 1);
          }
        },
        error: (err) => {
          this.uiUtilSrv.showSnackInfo(err);
        },
      });
    } else if (row.RefType === TagReferenceType.KnowledgeItem) {
      this.odataService.removeKnowledgeItemFromCollection(row).subscribe({
        next: () => {
          this.uiUtilSrv.showSnackInfo('DONE');
          const idx = this.dataSource.findIndex((item) => item.RefID === row.RefID && item.RefType === row.RefType);
          if (idx !== -1) {
            this.dataSource.splice(idx, 1);
          }
        },
        error: (err) => {
          this.uiUtilSrv.showSnackInfo(err);
        },
      });
    }
  }
  public onDisplayExerciseItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemDisplayPage(rid);
  }
  public onChangeExerciseItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemChangePage(rid);
  }
}
