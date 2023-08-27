import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';

@Component({
  selector: 'khb-sentences-detail',
  templateUrl: './sentences-detail.component.html',
  styleUrls: ['./sentences-detail.component.scss'],
})
export class SentencesDetailComponent implements OnInit {
  private filename = '';
  private foldername = '';
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  constructor(private activateRoute: ActivatedRoute) {}

  get mdFilePath() {
    return `assets/data/english-sentences/${this.foldername}/${this.filename}`;
  }

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length > 2) {
          this.foldername = `${val[val.length - 2].path}`;
          this.filename = `${val[val.length - 1].path}`;
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
