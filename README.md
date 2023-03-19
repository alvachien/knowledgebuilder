[![build and test](https://github.com/alvachien/knowledgebuilder/actions/workflows/build-test.yml/badge.svg)](https://github.com/alvachien/knowledgebuilder/actions/workflows/build-test.yml)


# Knowledge Builder

## Live Demo

Live demo available in Github pages. Click [this link](https://alvachien.github.io/knowledgebuilder/) to access it.

## Documentations 

本系列文章：

- 第一篇 [Part I: 业务场景和存储层设计](https://alvachien.github.io/2019/11/ODataBasedAPI1.html)

- 第二篇 [Part II: 开发环境及项目设置](https://alvachien.github.io/2019/11/ODataBasedAPI2.html)

- 第三篇 [Part III: Model类](https://alvachien.github.io/2019/11/ODataBasedAPI3.html)

- 第四篇 [Part IV: Data Context](https://alvachien.github.io/2019/11/ODataBasedAPI4.html)

- 第五篇 [Part V: Controller](https://alvachien.github.io/2020/07/ODataBasedAPI5.html)

- 第六篇 [Part VI: 为Controller添加CRUD](https://alvachien.github.io/2020/07/ODataBasedAPI6.html)

- 第七篇 [Part VII: 用Postman测试](https://alvachien.github.io/2020/07/ODataBasedAPI7.html)

- 第八篇 [Part VIII: Unit Test准备](https://alvachien.github.io/2020/07/ODataBasedAPI8.html)

- 第九篇 [Part IX: Angular程序环境准备](https://alvachien.github.io/2020/07/ODataBasedAPI9.html)

- 第十篇 [Part X: 完善Angular程序](https://alvachien.github.io/2020/07/ODataBasedAPI10.html)

- 第十一篇 [Part XI: 为API添加CORS支持](https://alvachien.github.io/2020/07/ODataBasedAPI11.html)

- 第十二篇 [Part XI: 为API添加CORS支持](https://alvachien.github.io/2020/07/ODataBasedAPI12.html)

## Web API in USE   

Web API in use with Github repo: [Link](https://github.com/alvachien/knowledgebuilderapi)

## UI development tips

- Generate a component:

```Powershell
ng g c pages\primary-school-math\MixedOperations -m pages\primary-school-math
```

- Generate a module:

```Powershell
ng g m pages\UserCollection --routing
```

In this case:   
- Folder 'user-collection' will be created under 'pages';
- Module 'UserCollection' will be created in file 'user-collection.module.ts';
- Module 'UserCollectionRoutingModule' will be created in file 'user-collection-routing.module.ts';

- Generate a service:

```Powershell
ng g service service\UIUtil
```

In this case, file 'uiutil.service.ts' will be created under folder 'services';


## Todos

|Functioanlity | Status | Comment |
|--|--|--|
|Printable Quiz Generator|Done|Make the quiz printable, via PDFs, and can be downloaded.|
|Puzzle Games: Sudou|In Process|Traiditonal Sudou games|
|Puzzle Games: Typing game|In process|Typing games|
|Puzzle Games: Gobang game|In Process|Gobang|
|Review of Exercise Items|Done|Review of exercise items|
|User collection|Done|User collection of exercise items|
|Expert mode|Done|Inviation to expert mode in API layer|
|Full screen|TBD|Full screen mode|
|Mock data for Github pages|Done|Mock data when deploying to Github pages.|

## Alternative ideas

### 1. Choice of Rich-text editor 

Since 6.0, [TinyMCE](https://www.tiny.cloud/) changed the license to `MIT`. It is now much easier to use it directly as rich-editor than encapsulating monaco-editor with markdown syntax.

However, `TinyMCE` lack of an open-source plugin to upport `Katex`. See communication within [issue](https://github.com/tinymce/tinymce/issues/3997) that TinyMCE won't support Katex.

More details, refer to branch `try-tinymce'.

### 2. Markdown format VS Richedit box format

Markdown format is popular now days while Richedit box provider normally render them to native HTML element.
Within this project, Markdown is chosen.

### 3. Math natively support or just support images

It is arguable that an editor can support Math (no matther `MathJax` or `Katex`) natively or just support images where Math formula can be.
Neither the `Latex` formular nor image can be read through Markdoown text.


## Credits

- Angular
- Angular Material
- eCharts
- marked
- Katex
- monaco-editor


## Author

**Alva Chien | 钱红俊**

A programmer, a Photographer, and a father. 

Contact me:

1. Via mail: alvachien@163.com. Or,
2. [Check my website](https://www.alvachien.com). 
 
## License

MIT
