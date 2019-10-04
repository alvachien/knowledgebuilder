import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-function-curve',
  templateUrl: './function-curve.component.html',
  styleUrls: ['./function-curve.component.less'],
})
export class FunctionCurveComponent implements OnInit {
  nzOptions: any[] | null = null;
  values: any[] | null = null;

  constructor() { }

  ngOnInit() {
    this.nzOptions = [{
      value: 'zhejiang',
      label: 'Zhejiang',
      children: [
        {
          value: 'hangzhou',
          label: 'Hangzhou',
          children: [
            {
              value: 'xihu',
              label: 'West Lake',
              isLeaf: true
            }
          ]
        },
        {
          value: 'ningbo',
          label: 'Ningbo',
          isLeaf: true
        }
      ]
    },
    {
      value: 'jiangsu',
      label: 'Jiangsu',
      children: [
        {
          value: 'nanjing',
          label: 'Nanjing',
          children: [
            {
              value: 'zhonghuamen',
              label: 'Zhong Hua Men',
              isLeaf: true
            }
          ]
        }
      ]
    }
    ];
  }
  onChanges(values: any): void {
    console.log(values, this.values);
  }
}
