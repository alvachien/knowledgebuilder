import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-english-word',
  templateUrl: './english-word.component.html',
  styleUrls: ['./english-word.component.less'],
})
export class EnglishWordComponent implements OnInit, OnDestroy {
  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  playPron(word: string): void {
    // console.log(word);
    const pronfile = `assets\\audio\\${word}.mp3`;
    const audio = new Audio(pronfile);
    audio.autoplay = true;
    // audio.play();
  }
}
