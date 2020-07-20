import { SafeUrl } from '@angular/platform-browser';

import { InjectionToken } from '@angular/core';

export type CoreEditorMode = 'normal' | 'diff';

// tslint:disable-next-line no-any
export type JoinedEditorOption = any;

export enum CodeEditorLoadingStatus {
  UNLOAD = 'unload',
  LOADING = 'loading',
  LOADED = 'LOADED'
}

export interface CodeEditorConfig {
  assetsRoot?: string | SafeUrl;
  defaultEditorOption?: JoinedEditorOption;

  onLoad?(): void;

  onFirstEditorInit?(): void;

  onInit?(): void;
}

export const CODE_EDITOR_CONFIG = new InjectionToken<CodeEditorConfig>('code-editor-config', {
  providedIn: 'root',
  factory: CODE_EDITOR_CONFIG_FACTORY
});

export function CODE_EDITOR_CONFIG_FACTORY(): CodeEditorConfig {
  return {};
}
