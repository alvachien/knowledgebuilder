import { Injectable } from '@angular/core';
import { NzMessageService, NzMessageDataOptions, } from 'ng-zorro-antd/message';
import { MessageType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UIHelpService {

  constructor(private msgService: NzMessageService) { }

  showMessage(msgtype: MessageType, content: string, options?: NzMessageDataOptions): void {
    switch (msgtype) {
      case MessageType.Success:
        this.msgService.success(content, options);
        break;

      case MessageType.Error:
        this.msgService.error(content, options);
        break;

      case MessageType.Warning:
        this.msgService.warning(content, options);
        break;

      case MessageType.Info:
      default:
        this.msgService.info(content, options);
        break;
    }
  }
}
