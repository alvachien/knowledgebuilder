"use strict";(self.webpackChunkknowledgebuilder=self.webpackChunkknowledgebuilder||[]).push([[592],{6045:(f,d,t)=>{t.d(d,{D:()=>e});var a=t(5879);let e=(()=>{class o{}return o.\u0275fac=function(_){return new(_||o)},o.\u0275mod=a.oAB({type:o}),o.\u0275inj=a.cJS({}),o})()},2637:(f,d,t)=>{t.d(d,{J:()=>M});var a=t(9315),e=t(5879),o=t(9347),s=t(7093),_=t(6814),i=t(2296),p=t(3680),r=t(9038),g=t(6007);const h=["file"];function E(u,c){1&u&&e._UZ(0,"mat-progress-bar",11)}function C(u,c){if(1&u&&(e.TgZ(0,"mat-list-item")(1,"h4",9),e._uU(2),e.qZA(),e.YNc(3,E,1,0,"mat-progress-bar",10),e.qZA()),2&u){const n=c.$implicit,l=e.oxw();e.xp6(2),e.Oqu(n.name),e.xp6(1),e.Q6J("ngIf",l.results)}}function U(u,c){1&u&&(e.TgZ(0,"button",12),e._uU(1,"Cancel"),e.qZA())}let M=(()=>{class u{constructor(n,l){this.dialogRef=n,this.uploadService=l,this.files=new Set,this.canBeClosed=!0,this.primaryButtonText="Upload",this.showCancelButton=!0,this.uploading=!1,this.uploadSuccessful=!1,this.uploadResults=[]}onFilesAdded(){const n=this.file.nativeElement.files;for(const l in n)isNaN(parseInt(l))||this.files.add(n[l])}addFiles(){this.file.nativeElement.click()}closeDialog(){if(this.uploadSuccessful)return this.dialogRef.close(this.uploadResults);this.uploading=!0,this.results=this.uploadService.uploadFiles(this.files);for(const l in this.results)this.results[l].result.subscribe(m=>{this.uploadResults.push(m)});const n=[];for(const l in this.results)n.push(this.results[l].result);this.primaryButtonText="Finish",this.canBeClosed=!1,this.dialogRef.disableClose=!0,this.showCancelButton=!1,(0,a.D)(n).subscribe(()=>{this.canBeClosed=!0,this.dialogRef.disableClose=!1,this.uploadSuccessful=!0,this.uploading=!1})}}return u.\u0275fac=function(n){return new(n||u)(e.Y36(o.so),e.Y36(s.CB))},u.\u0275cmp=e.Xpm({type:u,selectors:[["app-image-upload"]],viewQuery:function(n,l){if(1&n&&e.Gf(h,5),2&n){let m;e.iGM(m=e.CRH())&&(l.file=m.first)}},decls:15,vars:5,consts:[["type","file","multiple","",2,"display","none",3,"change"],["file",""],[1,"container","column"],["mat-dialog-title",""],["mat-raised-button","","color","primary",1,"add-files-btn",3,"disabled","click"],[4,"ngFor","ngForOf"],[1,"actions"],["mat-button","","mat-dialog-close","",4,"ngIf"],["mat-raised-button","","color","primary",3,"disabled","click"],["mat-line",""],["mode","determinate","value","100",4,"ngIf"],["mode","determinate","value","100"],["mat-button","","mat-dialog-close",""]],template:function(n,l){1&n&&(e.TgZ(0,"input",0,1),e.NdJ("change",function(){return l.onFilesAdded()}),e.qZA(),e.TgZ(2,"div",2)(3,"h1",3),e._uU(4,"Upload Files"),e.qZA(),e.TgZ(5,"div")(6,"button",4),e.NdJ("click",function(){return l.addFiles()}),e._uU(7," Add Files "),e.qZA()(),e.TgZ(8,"mat-dialog-content")(9,"mat-list"),e.YNc(10,C,4,2,"mat-list-item",5),e.qZA()(),e.TgZ(11,"mat-dialog-actions",6),e.YNc(12,U,2,0,"button",7),e.TgZ(13,"button",8),e.NdJ("click",function(){return l.closeDialog()}),e._uU(14),e.qZA()()()),2&n&&(e.xp6(6),e.Q6J("disabled",l.uploading||l.uploadSuccessful),e.xp6(4),e.Q6J("ngForOf",l.files),e.xp6(2),e.Q6J("ngIf",l.showCancelButton),e.xp6(1),e.Q6J("disabled",!l.canBeClosed),e.xp6(1),e.hij(" ",l.primaryButtonText," "))},dependencies:[_.sg,_.O5,i.lW,o.ZT,o.uh,o.xY,o.H8,p.X2,r.i$,r.Tg,g.pW],styles:[".add-files-btn[_ngcontent-%COMP%]{float:right}[_nghost-%COMP%]{height:100%;display:flex;flex:1;flex-direction:column}.actions[_ngcontent-%COMP%]{justify-content:flex-end}.container[_ngcontent-%COMP%]{height:100%}"]}),u})()},9002:(f,d,t)=>{t.d(d,{l:()=>_});var a=t(6814),e=t(6223),o=t(5437),s=t(5879);let _=(()=>{class i{}return i.\u0275fac=function(r){return new(r||i)},i.\u0275mod=s.oAB({type:i}),i.\u0275inj=s.cJS({imports:[a.ez,e.u5,e.UX,o.U]}),i})()},5739:(f,d,t)=>{t.d(d,{M:()=>o});var a=t(3063),e=t(5879);let o=(()=>{class s{transform(i,p){return i.filter(r=>{if(p)switch(p){case a._g.string:return r.value===a.Nu.Like||r.value===a.Nu.Equal;case a._g.boolean:return r.value===a.Nu.Equal;case a._g.number:case a._g.date:return!(r.value===a.Nu.Like||r.value===a.Nu.Between)}return!0})}}return s.\u0275fac=function(i){return new(i||s)},s.\u0275pipe=e.Yjl({name:"operatorFilter",type:s,pure:!0}),s})()}}]);