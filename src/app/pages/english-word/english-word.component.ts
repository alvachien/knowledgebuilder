import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-english-word',
  templateUrl: './english-word.component.html',
  styleUrls: ['./english-word.component.less'],
})
export class EnglishWordComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  playPron(word: string): void {
    // console.log(word);
    let pronfile = `assets\\audio\\${word}.mp3`;
    
  }
}
