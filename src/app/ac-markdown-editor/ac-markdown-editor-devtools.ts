import { getText } from './ac-markdown-editor-util';
import * as echarts from 'echarts';
import { classPrefix } from './ac-markdown-editor-constants';
import { IACMEditor } from './ac-markdown-editor-interfaces';

export class ACMEditorDevTools {
  public element: HTMLDivElement;
  public ASTChart: echarts.ECharts;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-devtools`;
    this.element.innerHTML = `<div class='${classPrefix}--error'></div><div style='height: 100%;'></div>`;
  }

  public async renderEchart(editor: IACMEditor) {
    if (editor.devtools.element.style.display !== 'block') {
      return;
    }

    if (!this.ASTChart) {
      this.ASTChart = echarts.init(editor.devtools.element.lastElementChild as HTMLDivElement);
    }

    const data = editor.lute.RenderEChartsJSON(editor.currentMode === 'wysiwyg' ?
    editor.wysiwyg.element.textContent : getText(editor.editor.element));
    try {
      (this.element.lastElementChild as HTMLElement).style.display = 'block';
      this.element.firstElementChild.innerHTML = '';
      this.ASTChart.setOption({
        series: [
          {
            data: JSON.parse(data[0]) || data[1],
            initialTreeDepth: -1,
            label: {
              align: 'left',
              fontSize: 12,
              offset: [9, 12],
              position: 'top',
              verticalAlign: 'middle',
            },
            lineStyle: {
              color: '#4285f4',
              type: 'curve',
            },
            orient: 'vertical',
            roam: true,
            type: 'tree',
          },
        ],
        toolbox: {
          bottom: 25,
          emphasis: {
            iconStyle: {
              color: '#4285f4',
            },
          },
          feature: {
            restore: {
              show: true,
            },
            saveAsImage: {
              show: true,
            },
          },
          right: 15,
          show: true,
        },
      });
    } catch (e) {
      (this.element.lastElementChild as HTMLElement).style.display = 'none';
      this.element.firstElementChild.innerHTML = e;
    }
  }
}
