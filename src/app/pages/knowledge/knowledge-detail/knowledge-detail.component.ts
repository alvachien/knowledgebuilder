import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OdataService } from '../../../services';
import { UIModeEnum, KnowledgeItem, getUIModeString } from '../../../models';

@Component({
  selector: 'app-knowledge-detail',
  templateUrl: './knowledge-detail.component.html',
  styleUrls: ['./knowledge-detail.component.less'],
})
export class KnowledgeDetailComponent implements OnInit {
  private routerID: number = -1; // Current object ID in routing
  private _destroyed$: ReplaySubject<boolean>;

  public knowledgeDetailID = '123';
  public isLoadingResults: boolean;
  public currentMode: string;
  public uiMode: UIModeEnum = UIModeEnum.create;
  public detailForm: FormGroup;

  constructor(
    private oDataSrv: OdataService,
    private router: Router,
    private activateRoute: ActivatedRoute) {

    this.detailForm = new FormGroup({
      idControl: new FormControl(''),
      ctgyControl: new FormControl('', Validators.required),
      nameControl: new FormControl('', Validators.required),
      contentControl: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);
    this.activateRoute.url.subscribe((x: any) => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.uiMode = UIModeEnum.create;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.uiMode = UIModeEnum.edit;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.uiMode = UIModeEnum.display;
        }
        this.currentMode = getUIModeString(this.uiMode);

        if (this.uiMode === UIModeEnum.display || this.uiMode === UIModeEnum.edit) {
          this.isLoadingResults = true;

          this.oDataSrv.readKnowledge(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((dtl: KnowledgeItem) => {

            this.isLoadingResults = false;
            this.detailForm.get('idControl').setValue(dtl.id);
            this.detailForm.get('nameControl').setValue(dtl.name);
            this.detailForm.get('contentControl').setValue(dtl.content);
            this.detailForm.markAsUntouched();
            this.detailForm.markAsPristine();

            if (this.uiMode === UIModeEnum.display) {
              this.detailForm.disable();
            } else if (this.uiMode === UIModeEnum.edit) {
              this.detailForm.enable();
            }
          }, (error: any) => {
            this.isLoadingResults = false;

            // Show error dialog - TBD
            // popupDialog(this._dialog, this._uiService.getUILabel(UICommonLabelEnum.Error),
            //   error ? error.toString() : this._uiService.getUILabel(UICommonLabelEnum.Error));
          });
        }
      }
    });
  }

  public submitForm(val: any) {
    // Submit the form
    // this.oDataSrv.createKnowledge().subscribe()
  }
  public resetForm() {
    if (this.detailForm.enabled) {
      this.detailForm.reset();
    }
  }

  // Example Validate methods
  // userNameAsyncValidator = (control: FormControl) =>
  //   new Observable((observer: Observer<ValidationErrors | null>) => {
  //     setTimeout(() => {
  //       if (control.value === 'JasonWood') {
  //         // you have to return `{error: true}` to mark it as an error event
  //         observer.next({ error: true, duplicated: true });
  //       } else {
  //         observer.next(null);
  //       }
  //       observer.complete();
  //     }, 1000);
  //   });

  // confirmValidator = (control: FormControl): { [s: string]: boolean } => {
  //   if (!control.value) {
  //     return { error: true, required: true };
  //   } else if (control.value !== this.validateForm.controls.password.value) {
  //     return { confirm: true, error: true };
  //   }
  //   return {};
  // };
}
