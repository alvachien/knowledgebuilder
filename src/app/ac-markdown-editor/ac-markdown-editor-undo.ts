import * as diff_match_patch from 'diff-match-patch';
import { formatRender, getSelectPosition, getText } from './ac-markdown-editor-util';
import { IACMEditor } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// Undo
export class ACMEditorUndo {
  private undoStack: Array<{ patchList: diff_match_patch.patch_obj[], end: number }>;
  private redoStack: Array<{ patchList: diff_match_patch.patch_obj[], end: number }>;
  private stackSize = 50;
  private dmp: diff_match_patch;
  private lastText: string;
  private hasUndo: boolean;
  private timeout: number;

  constructor() {
    this.redoStack = [];
    this.undoStack = [];
    // @ts-ignore
    this.dmp = new diff_match_patch();
    this.lastText = '';
    this.hasUndo = false;
  }

  public undo(editor: IACMEditor) {
    const state = this.undoStack.pop();
    if (!state || !state.patchList) {
      return;
    }
    this.redoStack.push(state);
    this.renderDiff(state, editor);
    this.hasUndo = true;
  }

  public redo(editor: IACMEditor) {
    const state = this.redoStack.pop();
    if (!state || !state.patchList) {
      return;
    }
    this.undoStack.push(state);
    this.renderDiff(state, editor, true);
  }

  public addToUndoStack(editor: IACMEditor) {
    const text = getText(editor.editor.element);
    if (editor.toolbar.elements.undo) {
      editor.toolbar.elements.undo.children[0].className =
        editor.toolbar.elements.undo.children[0].className.replace(` ${classPrefix}-menu--disabled`, '');
    }

    clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => {
      const diff = this.dmp.diff_main(text, this.lastText, true);
      const patchList = this.dmp.patch_make(text, this.lastText, diff);
      if (patchList.length === 0) {
        return;
      }
      this.lastText = text;
      this.undoStack.push({ patchList, end: getSelectPosition(editor.editor.element).end });
      if (this.undoStack.length > this.stackSize) {
        this.undoStack.shift();
      }
      if (this.hasUndo) {
        this.redoStack = [];
        this.hasUndo = false;
        if (editor.toolbar.elements.redo) {
          const redoClassName = editor.toolbar.elements.redo.children[0].className;
          if (redoClassName.indexOf(` ${classPrefix}-menu--disabled`) === -1) {
            editor.toolbar.elements.redo.children[0].className =
              redoClassName + ` ${classPrefix}-menu--disabled`;
          }
        }
      }
    }, 500);
  }

  private renderDiff(state: { patchList: diff_match_patch.patch_obj[], end: number }, editor: IACMEditor, isRedo: boolean = false) {
    let text;
    let positoin;
    if (isRedo) {
      const redoPatchList = this.dmp.patch_deepCopy(state.patchList).reverse();
      redoPatchList.forEach((patch) => {
        patch.diffs.forEach((diff) => {
          diff[0] = -diff[0];
        });
      });
      text = this.dmp.patch_apply(redoPatchList, this.lastText)[0];
      positoin = {
        end: state.end,
        start: state.end,
      };
    } else {
      text = this.dmp.patch_apply(state.patchList, this.lastText)[0];
      if (this.undoStack[this.undoStack.length - 1]) {
        positoin = {
          end: this.undoStack[this.undoStack.length - 1].end,
          start: this.undoStack[this.undoStack.length - 1].end,
        };
      }
    }

    this.lastText = text;

    formatRender(editor, text, positoin, false);

    if (editor.toolbar.elements.undo) {
      const undoClassName = editor.toolbar.elements.undo.children[0].className;
      if (this.undoStack.length !== 0) {
        editor.toolbar.elements.undo.children[0].className =
          undoClassName.replace(` ${classPrefix}-menu--disabled`, '');
      } else if (undoClassName.indexOf(` ${classPrefix}-menu--disabled`) === -1) {
        editor.toolbar.elements.undo.children[0].className =
          undoClassName + ` ${classPrefix}-menu--disabled`;
      }
    }

    if (editor.toolbar.elements.redo) {
      const redoClassName = editor.toolbar.elements.redo.children[0].className;
      if (this.redoStack.length !== 0) {
        editor.toolbar.elements.redo.children[0].className =
          redoClassName.replace(` ${classPrefix}-menu--disabled`, '');
      } else if (redoClassName.indexOf(` ${classPrefix}-menu--disabled`) === -1) {
        editor.toolbar.elements.redo.children[0].className =
          redoClassName + ` ${classPrefix}-menu--disabled`;
      }
    }
  }
}

