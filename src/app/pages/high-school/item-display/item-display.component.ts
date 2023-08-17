import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';

@Component({
  selector: 'khb-highschool-item-display',
  templateUrl: './item-display.component.html',
  styleUrls: ['./item-display.component.scss'],
})
export class ItemDisplayComponent {
  private filename =  '';
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  constructor(private activateRoute: ActivatedRoute) {    
  }

  get mdFilePath() {
    return `assets/data/${this.filename}`;
  }

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length >= 2) {
          const x = val.length - 2;
          const y = val.length - 1;
          this.filename = `${val[x] }\\${ val[y] }`;
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
