import { Component, OnInit } from '@angular/core';
import { ODataService } from '../../services';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  tiles: Tile[] = [
    {text: 'Welcome', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'To', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Knowledge', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Builder', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  constructor(private odataSrv: ODataService) {
    console.log('Entering WelcomeComponent constructor');
  }

  ngOnInit(): void {
    console.log('Entering WelcomeComponent ngOnInit');

    this.odataSrv.getMetadata().subscribe({
      next: val => {
        console.log(val);
      },
      error: err => {
        console.error(err);
      },
    });
  }
}
