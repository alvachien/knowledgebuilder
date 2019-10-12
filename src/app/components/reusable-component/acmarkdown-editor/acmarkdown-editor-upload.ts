import { IACMarkdownEditor, IACMarkdownEditorI18nLang } from './acmarkdown-editor-interface';
import { i18n } from './acmarkdown-editor-constant';
import { insertText, setSelectionByInlineText } from './acmarkdown-editor-util';

export class ACMarkdownEditorUpload {
  public element: HTMLElement;
  public isUploading: boolean;

  constructor() {
    this.isUploading = false;
    this.element = document.createElement('div');
    this.element.className = 'vditor-upload';
  }
}

export function validateFile(vditor: IACMarkdownEditor, files: File[]): File[] {
  vditor.tip.hide();
  const uploadFileList = [];
  let errorTip = '';
  let uploadingStr = '';
  const lang: (keyof IACMarkdownEditorI18nLang) = vditor.options.lang;

  for (let iMax = files.length, i = 0; i < iMax; i++) {
    const file = files[i];
    let validate = true;

    if (!file.name) {
      errorTip += `<li>${i18n[lang].nameEmpty}</li>`;
      validate = false;
    }

    if (file.size > vditor.options.upload.max) {
      errorTip += `<li>${file.name} ${i18n[lang].over} ${vditor.options.upload.max / 1024 / 1024}M</li>`;
      validate = false;
    }

    const lastIndex = file.name.lastIndexOf('.');
    const fileExt = file.name.substr(lastIndex);
    const filename = vditor.options.upload.filename(file.name.substr(0, lastIndex)) + fileExt;

    if (vditor.options.upload.accept) {
      let isAccept = false;
      vditor.options.upload.accept.split(',').forEach((item) => {
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
    vditor.tip.show(`<ul>${errorTip}</ul>`);
  }

  if (uploadingStr !== '') {
    insertText(vditor, uploadingStr, '');
  }

  return uploadFileList;
}

function genUploadedLabel(editorElement: HTMLPreElement, responseText: string, vditor: IACMarkdownEditor) {
  editorElement.focus();
  const response = JSON.parse(responseText);

  if (response.code === 1) {
    vditor.tip.show(response.msg);
  }

  if (response.data.errFiles) {
    response.data.errFiles.forEach((data: string) => {
      const lastIndex = data.lastIndexOf('.');
      const filename = vditor.options.upload.filename(data.substr(0, lastIndex)) + data.substr(lastIndex);
      const original = `[${filename}](${i18n[vditor.options.lang].uploading})`;
      setSelectionByInlineText(original, editorElement.childNodes);
      insertText(vditor, '', '', true);
    });
  }

  Object.keys(response.data.succMap).forEach((key) => {
    const path = response.data.succMap[key];
    const lastIndex = key.lastIndexOf('.');
    const filename = vditor.options.upload.filename(key.substr(0, lastIndex)) + key.substr(lastIndex);
    const original = `[${filename}](${i18n[vditor.options.lang].uploading})`;
    if (path.indexOf('.wav') === path.length - 4) {
      setSelectionByInlineText(original, editorElement.childNodes);
      insertText(vditor, `<audio controls='controls' src='${path}'></audio>\n`, '', true);
      return;
    }
    setSelectionByInlineText(original, editorElement.childNodes);
    insertText(vditor, `[${filename}](${path})`, '', true);
  });
}

export function uploadFiles(vditor: IACMarkdownEditor, files: FileList | DataTransferItemList | File[], element?: HTMLInputElement) {
  // FileList | DataTransferItemList | File[] => File[]
  const fileList = [];
  for (let iMax = files.length, i = 0; i < iMax; i++) {
    let fileItem = files[i];
    if (fileItem instanceof DataTransferItem) {
      fileItem = fileItem.getAsFile();
    }
    fileList.push(fileItem);
  }

  if (vditor.options.upload.handler) {
    const isValidate = vditor.options.upload.handler(fileList);
    if (typeof isValidate === 'string') {
      vditor.tip.show(isValidate);
      return;
    }
    return;
  }

  if (!vditor.options.upload.url || !vditor.upload) {
    if (element) {
      element.value = '';
    }
    alert('please config: options.upload.url');
    return;
  }

  if (vditor.options.upload.validate) {
    const isValidate = vditor.options.upload.validate(fileList);
    if (typeof isValidate === 'string') {
      vditor.tip.show(isValidate);
      return;
    }
  }

  const uploadFileList = validateFile(vditor, fileList);
  if (uploadFileList.length === 0) {
    if (element) {
      element.value = '';
    }
    return;
  }

  const formData = new FormData();
  for (let i = 0, iMax = uploadFileList.length; i < iMax; i++) {
    formData.append('file[]', uploadFileList[i]);
  }

  const xhr = new XMLHttpRequest();
  xhr.open('POST', vditor.options.upload.url);
  if (vditor.options.upload.token) {
    xhr.setRequestHeader('X-Upload-Token', vditor.options.upload.token);
  }
  vditor.upload.isUploading = true;
  vditor.editor.element.setAttribute('contenteditable', 'false');

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      vditor.upload.isUploading = false;
      if (element) {
        element.value = '';
      }
      vditor.editor.element.setAttribute('contenteditable', 'true');

      if (xhr.status === 200) {
        if (vditor.options.upload.success) {
          vditor.options.upload.success(vditor.editor.element, xhr.responseText);
        } else {
          genUploadedLabel(vditor.editor.element, xhr.responseText, vditor);
        }
      } else {
        if (vditor.options.upload.error) {
          vditor.options.upload.error(xhr.responseText);
        } else {
          vditor.tip.show(xhr.responseText);
          document.execCommand('undo');
        }
      }
      vditor.upload.element.style.display = 'none';
    }
  };
  xhr.upload.onprogress = (event: ProgressEvent) => {
    if (!event.lengthComputable) {
      return;
    }
    const progress = event.loaded / event.total * 100;
    vditor.upload.element.style.display = 'block';
    const progressBar = vditor.upload.element;
    progressBar.style.width = progress + '%';
  };
  xhr.send(formData);
}
