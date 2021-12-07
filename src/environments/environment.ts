// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mockdata: false,
  version: '0.2.111',
  basehref: '/',

  idServerUrl: 'https://localhost:44353/',
  loginCallbackUrl: 'https://localhost:44367/logincallback.html',
  logoutCallbackUrl: 'https://localhost:44367',
  loginSlientRevewCallbackUrl: 'https://localhost:44367/silentrenewcallback.html',

  apiurlRoot: 'https://localhost:44355'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
