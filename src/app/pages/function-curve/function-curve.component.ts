import { Component, OnInit } from '@angular/core';
import { EChartOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-function-curve',
  templateUrl: './function-curve.component.html',
  styleUrls: ['./function-curve.component.less'],
})
export class FunctionCurveComponent implements OnInit {
  nzOptions: any[] | null = null;
  values: any[] | null = null;
  funcChartOption: Observable<EChartOption>;

  constructor() { }

  ngOnInit() {
    this.nzOptions = [{
      value: 'abs',
      label: 'y = Abs(x)',
      isLeaf: true,
    }, {
      value: 'sign',
      label: 'y = Sign(x)',
      isLeaf: true,
    }, {
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
    }, {
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
    if (this.values.length <= 0) {
      return;
    }
    const curval: string = this.values[0];

    switch (curval) {
      case 'abs':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: {
                text: 'y = abs(x)',
                top: 'bottom',
                left: 'center'
              },
              xAxis: {
                type: 'value',
                name: 'x',
                interval: 1,
                axisLine: {
                  symbol: ['none', 'arrow'],
                }
              },
              yAxis: {
                type: 'value',
                name: 'y',
                min: -1,
                interval: 1,
                axisLine: {
                  symbol: ['none', 'arrow']
                }
              },
              series: [{
                data: [[-5, 5], [-4, 4], [-3, 3], [-2, 2], [-1, 1], [0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5]],
                type: 'line',
                smooth: false,
              }]
            };
          }));
        break;

      case 'sign':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: {
                text: 'y = sign(x)',
                top: 'bottom',
                left: 'center'
              },
              xAxis: {
                type: 'value',
                name: 'x',
                interval: 1,
                axisLine: {
                  symbol: ['none', 'arrow'],
                }
              },
              yAxis: {
                type: 'value',
                name: 'y',
                interval: 1,
                min: -2,
                max: 2,
                axisLine: {
                  symbol: ['none', 'arrow']
                }
              },
              series: [{
                data: [[-5, -1], [-4, -1], [-3, -1], [-2, -1], [-1, -1], [0, -1]],
                type: 'line',
                smooth: false,
              }, {
                data: [[0, 0]],
                type: 'line',
                smooth: false,
              }, {
                data: [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [4, 1]],
                type: 'line',
                smooth: false,
              }]
            };
          }));
        break;

      default:
        break;
    }

  }
}
