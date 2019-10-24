import { Component, OnInit } from '@angular/core';
import { EChartOption, EChartTitleOption } from 'echarts';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as mathjs from 'mathjs';

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
      label: 'y = abs(x)',
      isLeaf: true,
    }, {
      value: 'sign',
      label: 'y = sign(x)',
      isLeaf: true,
    }, {
      value: 'floor',
      label: 'y = floor(x)',
      isLeaf: true,
    }, {
      value: 'ceil',
      label: 'y = ceil(x)',
      isLeaf: true,
    }, {
      value: 'power',
      label: 'Power functions',
      children: [{
        value: 'x^2',
        label: 'y = x^2',
        isLeaf: true
      }, {
        value: 'x^3',
        label: 'y = x^3',
        isLeaf: true
      },
      ],
    }, {
      value: 'trigono',
      label: 'Trigonometric functions',
      children: [{
        value: 'sin',
        label: 'y = sin(x)',
        isLeaf: true
      }, {
        value: 'cos',
        label: 'y = cos(x)',
        isLeaf: true
      }, {
        value: 'tan',
        label: 'y = tan(x)',
        isLeaf: true
      }, {
        value: 'cot',
        label: 'y = cot(x)',
        isLeaf: true
      }
      ]
    }];
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
            const xAxis = this.curveXAxis();
            xAxis.max = 5;
            xAxis.min = -5;
            const yAxis = this.curveYAxis();
            yAxis.max = 2;
            yAxis.min = -2;
            return {
              title: this.curveTitle('y = sign(x)'),
              xAxis,
              yAxis,
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

      case 'ceil':
        this.funcChartOption = of([]).pipe(
          map(() => {
            return {
              title: this.curveTitle('y = ceil(x)'),
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
            const xAxis = this.curveXAxis();
            xAxis.max = 20;
            xAxis.min = -20;
            return {
              title: this.curveTitle('y = tan(x)'),
              xAxis,
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'cot':
        this.funcChartOption = of([]).pipe(
          map(() => {
            const xAxis = this.curveXAxis();
            xAxis.max = 20;
            xAxis.min = -20;
            return {
              title: this.curveTitle('y = cot(x)'),
              xAxis,
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'x^2':
        this.funcChartOption = of([]).pipe(
          map(() => {
            const xAxis = this.curveXAxis();
            xAxis.max = 25;
            xAxis.min = -25;
            return {
              title: this.curveTitle('y = x^2'),
              xAxis,
              yAxis: this.curveYAxis(),
              series: this.curveSeries(curval),
            };
          }));
        break;

      case 'x^3':
        this.funcChartOption = of([]).pipe(
          map(() => {
            const xAxis = this.curveXAxis();
            xAxis.max = 25;
            xAxis.min = -25;
            return {
              title: this.curveTitle('y = x^3'),
              xAxis,
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
    let data: any[] = [];
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
        data = [];
        data.push([0, 0]);
        series.push({
          data,
          type: 'line',
          smooth: false,
        });
        data = [];
        data.push([0, 1]);
        for (let i = 1; i <= 5; i++) {
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
          data = [];
          data.push([i, Math.floor(i + 0.1)]);
          for (let j = i + 0.1; j <= i + 1; j += 0.1) {
            data.push([j, Math.floor(j)]);
          }
          series.push({
            data,
            type: 'line',
            smooth: false,
          });
        }
        break;

      case 'ceil':
        for (let i = -5; i <= 5; i++) {
          data = [];
          data.push([i, Math.ceil(i + 0.1)]);
          for (let j = i + 0.1; j < i + 1; j += 0.1) {
            data.push([j, Math.ceil(j)]);
          }
          series.push({
            data,
            type: 'line',
            smooth: false,
          });
        }
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
        for (let j = -5; j <= 5; j++) {
          data = [];
          let ystart = -20;
          const yend = 20;
          while (ystart <= yend) {
            let xpoint = Math.atan(ystart);
            xpoint += (j * Math.PI);
            data.push([xpoint, ystart]);
            ystart += 1;
          }

          series.push({
            data,
            type: 'line',
            smooth: true,
          });
        }
        break;

      case 'cot':
        for (let j = -5; j <= 5; j++) {
          data = [];
          let ystart = -20;
          const yend = 20;
          while (ystart <= yend) {
            let xpoint = Math.atan(ystart);
            xpoint += (j + 0.5) * Math.PI;
            data.push([xpoint, ystart]);
            ystart += 1;
          }

          series.push({
            data,
            type: 'line',
            smooth: true,
          });
        }
        break;

      case 'x^2':
        for (let i = -5; i <= 5; i += 0.2) {
          data.push([i, Math.pow(i, 2)]);
        }
        series.push({
          data,
          type: 'line',
          smooth: true,
        });
        break;

      case 'x^3':
        for (let i = -3; i <= 3; i += 0.2) {
          data.push([i, Math.pow(i, 3)]);
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
