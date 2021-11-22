import { Component, OnInit } from '@angular/core';

import { OverviewInfo, TagReferenceType } from 'src/app/models';
import { ODataService } from 'src/app/services';
import { environment } from 'src/environments/environment';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
  fontsize: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  countOfKnowledge = 0;
  countOfExercise = 0;
  tiles: Tile[] = [
    {text: 'Welcome!', cols: 3, rows: 1, color: 'lightblue', fontsize: '16px'},
    {text: 'Knowledge Builder', cols: 1, rows: 2, color: 'lightgreen', fontsize: '16px'},
    {text: `Knowledge Items: ${this.countOfKnowledge}`, cols: 1, rows: 1, color: 'lightpink', fontsize: '32px'},
    {text: `Exercise Items: ${this.countOfExercise}`, cols: 2, rows: 1, color: '#DDBDF1', fontsize: '32px'},
  ];
  currentSlogan = '';

  constructor(private odataSrv: ODataService) {
    if (!environment.production) {
      console.log('Entering WelcomeComponent constructor');
    }    
  }

  ngOnInit(): void {
    if (!environment.production) {
      console.log('Entering WelcomeComponent ngOnInit');
    }

    let ncnt = Math.floor((Math.random() * 5) + 1);
    if (ncnt === 1) {
      this.currentSlogan = 'KeepLearning';
    } else if(ncnt === 2) {
      this.currentSlogan = 'KeepLearning2';
    } else if(ncnt === 3) {
      this.currentSlogan = 'KeepLearning3';
    } else if(ncnt === 4) {
      this.currentSlogan = 'KeepLearning4';
    } else if(ncnt === 5) {
      this.currentSlogan = 'KeepLearning5';
    }

    this.odataSrv.getMetadata().subscribe({
      next: val => {
        if (!environment.production) {
          console.log(val);
        }
      },
      error: err => {
        console.error(err);
      },
    });

    this.odataSrv.getOverviewInfo().subscribe({
      next: (val: OverviewInfo[]) => {
        val.forEach(oi => {
          if (oi.RefType === TagReferenceType.KnowledgeItem) {
            this.countOfKnowledge = oi.Count;
            this.tiles[2].text = `Knowledge Items: ${this.countOfKnowledge ? this.countOfKnowledge : 0}`;
          } else if (oi.RefType === TagReferenceType.ExerciseItem) {
            this.countOfExercise = oi.Count;
            this.tiles[3].text = `Exercise Items: ${this.countOfExercise ? this.countOfExercise : 0}`;
          }
        });
      },
      error: err => {
        console.error(err);
      }
    });
  }
}
