import { Component, OnInit } from '@angular/core';
import { EChartOption, EChartTitleOption } from 'echarts';
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
      value: 'floor',
      label: 'y = Floor(x)',
      isLeaf: true,
    }, {
      value: 'trigono',
      label: 'Trigonometric function',
      children: [{
        value: 'sin',
        label: 'y = Sin(x)',
        isLeaf: true
      }, {
        value: 'cos',
        label: 'y = Cos(x)',
        isLeaf: true
      }, {
        value: 'tan',
        label: 'y = Tan(x)',
        isLeaf: true
      }
      ]
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
    const curval: string = this.values[this.values.length - 1];

    switch (curval) {
      case 'abs':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = abs(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'sign':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = sign(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'floor':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = floor(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'sin':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = sin(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'cos':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = cos(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;
      case 'tan':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = tan(x)'),
              xAxis: this.curveXAxis(),
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      default:
        break;
    }
  }

  private curveTitle(name: string): EChartTitleOption {
    return {
      text: name,
      top: 'bottom',
      left: 'center'
    };
  }
  private curveXAxis(): EChartOption.XAxis {
    return {
      type: 'value',
      name: 'x',
      interval: 1,
      axisLine: {
        symbol: ['none', 'arrow'],
      }
    };
  }
  private curveYAxis(): EChartOption.YAxis {
    return {
      type: 'value',
      name: 'y',
      interval: 1,
      // min: -2,
      // max: 2,
      axisLine: {
        symbol: ['none', 'arrow']
      }
    };
  }
  private curveSeries(func: string): EChartOption.SeriesLine[] {
    const data: any[] = [];
    const series: EChartOption.SeriesLine[] = [];

    switch (func) {
      case 'abs':
        for (let i = -5; i <= 5; i++) {
          data.push([i, Math.abs(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        break;

      case 'sign':
        for (let i = -5; i < 0; i++) {
          data.push([i, Math.sign(i)]);
        }
        data.push([0, -1]);
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        data.splice(0);
        data.push([0, 0]);
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        data.splice(0);
        data.push([0, 1]);
        for (let i = 1; i < 5; i++) {
          data.push([i, Math.sign(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        break;

      case 'floor':
        for (let i = -5; i <= 5; i++) {
          data.push([i, Math.floor(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        break;

      case 'sin':
        for (let i = -6.8; i < 6.8; i += 0.2) {
          data.push([i, Math.sin(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: true,
        });
        break;

      case 'cos':
        for (let i = -6.8; i < 6.8; i += 0.2) {
          data.push([i, Math.cos(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: true,
        });
        break;

      case 'tan':
        for (let i = 0.001 - (1 * Math.PI / 2); i <= 0.1 - (1 * Math.PI / 2); i += 0.05) {
          data.push([i, Math.tan(i)]);
        }
        for (let i = 0.1 - (1 * Math.PI / 2); i <= (Math.PI / 2) - 0.1; i += 0.5) {
          data.push([i, Math.tan(i)]);
        }
        for (let i = (Math.PI / 2) - 0.1; i < Math.PI / 2; i += 0.005) {
          data.push([i, Math.tan(i)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: true,
        });
        break;

      default:
        break;
    }

    return series;
  }
}
