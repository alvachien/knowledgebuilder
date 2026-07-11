# Knowledge Builder

An AI-powered web-based Learning app for English, Chinese, and Knowledge Bank.

## Branch `feature/v2`

Development of the Knowledge Builder web app (Angular 21, standalone components).

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 21.1.2.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:29800/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Vitest](https://vitest.dev).

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## API Backend

The frontend connects to different backend APIs depending on the version:

| Version | Package Version | API Repository | Protocol |
|---|---|---|---|
| **V1** | `0.*` | [Knowledge Builder API](https://github.com/alvachien/knowledgebuilderapi) | OData |
| **V2** | `1.*`+ | [aclearningutil](https://github.com/alvachien/aclearningutil) | REST |

The API URL is configured in `src/environments/environment*.ts` via `apiUrl`.


## Versions

| Version | Package Version | Branch | Status |
|---|---|---|---|
| **V1** | `0.*` | `v1` | Legacy — live on `gh-pages` branch |
| **V2** | `1.*`+ | `main`, `feature/v2` | Active development |

The `gh-pages` branch currently serves V1.


## Responsive Layout

The app adapts to different screen sizes with a three-tier layout (minimum width: 360px — supports most mobile phones in portrait):

| Breakpoint | Navbar | Sub-page Toolbars |
|---|---|---|
| **>1200px** | Full labels, user name visible | Normal layout with all controls |
| **821–1200px** | Abbreviated labels (Voc, Sent, etc.), icon-only user button | Compact single-row, item count hidden |
| **≤820px** | Hamburger menu with slide-out drawer | Two-row layout, smaller buttons |


## License

MIT

## Author

Alva Chien    

