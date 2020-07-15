import { Component, OnInit } from '@angular/core';
import { ODataService } from '../../services';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

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
