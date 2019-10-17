import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, ViewEncapsulation, forwardRef, Input, Attribute } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors } from '@angular/forms';
import { ACMarkdownEditor } from './acmarkdown-editor';

@Component({
  selector: 'app-acmarkdown-editor',
  templateUrl: './acmarkdown-editor.component.html',
  styleUrls: ['./acmarkdown-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ACMarkdownEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => ACMarkdownEditorComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ACMarkdownEditorComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor, Validator {
  @ViewChild('acme_editor', {static: false}) editorInstance: ElementRef;
  @Input() public preRender: Function;
  @Input() public upload: Function;

  instanceEditor: ACMarkdownEditor;
  private _markdownValue: any;
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  constructor(
    @Attribute('required') public required: boolean = false,
    @Attribute('maxlength') public maxlength: number = -1,
  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.instanceEditor = new ACMarkdownEditor('test1', this.editorInstance.nativeElement);
  }
  ngOnDestroy() {

  }
  public get markdownValue(): any {
    return this._markdownValue || '';
  }
  public set markdownValue(value: any) {
    this._markdownValue = value;
    this._onChange(value);
  }

  writeValue(value: any | Array<any>): void {
    setTimeout(() => {
      this.markdownValue = value;
      if (typeof value !== 'undefined' && this.instanceEditor) {
        this.instanceEditor.setValue(value || '');
      }
    }, 1);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  validate(c: AbstractControl): ValidationErrors {
    let result: any = null;
    if (this.required && this.markdownValue.length === 0) {
      result = { required: true };
    }
    if (this.maxlength > 0 && this.markdownValue.length > this.maxlength) {
      result = { maxlength: true };
    }
    return result;
  }
}
