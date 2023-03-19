import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { JoinedEditorOptions, NzCodeEditorLoadingStatus, SafeAny } from './monaco-editor-types';

function tryTriggerFunc(fn?: (...args: SafeAny[]) => SafeAny): (...args: SafeAny) => void {
  return (...args: SafeAny[]) => {
    if (fn) {
      fn(...args);
    }
  };
}

interface MonacoEnvironment {
    globalAPI?: boolean;
    baseUrl?: string;
    getWorker?(workerId: string, label: string): Promise<Worker> | Worker;
    getWorkerUrl?(workerId: string, label: string): string;
}

export interface CodeEditorConfig {
    assetsRoot?: string | SafeUrl;
    extraConfig?: SafeAny;
    defaultEditorOption?: SafeAny;
    useStaticLoading?: boolean;
    monacoEnvironment?: MonacoEnvironment;
  
    onLoad?(): void;
  
    onFirstEditorInit?(): void;
  
    onInit?(): void;
}

declare const monaco: SafeAny;

// Caretaker note: previously, these were `NzCodeEditorService` properties.
// They're kept as static variables because this will allow loading Monaco only once.
// This applies to micro frontend apps with multiple Angular apps or a single Angular app
// that can be bootstrapped and destroyed multiple times (e.g. using Webpack module federation).
// Root providers are re-initialized each time the app is bootstrapped. Platform providers aren't.
// We can't make the `NzCodeEditorService` to be a platform provider (`@Injectable({ providedIn: 'platform' })`)
// since it depends on other root providers.
const loaded$ = new ReplaySubject<boolean>(1);
let loadingStatus = NzCodeEditorLoadingStatus.UNLOAD;

@Injectable({
  providedIn: 'root'
})
export class MonacoEditorService implements OnDestroy {
  private document: Document;
  private firstEditorInitialized = false;
  private option: JoinedEditorOptions = {};
  private config: CodeEditorConfig;

  option$ = new BehaviorSubject<JoinedEditorOptions>(this.option);

  constructor(@Inject(DOCUMENT) _document: SafeAny) {
    this.document = _document;
    this.config = { };
    this.option = this.config.defaultEditorOption || {};
  }

  ngOnDestroy(): void {
  }

  private _updateDefaultOption(option: JoinedEditorOptions): void {
    this.option = { ...this.option, ...option };
    this.option$.next(this.option);

    if ('theme' in option && option.theme) {
      monaco.editor.setTheme(option.theme);
    }
  }

  requestToInit(): Observable<JoinedEditorOptions> {
    if (loadingStatus === NzCodeEditorLoadingStatus.LOADED) {
      this.onInit();
      return of(this.getLatestOption());
    }

    if (loadingStatus === NzCodeEditorLoadingStatus.UNLOAD) {
      if (this.config.useStaticLoading && typeof monaco === 'undefined') {
        // warn(
        //   'You choose to use static loading but it seems that you forget ' +
        //     'to config webpack plugin correctly. Please refer to our official website' +
        //     'for more details about static loading.'
        // );
      } else {
        this.loadMonacoScript();
      }
    }

    return loaded$.pipe(
      tap(() => this.onInit()),
      map(() => this.getLatestOption())
    );
  }

  private loadMonacoScript(): void {
    if (this.config.useStaticLoading) {
      Promise.resolve().then(() => this.onLoad());
      return;
    }

    if (loadingStatus === NzCodeEditorLoadingStatus.LOADING) {
      return;
    }

    loadingStatus = NzCodeEditorLoadingStatus.LOADING;

    const assetsRoot = this.config.assetsRoot;
    const vs = assetsRoot ? `${assetsRoot}/vs` : 'assets/vs';
    const windowAsAny = window as SafeAny;
    const loadScript = this.document.createElement('script');

    loadScript.type = 'text/javascript';
    loadScript.src = `${vs}/loader.js`;

    const onLoad = (): void => {
      cleanup();
      windowAsAny.require.config({
        paths: { vs },
        ...this.config.extraConfig
      });
      windowAsAny.require(['vs/editor/editor.main'], () => {
        this.onLoad();
      });
    };

    const onError = (): void => {
      cleanup();
      throw new Error(`cannot load assets of monaco editor from source "${vs}".`);
    };

    const cleanup = (): void => {
      // Caretaker note: we have to remove these listeners once the `<script>` is loaded successfully
      // or not since the `onLoad` listener captures `this`, which will prevent the `NzCodeEditorService`
      // from being garbage collected.
      loadScript.removeEventListener('load', onLoad);
      loadScript.removeEventListener('error', onError);
      // We don't need to keep the `<script>` element within the `<body>` since JavaScript has
      // been executed and Monaco is available globally. E.g. Webpack, always removes `<script>`
      // elements after loading chunks (see its `LoadScriptRuntimeModule`).
      this.document.documentElement.removeChild(loadScript);
    };

    loadScript.addEventListener('load', onLoad);
    loadScript.addEventListener('error', onError);

    this.document.documentElement.appendChild(loadScript);
  }

  private onLoad(): void {
    loadingStatus = NzCodeEditorLoadingStatus.LOADED;
    loaded$.next(true);
    loaded$.complete();

    tryTriggerFunc(this.config.onLoad)();
  }

  private onInit(): void {
    if (!this.firstEditorInitialized) {
      this.firstEditorInitialized = true;
      tryTriggerFunc(this.config.onFirstEditorInit)();
    }

    tryTriggerFunc(this.config.onInit)();
  }

  private getLatestOption(): JoinedEditorOptions {
    return { ...this.option };
  }
}