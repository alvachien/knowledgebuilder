import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';

@Component({
  selector: 'khb-highschool-item-display',
  templateUrl: './item-display.component.html',
  styleUrls: ['./item-display.component.scss'],
})
export class ItemDisplayComponent {
  private subfolder = '';
  private filename = '';
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  constructor(private activateRoute: ActivatedRoute) {}

  get mdFilePath() {
    return `assets/data/${this.subfolder}/${this.filename}`;
  }

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length >= 2) {
          const x = val.length - 2;
          const y = val.length - 1;
          const dispitem = val[x].path;
          if (dispitem === `display-jrmath-item`) {
            this.subfolder = 'juniorchool-math';
            this.filename = `${val[y].path}`;
          } else {
            this.subfolder = 'highschool-math';
            this.filename = `${val[y].path}`;
          }

          console.log(this.subfolder);
          console.log(this.filename);
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
