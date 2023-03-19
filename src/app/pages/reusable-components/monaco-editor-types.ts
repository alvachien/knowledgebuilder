import { editor, Environment } from 'monaco-editor';

import IStandAloneEditorConstructionOptions = editor.IStandaloneEditorConstructionOptions;
import IDiffEditorConstructionOptions = editor.IDiffEditorConstructionOptions;

declare global {
  interface Window {
    MonacoEnvironment?: Environment | undefined;
  }
}

export type EditorOptions = IStandAloneEditorConstructionOptions;
export type DiffEditorOptions = IDiffEditorConstructionOptions;
export type JoinedEditorOptions = EditorOptions | DiffEditorOptions;

export declare type SafeAny = any;
export declare type OnTouchedType = () => SafeAny;
export declare type OnChangeType = (value: SafeAny) => void;

export type NzEditorMode = 'normal' | 'diff';

export const enum NzCodeEditorLoadingStatus {
  UNLOAD = 'unload',
  LOADING = 'loading',
  LOADED = 'LOADED'
}
