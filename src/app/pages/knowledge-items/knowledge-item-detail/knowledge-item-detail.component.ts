import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private activateRoute: ActivatedRoute,) {
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
  }
}
