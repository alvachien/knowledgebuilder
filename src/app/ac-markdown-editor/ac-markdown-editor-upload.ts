import { insertText, setSelectionByInlineText, } from './ac-markdown-editor-util';
import { i18n } from './ac-markdown-editor-i18n';
import { IACMEditor, IACMEI18nLang } from './ac-markdown-editor-interfaces';
import { classPrefix } from './ac-markdown-editor-constants';

// Upload
export class ACMEditorUpload {
  public element: HTMLElement;
  public isUploading: boolean;

  constructor() {
    this.isUploading = false;
    this.element = document.createElement('div');
    this.element.className = `${classPrefix}-upload`;
  }
}

export function validateFile(editor: IACMEditor, files: File[]) {
  editor.tip.hide();
  const uploadFileList = [];
  let errorTip = '';
  let uploadingStr = '';
  const lang: (keyof IACMEI18nLang) = editor.options.lang;

  for (let iMax = files.length, i = 0; i < iMax; i++) {
    const file = files[i];
    let validate = true;

    if (!file.name) {
      errorTip += `<li>${i18n[lang].nameEmpty}</li>`;
      validate = false;
    }

    if (file.size > editor.options.upload.max) {
      errorTip += `<li>${file.name} ${i18n[lang].over} ${editor.options.upload.max / 1024 / 1024}M</li>`;
      validate = false;
    }

    const lastIndex = file.name.lastIndexOf('.');
    const fileExt = file.name.substr(lastIndex);
    const filename = editor.options.upload.filename(file.name.substr(0, lastIndex)) + fileExt;

    if (editor.options.upload.accept) {
      let isAccept = false;
      editor.options.upload.accept.split(',').forEach((item) => {
        const type = item.trim();
        if (type.indexOf('.') === 0) {
          if (fileExt === type) {
            isAccept = true;
          }
        } else {
          if (file.type.split('/')[0] === type.split('/')[0]) {
            isAccept = true;
          }
        }
      });

      if (!isAccept) {
        errorTip += `<li>${file.name} ${i18n[lang].fileTypeError}</li>`;
        validate = false;
      }
    }

    if (validate) {
      uploadFileList.push(file);
      uploadingStr += `${file.type.indexOf('image') === -1 ? '' : '!'}[${filename}](${i18n[lang].uploading})\n`;
    }
  }

  if (errorTip !== '') {
    editor.tip.show(`<ul>${errorTip}</ul>`);
  }

  if (uploadingStr !== '') {
    insertText(editor, uploadingStr, '');
  }

  return {
    uploadFileList,
    uploadingStr,
  };
}

export function genUploadedLabel(editorElement: HTMLPreElement, responseText: string, editor: IACMEditor) {
  editorElement.focus();
  const response = JSON.parse(responseText);

  if (response.code === 1) {
    editor.tip.show(response.msg);
  }

  if (response.data.errFiles) {
    response.data.errFiles.forEach((data: string) => {
      const lastIndex = data.lastIndexOf('.');
      const filename = editor.options.upload.filename(data.substr(0, lastIndex)) + data.substr(lastIndex);
      const original = `[${filename}](${i18n[editor.options.lang].uploading})`;
      setSelectionByInlineText(original, editorElement.childNodes);
      insertText(editor, '', '', true);
    });
  }

  Object.keys(response.data.succMap).forEach((key) => {
    const path = response.data.succMap[key];
    const lastIndex = key.lastIndexOf('.');
    const filename = editor.options.upload.filename(key.substr(0, lastIndex)) + key.substr(lastIndex);
    const original = `[${filename}](${i18n[editor.options.lang].uploading})`;
    if (path.indexOf('.wav') === path.length - 4) {
      setSelectionByInlineText(original, editorElement.childNodes);
      insertText(editor, `<audio controls='controls' src='${path}'></audio>\n`, '', true);
      return;
    }
    setSelectionByInlineText(original, editorElement.childNodes);
    insertText(editor, `[${filename}](${path})`, '', true);
  });
}

export const uploadFiles = (editor: IACMEditor, files: FileList | DataTransferItemList | File[], element?: HTMLInputElement) => {
  // FileList | DataTransferItemList | File[] => File[]
  const fileList = [];
  for (let iMax = files.length, i = 0; i < iMax; i++) {
    let fileItem = files[i];
    if (fileItem instanceof DataTransferItem) {
      fileItem = fileItem.getAsFile();
    }
    fileList.push(fileItem);
  }

  if (editor.options.upload.handler) {
    const isValidate = editor.options.upload.handler(fileList);
    if (typeof isValidate === 'string') {
      editor.tip.show(isValidate);
      return;
    }
    return;
  }

  if (!editor.options.upload.url || !editor.upload) {
    if (element) {
      element.value = '';
    }
    alert('please config: options.upload.url');
    return;
  }

  if (editor.options.upload.validate) {
    const isValidate = editor.options.upload.validate(fileList);
    if (typeof isValidate === 'string') {
      editor.tip.show(isValidate);
      return;
    }
  }

  const validateResult = validateFile(editor, fileList);
  if (validateResult.uploadFileList.length === 0) {
    if (element) {
      element.value = '';
    }
    return;
  }

  const formData = new FormData();
  for (let i = 0, iMax = validateResult.uploadFileList.length; i < iMax; i++) {
    formData.append('file[]', validateResult.uploadFileList[i]);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', editor.options.upload.url);
  if (editor.options.upload.token) {
    xhr.setRequestHeader('X-Upload-Token', editor.options.upload.token);
  }
  editor.upload.isUploading = true;
  editor.editor.element.setAttribute('contenteditable', 'false');

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      editor.upload.isUploading = false;
      if (element) {
        element.value = '';
      }
      editor.editor.element.setAttribute('contenteditable', 'true');

      if (xhr.status === 200) {
        if (editor.options.upload.success) {
          editor.options.upload.success(editor.editor.element, xhr.responseText);
        } else {
          let responseText = xhr.responseText;
          if (editor.options.upload.format) {
            responseText = editor.options.upload.format(files as File[], xhr.responseText);
          }
          genUploadedLabel(editor.editor.element, responseText, editor);
        }
      } else {
        if (editor.options.upload.error) {
          editor.options.upload.error(xhr.responseText);
        } else {
          editor.tip.show(xhr.responseText);
          validateResult.uploadingStr.split('\n').forEach((str) => {
            if (!str) {
              return;
            }
            setSelectionByInlineText(str, editor.editor.element.childNodes);
            insertText(editor, '', '', true);
          });
        }
      }
      editor.upload.element.style.display = 'none';
    }
  };
  xhr.upload.onprogress = (event: ProgressEvent) => {
    if (!event.lengthComputable) {
      return;
    }
    const progress = event.loaded / event.total * 100;
    editor.upload.element.style.display = 'block';
    const progressBar = editor.upload.element;
    progressBar.style.width = progress + '%';
  };
  xhr.send(formData);
};
