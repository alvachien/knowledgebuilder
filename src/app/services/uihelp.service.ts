import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class UIHelpService {

  constructor(private msgService: NzMessageService) { }

  createMessage(type: string, content: string): void {
    this.msgService.create(type, content);
  }
}
