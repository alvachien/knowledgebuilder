(window.webpackJsonp=window.webpackJsonp||[]).push([[1],{HKRH:function(t,e,i){"use strict";i.d(e,"a",function(){return g});var s=i("cp0P"),n=i("fXoL"),l=i("0IaG"),o=i("o0su"),c=i("XiUz"),a=i("bTqV"),u=i("MutI"),r=i("ofXK"),d=i("FKr1"),b=i("bv9b");const f=["file"];function h(t,e){1&t&&n.Ob(0,"mat-progress-bar",12)}function p(t,e){if(1&t&&(n.Tb(0,"mat-list-item"),n.Tb(1,"h4",10),n.Ec(2),n.Sb(),n.Dc(3,h,1,0,"mat-progress-bar",11),n.Sb()),2&t){const t=e.$implicit,i=n.fc();n.Cb(2),n.Fc(t.name),n.Cb(1),n.lc("ngIf",i.results)}}function m(t,e){1&t&&(n.Tb(0,"button",13),n.Ec(1,"Cancel"),n.Sb())}let g=(()=>{class t{constructor(t,e){this.dialogRef=t,this.uploadService=e,this.files=new Set,this.canBeClosed=!0,this.primaryButtonText="Upload",this.showCancelButton=!0,this.uploading=!1,this.uploadSuccessful=!1,this.uploadResults=[]}ngOnInit(){}onFilesAdded(){const t=this.file.nativeElement.files;for(const e in t)isNaN(parseInt(e))||this.files.add(t[e])}addFiles(){this.file.nativeElement.click()}closeDialog(){if(this.uploadSuccessful)return this.dialogRef.close(this.uploadResults);this.uploading=!0,this.results=this.uploadService.uploadFiles(this.files);for(const e in this.results)this.results[e].result.subscribe(t=>{this.uploadResults.push(t)});const t=[];for(let e in this.results)t.push(this.results[e].result);this.primaryButtonText="Finish",this.canBeClosed=!1,this.dialogRef.disableClose=!0,this.showCancelButton=!1,Object(s.a)(t).subscribe(t=>{this.canBeClosed=!0,this.dialogRef.disableClose=!1,this.uploadSuccessful=!0,this.uploading=!1})}}return t.\u0275fac=function(e){return new(e||t)(n.Nb(l.f),n.Nb(o.b))},t.\u0275cmp=n.Hb({type:t,selectors:[["app-image-upload"]],viewQuery:function(t,e){if(1&t&&n.Ic(f,!0),2&t){let t;n.rc(t=n.cc())&&(e.file=t.first)}},decls:15,vars:5,consts:[["type","file","multiple","",2,"display","none",3,"change"],["file",""],["fxLayout","column","fxLayoutAlign","space-evenly stretch",1,"container"],["mat-dialog-title",""],["mat-raised-button","","color","primary",1,"add-files-btn",3,"disabled","click"],["fxFlex",""],[4,"ngFor","ngForOf"],[1,"actions"],["mat-button","","mat-dialog-close","",4,"ngIf"],["mat-raised-button","","color","primary",3,"disabled","click"],["mat-line",""],["mode","determinate","value","100",4,"ngIf"],["mode","determinate","value","100"],["mat-button","","mat-dialog-close",""]],template:function(t,e){1&t&&(n.Tb(0,"input",0,1),n.bc("change",function(){return e.onFilesAdded()}),n.Sb(),n.Tb(2,"div",2),n.Tb(3,"h1",3),n.Ec(4,"Upload Files"),n.Sb(),n.Tb(5,"div"),n.Tb(6,"button",4),n.bc("click",function(){return e.addFiles()}),n.Ec(7," Add Files "),n.Sb(),n.Sb(),n.Tb(8,"mat-dialog-content",5),n.Tb(9,"mat-list"),n.Dc(10,p,4,2,"mat-list-item",6),n.Sb(),n.Sb(),n.Tb(11,"mat-dialog-actions",7),n.Dc(12,m,2,0,"button",8),n.Tb(13,"button",9),n.bc("click",function(){return e.closeDialog()}),n.Ec(14),n.Sb(),n.Sb(),n.Sb()),2&t&&(n.Cb(6),n.lc("disabled",e.uploading||e.uploadSuccessful),n.Cb(4),n.lc("ngForOf",e.files),n.Cb(2),n.lc("ngIf",e.showCancelButton),n.Cb(1),n.lc("disabled",!e.canBeClosed),n.Cb(1),n.Gc(" ",e.primaryButtonText," "))},directives:[c.c,c.b,l.g,a.b,l.d,c.a,u.a,r.l,l.b,r.m,u.b,d.j,b.a,l.c],styles:[".add-files-btn[_ngcontent-%COMP%]{float:right}[_nghost-%COMP%]{height:100%;display:flex;flex:1;flex-direction:column}.actions[_ngcontent-%COMP%]{justify-content:flex-end}.container[_ngcontent-%COMP%]{height:100%}"]}),t})()},dcRk:function(t,e,i){"use strict";i.d(e,"a",function(){return u});var s=i("ofXK"),n=i("3Pt+"),l=i("0LvA"),o=i("lR5k"),c=i("jIBr"),a=i("fXoL");let u=(()=>{class t{}return t.\u0275mod=a.Lb({type:t}),t.\u0275inj=a.Kb({factory:function(e){return new(e||t)},imports:[[s.c,n.h,n.r,c.a,l.b,o.b.forChild()]]}),t})()}}]);