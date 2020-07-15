// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);

// History
// (1) ng g c pages\knowledge-items\KnowledgeItemDetail -m pages\knowledge-items
// (2) ng g c pages\question-bank-items\QuestionBankItemDetail -m pages\question-bank-items
// (3) index.ts
// (4) Route (ensure routing module has been added)
// (5) ng g service services\OData
// (6) Write service (Ensure HttpClientModule)
// (7) Add provided in App Module
// (8) Test metadata..
// Access to XMLHttpRequest at 'https://localhost:44355/odata/$metadata' from origin 'http://localhost:4200' has been blocked by CORS policy: 
//  Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
//
