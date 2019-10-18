import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, ViewEncapsulation,
  forwardRef, Input, Attribute, HostListener } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator,
  AbstractControl, ValidationErrors } from '@angular/forms';
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
  @Input() public instanceID: string;

  instanceEditor: ACMarkdownEditor;
  private _markdownValue: any;
  private _onChange = (_: any) => { };
  private _onTouched = () => { };

  constructor(
    @Attribute('required') public required: boolean = false,
    @Attribute('maxlength') public maxlength: number = -1,
  ) { }

  @HostListener('change') onChange(): void {
    console.log('entering onChange - change');

    if (this._onChange) {
      this._onChange(this.markdownValue);
    }
  }
  @HostListener('blur') onTouched(): void {
    console.log('entering onTouched - blur');

    if (this._onTouched) {
      this._onTouched();
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.instanceEditor = new ACMarkdownEditor('acme-' + this.instanceID, this.editorInstance.nativeElement, {
      input: () => {
        if (this.instanceEditor) {
          const val = this.instanceEditor.getValue();
          this.markdownValue = val;
        }
      }
    });
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
    console.log('entering writeValue');
    setTimeout(() => {
      this.markdownValue = value;
      if (typeof value !== 'undefined' && this.instanceEditor) {
        this.instanceEditor.setValue(value || '');
      }
    }, 1);
  }

  registerOnChange(fn: (_: any) => {}): void {
    console.log('entering registerOnChange');
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    console.log('entering registerOnTouched');
    this._onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    console.log('entering setDisabledState');
    if (isDisabled) {
      if (this.instanceEditor) {
        this.instanceEditor.disabled();
      }
    } else {
      if (this.instanceEditor) {
        this.instanceEditor.enable();
      }
    }
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
