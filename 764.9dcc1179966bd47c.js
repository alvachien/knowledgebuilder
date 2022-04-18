"use strict";(self.webpackChunkknowledgebuilder=self.webpackChunkknowledgebuilder||[]).push([[764],{5764:(Ge,N,r)=>{r.r(N),r.d(N,{KnowledgeItemsModule:()=>He});var h=r(9808),d=r(3075),D=r(107),J=r(9354),T=r(7455),j=r(7607),B=r(5146),A=r(4521),e=r(5e3),I=r(6087),y=r(4847),k=r(6451),q=r(9646),F=r(8675),L=r(3900),Q=r(4004),E=r(262),m=r(6481),f=r(8966),C=r(3489),K=r(7531),Y=r(4623),v=r(7423);const z=["colls"];function V(n,l){if(1&n&&(e.TgZ(0,"mat-list-option",9),e._uU(1),e.qZA()),2&n){const t=l.$implicit,o=e.oxw();e.Q6J("disabled",o.isItemExistedInColl(t))("value",t.ID),e.xp6(1),e.hij(" ",t.Name," ")}}let W=(()=>{class n{constructor(t,o){this.dialogRef=t,this.data=o}ngAfterViewInit(){this.colls.selectionChange.subscribe({next:t=>{this.data.collids=[],this.colls.selectedOptions.selected.forEach(o=>{this.data.collids.push(+o.value)})},error:t=>{}})}onNoClick(){this.dialogRef.close()}isItemExistedInColl(t){return-1!==t.Items.findIndex(o=>o.RefID===this.data.knowledgeitemid&&o.RefType===m.ik.KnowledgeItem)}}return n.\u0275fac=function(t){return new(t||n)(e.Y36(f.so),e.Y36(f.WI))},n.\u0275cmp=e.Xpm({type:n,selectors:[["app-knowledge-item-addcoll-dlg"]],viewQuery:function(t,o){if(1&t&&e.Gf(z,5),2&t){let i;e.iGM(i=e.CRH())&&(o.colls=i.first)}},decls:21,vars:13,consts:[["mat-dialog-title",""],["mat-dialog-content",""],["appearance","fill",1,"control-full-width"],["matInput","","disabled","","name","excitemid",3,"ngModel","ngModelChange"],["colls",""],[3,"disabled","value",4,"ngFor","ngForOf"],["mat-dialog-actions",""],["mat-button","",3,"click"],["mat-button","",3,"disabled","mat-dialog-close"],[3,"disabled","value"]],template:function(t,o){1&t&&(e.TgZ(0,"h1",0),e._uU(1),e.ALo(2,"transloco"),e.qZA(),e.TgZ(3,"div",1),e.TgZ(4,"div"),e.TgZ(5,"mat-form-field",2),e.TgZ(6,"mat-label"),e._uU(7,"ID"),e.qZA(),e.TgZ(8,"input",3),e.NdJ("ngModelChange",function(a){return o.data.knowledgeitemid=a}),e.qZA(),e.qZA(),e.TgZ(9,"mat-label"),e._uU(10),e.ALo(11,"transloco"),e.qZA(),e.TgZ(12,"mat-selection-list",null,4),e.YNc(14,V,2,3,"mat-list-option",5),e.qZA(),e.qZA(),e.qZA(),e.TgZ(15,"div",6),e.TgZ(16,"button",7),e.NdJ("click",function(){return o.onNoClick()}),e._uU(17),e.ALo(18,"transloco"),e.qZA(),e.TgZ(19,"button",8),e._uU(20,"OK"),e.qZA(),e.qZA()),2&t&&(e.xp6(1),e.Oqu(e.lcZ(2,7,"AddToCollection")),e.xp6(7),e.Q6J("ngModel",o.data.knowledgeitemid),e.xp6(2),e.Oqu(e.lcZ(11,9,"UserCollection")),e.xp6(4),e.Q6J("ngForOf",o.data.availableColls),e.xp6(3),e.Oqu(e.lcZ(18,11,"Common.NoThanks")),e.xp6(2),e.Q6J("disabled",o.data.collids.length<=0)("mat-dialog-close",o.data))},directives:[f.uh,f.xY,C.KE,C.hX,K.Nt,d.Fj,d.JJ,d.On,Y.Ub,h.sg,Y.vS,f.H8,v.lW,f.ZT],pipes:[T.Ot],encapsulation:2}),n})();var Z=r(3984),M=r(4594),X=r(7238),S=r(5245),c=r(8279);function ee(n,l){1&n&&(e.TgZ(0,"th",17),e._uU(1,"#"),e.qZA())}function te(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"td",18),e.TgZ(1,"div"),e._uU(2),e.TgZ(3,"button",19),e.ALo(4,"transloco"),e.TgZ(5,"mat-icon"),e._uU(6,"launch"),e.qZA(),e.qZA(),e.TgZ(7,"button",20),e.ALo(8,"transloco"),e.TgZ(9,"mat-icon"),e._uU(10,"edit"),e.qZA(),e.qZA(),e.TgZ(11,"button",3),e.NdJ("click",function(){const a=e.CHM(t).$implicit;return e.oxw().onAddToCollection(a.ID)}),e.ALo(12,"transloco"),e.TgZ(13,"mat-icon"),e._uU(14,"add_to_queue"),e.qZA(),e.qZA(),e.TgZ(15,"button",21),e.NdJ("click",function(){const a=e.CHM(t).$implicit;return e.oxw().onDeleteItem(a.ID)}),e.ALo(16,"transloco"),e.TgZ(17,"mat-icon"),e._uU(18,"remove_circle"),e.qZA(),e.qZA(),e.qZA(),e.qZA()}if(2&n){const t=l.$implicit,o=e.oxw();e.xp6(2),e.hij(" ",t.ID," "),e.xp6(1),e.MGl("routerLink","display/",t.ID,""),e.s9C("matTooltip",e.lcZ(4,11,"Common.Display")),e.Q6J("disabled",!o.isExpertMode),e.xp6(4),e.MGl("routerLink","edit/",t.ID,""),e.s9C("matTooltip",e.lcZ(8,13,"Common.Change")),e.Q6J("disabled",!o.isExpertMode),e.xp6(4),e.s9C("matTooltip",e.lcZ(12,15,"AddToCollection")),e.Q6J("disabled",!o.isExpertMode),e.xp6(4),e.s9C("matTooltip",e.lcZ(16,17,"Common.Delete")),e.Q6J("disabled",!o.isExpertMode)}}function oe(n,l){1&n&&(e.TgZ(0,"th",17),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"Category")))}function ne(n,l){if(1&n&&(e.TgZ(0,"td",18),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n){const t=l.$implicit,o=e.oxw();e.xp6(1),e.Oqu(e.lcZ(2,1,o.getKnowledgeItemCategoryName(t.ItemCategory)))}}function ie(n,l){1&n&&(e.TgZ(0,"th",17),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"Title")))}function le(n,l){if(1&n&&(e.TgZ(0,"td",18),e._uU(1),e.qZA()),2&n){const t=l.$implicit;e.xp6(1),e.Oqu(t.Title)}}function ae(n,l){1&n&&(e.TgZ(0,"th",22),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"CreatedAt")))}function re(n,l){if(1&n&&(e.TgZ(0,"td",18),e._uU(1),e.ALo(2,"date"),e.qZA()),2&n){const t=l.$implicit;e.xp6(1),e.Oqu(e.xi3(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function se(n,l){1&n&&e._UZ(0,"tr",23)}function de(n,l){1&n&&e._UZ(0,"tr",24)}let ce=(()=>{class n{constructor(t,o,i){this.odataService=t,this.dialog=o,this.uiUtilSrv=i,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new e.vpe}getKnowledgeItemCategoryName(t){return(0,m._h)(t)}get isExpertMode(){return this.odataService.isLoggedin}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,k.T)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe((0,F.O)({}),(0,L.w)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getKnowledgeItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),(0,Q.U)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),(0,E.K)(()=>(this.isLoadingResults=!1,(0,q.of)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(o=>{t.push({refType:m.ik.KnowledgeItem,refId:o.ID})}),this.uiUtilSrv.navigatePreviewPage(t)}onGoToSearch(){this.uiUtilSrv.navigateKnowledgeItemSearchPage()}onDeleteItem(t){this.odataService.deleteExerciseItem(t).subscribe({next:o=>{this.onRefreshList()},error:o=>{this.uiUtilSrv.showSnackInfo(o)}})}onAddToCollection(t){this.odataService.getUserCollections().subscribe({next:o=>{const i=o.items;this.dialog.open(W,{width:"600px",closeOnNavigation:!1,data:{knowledgeitemid:t,availableColls:i,collids:[]}}).afterClosed().subscribe(s=>{const p=[];s.collids.forEach(_=>{const G=i.findIndex(x=>x.ID===+_);if(-1!==G){const x=new m.ly;x.ID=i[G].ID,x.RefID=t,x.RefType=m.ik.KnowledgeItem,p.push(x)}}),p.length>0&&this.odataService.addKnowledgeItemToCollection(p).subscribe({next:_=>{this.uiUtilSrv.showSnackInfo("DONE")},error:_=>{this.uiUtilSrv.showSnackInfo(_)}})})},error:o=>{this.uiUtilSrv.showSnackInfo(o)}})}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return n.\u0275fac=function(t){return new(t||n)(e.Y36(Z.CB),e.Y36(f.uw),e.Y36(Z.dM))},n.\u0275cmp=e.Xpm({type:n,selectors:[["app-knowledge-items"]],viewQuery:function(t,o){if(1&t&&(e.Gf(I.NW,5),e.Gf(y.YE,5)),2&t){let i;e.iGM(i=e.CRH())&&(o.paginator=i.first),e.iGM(i=e.CRH())&&(o.sort=i.first)}},decls:40,vars:21,consts:[[1,"toolbar-spacer"],["mat-icon-button","","color","primary","routerLink","create",3,"disabled","matTooltip"],["mat-icon-button","","color","accent","matTooltip","'Common.Search' | transloco}}",3,"disabled","click"],["mat-icon-button","","color","accent",3,"disabled","matTooltip","click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","accent",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","warn",3,"disabled","matTooltip","click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(t,o){1&t&&(e.TgZ(0,"mat-toolbar-row"),e.TgZ(1,"span"),e.TgZ(2,"h1"),e._uU(3),e.ALo(4,"transloco"),e.qZA(),e.qZA(),e._UZ(5,"span",0),e.TgZ(6,"section"),e.TgZ(7,"button",1),e.ALo(8,"transloco"),e.TgZ(9,"mat-icon"),e._uU(10,"add_circle"),e.qZA(),e.qZA(),e.TgZ(11,"button",2),e.NdJ("click",function(){return o.onGoToSearch()}),e.TgZ(12,"mat-icon"),e._uU(13,"search"),e.qZA(),e.qZA(),e.TgZ(14,"button",3),e.NdJ("click",function(){return o.onGoToPreview()}),e.ALo(15,"transloco"),e.TgZ(16,"mat-icon"),e._uU(17,"slideshow"),e.qZA(),e.qZA(),e.TgZ(18,"button",3),e.NdJ("click",function(){return o.onRefreshList()}),e.ALo(19,"transloco"),e.TgZ(20,"mat-icon"),e._uU(21,"refresh"),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.TgZ(22,"div",4),e.TgZ(23,"div",5),e.TgZ(24,"table",6),e.NdJ("matSortChange",function(){return o.resetPaging()}),e.ynx(25,7),e.YNc(26,ee,2,0,"th",8),e.YNc(27,te,19,19,"td",9),e.BQk(),e.ynx(28,10),e.YNc(29,oe,3,3,"th",8),e.YNc(30,ne,3,3,"td",9),e.BQk(),e.ynx(31,11),e.YNc(32,ie,3,3,"th",8),e.YNc(33,le,2,1,"td",9),e.BQk(),e.ynx(34,12),e.YNc(35,ae,3,3,"th",13),e.YNc(36,re,3,4,"td",9),e.BQk(),e.YNc(37,se,1,0,"tr",14),e.YNc(38,de,1,0,"tr",15),e.qZA(),e.qZA(),e._UZ(39,"mat-paginator",16),e.qZA()),2&t&&(e.xp6(3),e.Oqu(e.lcZ(4,13,"KnowledgeItem")),e.xp6(4),e.s9C("matTooltip",e.lcZ(8,15,"Common.Create")),e.Q6J("disabled",!o.isExpertMode),e.xp6(4),e.Q6J("disabled",!o.isExpertMode||o.dataSource.length<=0),e.xp6(3),e.s9C("matTooltip",e.lcZ(15,17,"Common.Preview")),e.Q6J("disabled",!o.isExpertMode||o.dataSource.length<=0),e.xp6(4),e.s9C("matTooltip",e.lcZ(19,19,"Common.Refresh")),e.Q6J("disabled",!o.isExpertMode),e.xp6(6),e.Q6J("dataSource",o.dataSource),e.xp6(13),e.Q6J("matHeaderRowDef",o.displayedColumns),e.xp6(1),e.Q6J("matRowDefColumns",o.displayedColumns),e.xp6(1),e.Q6J("length",o.resultsLength)("pageSize",20))},directives:[M.rD,v.lW,A.rH,X.gM,S.Hw,c.BZ,y.YE,c.w1,c.fO,c.ge,c.Dz,c.ev,y.nU,c.as,c.XQ,c.nj,c.Gk,I.NW],pipes:[T.Ot,h.uU],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),n})();var me=r(4707),$=r(1159),u=r(3778),pe=r(9909),g=r(9224),w=r(1125),R=r(4107),P=r(508),b=r(6688),H=r(7093);function ge(n,l){if(1&n&&(e.TgZ(0,"mat-option",22),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n){const t=l.$implicit;e.Q6J("value",t.value),e.xp6(1),e.Oqu(e.lcZ(2,2,t.i18nterm))}}function ue(n,l){1&n&&(e.TgZ(0,"mat-icon",25),e._uU(1,"cancel"),e.qZA())}function he(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-chip",23),e.NdJ("removed",function(){const a=e.CHM(t).$implicit;return e.oxw().removeTag(a)}),e._uU(1),e.YNc(2,ue,2,0,"mat-icon",24),e.qZA()}if(2&n){const t=l.$implicit,o=e.oxw();e.Q6J("selectable",o.selectable)("removable",o.isEditable),e.xp6(1),e.hij(" ",t," "),e.xp6(1),e.Q6J("ngIf",o.isEditable)}}function fe(n,l){if(1&n&&(e.TgZ(0,"mat-expansion-panel"),e.TgZ(1,"mat-expansion-panel-header"),e.TgZ(2,"mat-panel-title"),e._uU(3),e.ALo(4,"transloco"),e.qZA(),e.TgZ(5,"mat-panel-description"),e._uU(6),e.ALo(7,"transloco"),e.TgZ(8,"mat-icon"),e._uU(9,"info"),e.qZA(),e.qZA(),e.qZA(),e.TgZ(10,"div",26),e.TgZ(11,"div",27),e.TgZ(12,"mat-form-field",8),e.TgZ(13,"mat-label"),e._uU(14),e.ALo(15,"transloco"),e.qZA(),e._UZ(16,"input",28),e.ALo(17,"transloco"),e.ALo(18,"date"),e.qZA(),e.qZA(),e.TgZ(19,"div",27),e.TgZ(20,"mat-form-field",8),e.TgZ(21,"mat-label"),e._uU(22),e.ALo(23,"transloco"),e.qZA(),e._UZ(24,"input",28),e.ALo(25,"transloco"),e.ALo(26,"date"),e.qZA(),e.qZA(),e.qZA(),e.qZA()),2&n){const t=e.oxw();e.xp6(3),e.Oqu(e.lcZ(4,8,"Administrative")),e.xp6(3),e.Oqu(e.lcZ(7,10,"AdministrativeInfo")),e.xp6(8),e.Oqu(e.lcZ(15,12,"CreatedAt")),e.xp6(2),e.s9C("placeholder",e.lcZ(17,14,"CreatedAt")),e.Q6J("ngModel",e.xi3(18,16,t.currentItem.CreatedAt,"yyyy-M-d HH:mm:ss")),e.xp6(6),e.Oqu(e.lcZ(23,19,"ModifiedAt")),e.xp6(2),e.s9C("placeholder",e.lcZ(25,21,"ModifiedAt")),e.Q6J("ngModel",e.xi3(26,23,t.currentItem.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function _e(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-toolbar"),e.TgZ(1,"h3"),e._uU(2),e.ALo(3,"transloco"),e.qZA(),e._UZ(4,"div",29),e.TgZ(5,"button",30),e.NdJ("click",function(){return e.CHM(t),e.oxw().openUploadDialog()}),e.TgZ(6,"mat-icon"),e._uU(7,"file_upload"),e.qZA(),e.qZA(),e.qZA()}2&n&&(e.xp6(2),e.Oqu(e.lcZ(3,1,"Content")))}function Ce(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"div",27),e.TgZ(1,"ngx-monaco-editor",31),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().content=i}),e.qZA(),e.qZA()}if(2&n){const t=e.oxw();e.xp6(1),e.Q6J("options",t.editorOptions)("ngModel",t.content)}}let U=(()=>{class n{constructor(t,o,i,a){this.dialog=t,this.activateRoute=o,this.uiUtilSrv=i,this.odataService=a,this.routerID=-1,this.uiMode=u.sk.Create,this.currentMode="",this.editorOptions={theme:"vs-dark",wordWrap:"on"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[$.K5,$.OC],this.tags=[],this.arKnowledgeCtgies=[],this.arKnowledgeCtgies=(0,m.dJ)(),this.itemFormGroup=new d.cw({idControl:new d.NI({value:null,disabled:!0}),titleControl:new d.NI("",d.kI.required),ctgyControl:new d.NI({value:m.Nn.Concept}),tagControl:new d.NI})}get isDisplayMode(){return this.uiMode===u.sk.Display}get isCreateMode(){return this.uiMode===u.sk.Create}get isUpdateMode(){return this.uiMode===u.sk.Update}get isEditable(){return this.uiMode===u.sk.Create||this.uiMode===u.sk.Update}ngOnInit(){this.destroyed$=new me.t(1),this.activateRoute.url.subscribe({next:t=>{var o,i;t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=u.sk.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=u.sk.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=u.sk.Display,this.currentMode="Common.Display")),-1!==this.routerID?this.odataService.readKnowledgeItem(this.routerID,this.uiMode===u.sk.Update).subscribe({next:a=>{var s,p,_;null===(s=this.itemFormGroup.get("idControl"))||void 0===s||s.setValue(a.ID),null===(p=this.itemFormGroup.get("titleControl"))||void 0===p||p.setValue(a.Title),null===(_=this.itemFormGroup.get("ctgyControl"))||void 0===_||_.setValue(+a.ItemCategory),this.content=a.Content,this.tags=a.Tags,this.currentItem=a,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()},error:a=>{console.error(a)}}):(null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.setValue("NEW"),null===(i=this.itemFormGroup.get("idControl"))||void 0===i||i.disable(),this.itemFormGroup.markAsPristine(),this.itemFormGroup.markAsUntouched())},error:t=>{this.uiUtilSrv.showSnackInfo(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){var t,o,i,a;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&this.uiUtilSrv.showSnackInfo(this.itemFormGroup.errors.toString()));const s=new m.xX;s.ItemCategory=null===(t=this.itemFormGroup.get("ctgyControl"))||void 0===t?void 0:t.value,s.Content=this.content,s.Title=null===(o=this.itemFormGroup.get("titleControl"))||void 0===o?void 0:o.value,s.Tags=this.tags,this.odataService.createKnowledgeItem(s).subscribe({next:p=>{this.uiUtilSrv.navigateKnowledgeItemDisplayPage(p.ID)},error:p=>{this.uiUtilSrv.showSnackInfo(p)}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&this.uiUtilSrv.showSnackInfo(this.itemFormGroup.errors.toString()));this.currentItem&&(this.currentItem.ItemCategory=null===(i=this.itemFormGroup.get("ctgyControl"))||void 0===i?void 0:i.value,this.currentItem.Content=this.content,this.currentItem.Title=null===(a=this.itemFormGroup.get("titleControl"))||void 0===a?void 0:a.value,this.currentItem.Tags=this.tags,this.odataService.changeKnowledgeItem(this.currentItem).subscribe({next:s=>{this.uiUtilSrv.navigateKnowledgeItemDisplayPage(s.ID)},error:s=>{this.uiUtilSrv.showSnackInfo(s)}}))}}openUploadDialog(){this.dialog.open(pe.J,{width:"50%",height:"50%"}).afterClosed().subscribe({next:o=>{console.log(o),o.forEach(i=>{this.content+=`\n![Img](${i.url})\n          `})}})}addTag(t){const o=t.input,i=t.value;(i||"").trim()&&this.tags.push(i.trim()),o&&(o.value="")}removeTag(t){const o=this.tags.indexOf(t);o>=0&&this.tags.splice(o,1)}onReturnToList(){this.uiUtilSrv.navigateKnowledgeItemListPage()}onCreateNewOne(){this.uiUtilSrv.navigateKnowledgeItemCreatePage()}}return n.\u0275fac=function(t){return new(t||n)(e.Y36(f.uw),e.Y36(A.gz),e.Y36(Z.dM),e.Y36(Z.CB))},n.\u0275cmp=e.Xpm({type:n,selectors:[["app-knowledge-item-detail"]],decls:61,vars:44,consts:[["multi","",1,"example-headers-align"],["expanded",""],[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","#","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],[3,"value",4,"ngFor","ngForOf"],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"value"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,o){if(1&t&&(e.TgZ(0,"mat-card"),e.TgZ(1,"mat-card-header"),e.TgZ(2,"mat-card-title"),e._uU(3),e.ALo(4,"transloco"),e.qZA(),e.TgZ(5,"mat-card-subtitle"),e._uU(6),e.ALo(7,"transloco"),e.qZA(),e.qZA(),e.TgZ(8,"mat-card-content"),e.TgZ(9,"mat-accordion",0),e.TgZ(10,"mat-expansion-panel",1),e.TgZ(11,"mat-expansion-panel-header"),e.TgZ(12,"mat-panel-title"),e._uU(13),e.ALo(14,"transloco"),e.qZA(),e.TgZ(15,"mat-panel-description"),e._uU(16),e.ALo(17,"transloco"),e.TgZ(18,"mat-icon"),e._uU(19,"public"),e.qZA(),e.qZA(),e.qZA(),e.TgZ(20,"form",2),e.TgZ(21,"mat-form-field",3),e.TgZ(22,"mat-label"),e._uU(23,"#"),e.qZA(),e._UZ(24,"input",4),e.qZA(),e.TgZ(25,"mat-form-field",3),e._UZ(26,"input",5,6),e.ALo(28,"transloco"),e.TgZ(29,"mat-hint",7),e._uU(30),e.qZA(),e.qZA(),e.TgZ(31,"mat-form-field",8),e.TgZ(32,"mat-label"),e._uU(33),e.ALo(34,"transloco"),e.qZA(),e.TgZ(35,"mat-select",9),e.YNc(36,ge,3,4,"mat-option",10),e.qZA(),e.qZA(),e.TgZ(37,"mat-form-field",8),e.TgZ(38,"mat-label"),e._uU(39),e.ALo(40,"transloco"),e.qZA(),e.TgZ(41,"mat-chip-list",11,12),e.YNc(43,he,3,4,"mat-chip",13),e.TgZ(44,"input",14),e.NdJ("matChipInputTokenEnd",function(a){return o.addTag(a)}),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.YNc(45,fe,27,26,"mat-expansion-panel",15),e.qZA(),e.YNc(46,_e,8,3,"mat-toolbar",15),e.TgZ(47,"div",16),e.YNc(48,Ce,2,2,"div",17),e.TgZ(49,"div",18),e._UZ(50,"markdown",19),e.qZA(),e.qZA(),e.qZA(),e.TgZ(51,"mat-card-actions"),e.TgZ(52,"button",20),e.NdJ("click",function(){return o.onOK()}),e._uU(53),e.ALo(54,"transloco"),e.qZA(),e.TgZ(55,"button",21),e.NdJ("click",function(){return o.onReturnToList()}),e._uU(56),e.ALo(57,"transloco"),e.qZA(),e.TgZ(58,"button",20),e.NdJ("click",function(){return o.onCreateNewOne()}),e._uU(59),e.ALo(60,"transloco"),e.qZA(),e.qZA(),e.qZA()),2&t){const i=e.MAs(27),a=e.MAs(42);e.xp6(3),e.Oqu(e.lcZ(4,24,"KnowledgeItem")),e.xp6(3),e.Oqu(e.lcZ(7,26,o.currentMode)),e.xp6(7),e.Oqu(e.lcZ(14,28,"Header")),e.xp6(3),e.Oqu(e.lcZ(17,30,"HeaderInfo")),e.xp6(4),e.Q6J("formGroup",o.itemFormGroup),e.xp6(6),e.s9C("placeholder",e.lcZ(28,32,"Title")),e.xp6(4),e.hij("",i.value.length," / 30"),e.xp6(3),e.Oqu(e.lcZ(34,34,"Category")),e.xp6(3),e.Q6J("ngForOf",o.arKnowledgeCtgies),e.xp6(3),e.Oqu(e.lcZ(40,36,"Tags")),e.xp6(4),e.Q6J("ngForOf",o.tags),e.xp6(1),e.Q6J("matChipInputFor",a)("matChipInputSeparatorKeyCodes",o.separatorKeysCodes)("matChipInputAddOnBlur",o.addOnBlur),e.xp6(1),e.Q6J("ngIf",!o.isCreateMode&&o.currentItem),e.xp6(1),e.Q6J("ngIf",o.isCreateMode),e.xp6(2),e.Q6J("ngIf",!o.isDisplayMode),e.xp6(2),e.Q6J("data",o.content)("katexOptions",o.mathOptions),e.xp6(2),e.Q6J("disabled",!(o.isEditable&&o.itemFormGroup.valid)),e.xp6(1),e.Oqu(e.lcZ(54,38,"Save")),e.xp6(3),e.Oqu(e.lcZ(57,40,"Common.ReturnToList")),e.xp6(2),e.Q6J("disabled",!o.isDisplayMode),e.xp6(1),e.Oqu(e.lcZ(60,42,"Common.CreateAnotherOne"))}},directives:[g.a8,g.dk,g.n5,g.$j,g.dn,w.pp,w.ib,w.yz,w.yK,w.u4,S.Hw,d._Y,d.JL,d.sg,C.KE,C.hX,K.Nt,d.Fj,d.JJ,d.u,d.Q7,d.nD,C.bx,R.gD,h.sg,P.ey,b.qn,b.HS,h.O5,b.qH,b.oH,H.xw,H.yH,d.On,M.Ye,v.lW,D.T2,J.lF,g.hq],pipes:[T.Ot,h.uU],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}.example-action-buttons[_ngcontent-%COMP%]{padding-bottom:20px}.example-headers-align[_ngcontent-%COMP%]{margin:8px}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-title[_ngcontent-%COMP%], .example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%]{flex-basis:0}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%]{justify-content:space-between;align-items:center}.example-headers-align[_ngcontent-%COMP%]   .mat-form-field[_ngcontent-%COMP%] + .mat-form-field[_ngcontent-%COMP%]{margin-left:8px}"]}),n})();var Ze=r(1135),xe=r(8746),O=r(6856),Te=r(7446),ve=r(4834),we=r(7467);function Ae(n,l){if(1&n&&(e.TgZ(0,"mat-option",25),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n){const t=l.$implicit;e.Q6J("value",t.value),e.xp6(1),e.hij(" ",e.lcZ(2,2,t.displayas)," ")}}function Ie(n,l){if(1&n&&(e.TgZ(0,"mat-option",25),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n){const t=l.$implicit;e.Q6J("value",t.value),e.xp6(1),e.hij(" ",e.lcZ(2,2,t.i18nterm)," ")}}function Me(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-form-field"),e.TgZ(1,"input",26),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[0]=i}),e.ALo(2,"transloco"),e.qZA(),e.qZA()}if(2&n){const t=e.oxw().$implicit;e.xp6(1),e.s9C("placeholder",e.lcZ(2,2,"Value")),e.Q6J("ngModel",t.value[0])}}function be(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-form-field"),e.TgZ(1,"input",27),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[1]=i}),e.ALo(2,"transloco"),e.qZA(),e.qZA()}if(2&n){const t=e.oxw().$implicit;e.xp6(1),e.s9C("placeholder",e.lcZ(2,2,"Value")),e.Q6J("ngModel",t.value[1])}}function ye(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-form-field"),e.TgZ(1,"input",28),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[0]=i}),e.ALo(2,"transloco"),e.qZA(),e.qZA()}if(2&n){const t=e.oxw().$implicit;e.xp6(1),e.s9C("placeholder",e.lcZ(2,2,"Value")),e.Q6J("ngModel",t.value[0])}}function qe(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-form-field"),e.TgZ(1,"input",29),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[0]=i}),e.ALo(2,"transloco"),e.qZA(),e._UZ(3,"mat-datepicker-toggle",30),e._UZ(4,"mat-datepicker",null,31),e.qZA()}if(2&n){const t=e.MAs(5),o=e.oxw().$implicit;e.xp6(1),e.s9C("placeholder",e.lcZ(2,4,"Value")),e.Q6J("ngModel",o.value[0])("matDatepicker",t),e.xp6(2),e.Q6J("for",t)}}function Ke(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"mat-form-field"),e.TgZ(1,"input",29),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[1]=i}),e.ALo(2,"transloco"),e.qZA(),e._UZ(3,"mat-datepicker-toggle",30),e._UZ(4,"mat-datepicker",null,32),e.qZA()}if(2&n){const t=e.MAs(5),o=e.oxw().$implicit;e.xp6(1),e.s9C("placeholder",e.lcZ(2,4,"Value")),e.Q6J("ngModel",o.value[1])("matDatepicker",t),e.xp6(2),e.Q6J("for",t)}}function Se(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"div",33),e.TgZ(1,"mat-checkbox",34),e.NdJ("ngModelChange",function(i){return e.CHM(t),e.oxw().$implicit.value[0]=i}),e.qZA(),e.qZA()}if(2&n){const t=e.oxw().$implicit;e.xp6(1),e.Q6J("ngModel",t.value[0])}}function Ue(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"div",17),e.TgZ(1,"mat-form-field"),e.TgZ(2,"mat-select",18),e.NdJ("ngModelChange",function(i){return e.CHM(t).$implicit.fieldName=i})("selectionChange",function(){const a=e.CHM(t).$implicit;return e.oxw().onFieldSelectionChanged(a)}),e.ALo(3,"transloco"),e.YNc(4,Ae,3,4,"mat-option",19),e.qZA(),e.qZA(),e.TgZ(5,"mat-form-field"),e.TgZ(6,"mat-select",20),e.NdJ("ngModelChange",function(i){return e.CHM(t).$implicit.operator=i}),e.ALo(7,"transloco"),e.YNc(8,Ie,3,4,"mat-option",19),e.ALo(9,"operatorFilter"),e.qZA(),e.qZA(),e.YNc(10,Me,3,4,"mat-form-field",21),e.YNc(11,be,3,4,"mat-form-field",21),e.YNc(12,ye,3,4,"mat-form-field",21),e.YNc(13,qe,6,6,"mat-form-field",21),e.YNc(14,Ke,6,6,"mat-form-field",21),e.YNc(15,Se,2,1,"div",22),e.TgZ(16,"button",23),e.NdJ("click",function(){return e.CHM(t),e.oxw().onAddFilter()}),e.TgZ(17,"mat-icon"),e._uU(18,"add"),e.qZA(),e.qZA(),e.TgZ(19,"button",24),e.NdJ("click",function(){const a=e.CHM(t).index;return e.oxw().onRemoveFilter(a)}),e.TgZ(20,"mat-icon"),e._uU(21,"close"),e.qZA(),e.qZA(),e.qZA()}if(2&n){const t=l.$implicit,o=e.oxw();e.xp6(2),e.s9C("placeholder",e.lcZ(3,12,"Field")),e.Q6J("ngModel",t.fieldName),e.xp6(2),e.Q6J("ngForOf",o.allFields),e.xp6(2),e.s9C("placeholder",e.lcZ(7,14,"Operator")),e.Q6J("ngModel",t.operator),e.xp6(2),e.Q6J("ngForOf",e.xi3(9,16,o.allOperators,t.valueType)),e.xp6(2),e.Q6J("ngIf",1===t.valueType),e.xp6(1),e.Q6J("ngIf",1===t.valueType),e.xp6(1),e.Q6J("ngIf",2===t.valueType),e.xp6(1),e.Q6J("ngIf",3===t.valueType),e.xp6(1),e.Q6J("ngIf",3===t.valueType),e.xp6(1),e.Q6J("ngIf",4===t.valueType)}}function Oe(n,l){1&n&&(e.TgZ(0,"th",35),e._uU(1,"#"),e.qZA())}function Ne(n,l){if(1&n){const t=e.EpF();e.TgZ(0,"td",36),e.TgZ(1,"div"),e._uU(2),e.TgZ(3,"a",37),e.NdJ("click",function(){const a=e.CHM(t).$implicit;return e.oxw().onDisplayItem(a.ID)}),e._uU(4),e.ALo(5,"transloco"),e.qZA(),e.qZA(),e.qZA()}if(2&n){const t=l.$implicit;e.xp6(2),e.hij(" ",t.ID," "),e.xp6(2),e.Oqu(e.lcZ(5,2,"Common.Display"))}}function De(n,l){1&n&&(e.TgZ(0,"th",35),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"Category")))}function Je(n,l){if(1&n&&(e.TgZ(0,"td",36),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n){const t=l.$implicit,o=e.oxw();e.xp6(1),e.Oqu(e.lcZ(2,1,o.getKnowledgeItemCategoryName(t.ItemCategory)))}}function ke(n,l){1&n&&(e.TgZ(0,"th",35),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"Title")))}function Fe(n,l){if(1&n&&(e.TgZ(0,"td",36),e._uU(1),e.qZA()),2&n){const t=l.$implicit;e.xp6(1),e.Oqu(t.Title)}}function Le(n,l){1&n&&(e.TgZ(0,"th",35),e._uU(1),e.ALo(2,"transloco"),e.qZA()),2&n&&(e.xp6(1),e.Oqu(e.lcZ(2,1,"CreatedAt")))}function Qe(n,l){if(1&n&&(e.TgZ(0,"td",36),e._uU(1),e.ALo(2,"date"),e.qZA()),2&n){const t=l.$implicit;e.xp6(1),e.Oqu(e.xi3(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function Ee(n,l){1&n&&e._UZ(0,"tr",38)}function Ye(n,l){1&n&&e._UZ(0,"tr",39)}const $e=[{path:"",component:ce},{path:"create",component:U},{path:"display/:id",component:U},{path:"edit/:id",component:U},{path:"search",component:(()=>{class n{constructor(t,o){this.odataService=t,this.uiUtilSrv=o,this.filters=[],this.allOperators=[],this.allFields=[],this.filterEditable=!0,this.pageSize=20,this.pageSizeOptions=[20,40,60,100],this.isLoadingResults=!1,this.subjFilters=new Ze.X([]),this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.allOperators=m.c.getGeneralFilterOperatorDisplayStrings(),this.allFields=[{displayas:"Content",value:"Content",valueType:2}]}ngOnInit(){this.onAddFilter()}ngAfterViewInit(){this.subjFilters.subscribe(()=>this.paginator.pageIndex=0),(0,k.T)(this.subjFilters,this.paginator.page).pipe((0,F.O)({}),(0,L.w)(()=>{if(this.subjFilters.value.length<=0)return(0,q.of)([]);this.isLoadingResults=!0;const t=this.prepareFilters(this.subjFilters.value),o=this.paginator.pageSize;return this.odataService.getKnowledgeItems(o,o*this.paginator.pageIndex,void 0,void 0,t)}),(0,xe.x)(()=>this.isLoadingResults=!1),(0,Q.U)(t=>(this.resultsLength=t.totalCount,t.items)),(0,E.K)(()=>(0,q.of)(void 0))).subscribe({next:t=>this.dataSource=t,error:t=>this.uiUtilSrv.showSnackInfo(t)})}getKnowledgeItemCategoryName(t){return(0,m._h)(t)}onAddFilter(){this.filters.push(new m.T$)}onRemoveFilter(t){this.filters.splice(t,1),0===this.filters.length&&this.onAddFilter()}onFieldSelectionChanged(t){this.allFields.forEach(o=>{o.value===t.fieldName&&(t.valueType=o.valueType)})}prepareFilters(t){let o="";return t.sort((i,a)=>i.fieldName.localeCompare(a.fieldName)),t.forEach(i=>{"Content"===i.fieldName&&(i.operator===m.Nu.Equal?o=o?`${o} and ${i.fieldName} eq '${i.lowValue}'`:`${i.fieldName} eq '${i.lowValue}'`:i.operator===m.Nu.Like&&(o=o?`${o} and contains(${i.fieldName},'${i.lowValue}')`:`contains(${i.fieldName},'${i.lowValue}')`))}),o}onSearch(){const t=[];this.filters.forEach(o=>{const i={};switch(i.valueType=+o.valueType,o.valueType){case m._g.boolean:case m._g.date:case m._g.number:break;case m._g.string:i.fieldName=o.fieldName,i.operator=+o.operator,i.lowValue=o.value[0],i.highValue=o.operator===m.Nu.Between?o.value[1]:""}t.push(i)}),this.subjFilters.next(t)}onDisplayItem(t){this.uiUtilSrv.navigateKnowledgeItemDisplayPage(t)}onGoToPreview(){const t=[];this.dataSource.forEach(o=>{t.push({refType:m.ik.KnowledgeItem,refId:o.ID})}),this.uiUtilSrv.navigatePreviewPage(t)}}return n.\u0275fac=function(t){return new(t||n)(e.Y36(Z.CB),e.Y36(Z.dM))},n.\u0275cmp=e.Xpm({type:n,selectors:[["app-knowledge-item-search"]],viewQuery:function(t,o){if(1&t&&e.Gf(I.NW,7),2&t){let i;e.iGM(i=e.CRH())&&(o.paginator=i.first)}},decls:41,vars:18,consts:[["class","demo-full-width",4,"ngFor","ngForOf"],[1,"control-full-width"],["mat-button","","aria-label","Search",3,"click"],[1,"table-container","mat-elevation-z8"],["color","primary"],["mat-flat-button","","color","primary",3,"click"],[1,"table-container"],["mat-table","",1,"mat-elevation-z8",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"demo-full-width"],[3,"placeholder","ngModel","ngModelChange","selectionChange"],[3,"value",4,"ngFor","ngForOf"],[3,"placeholder","ngModel","ngModelChange"],[4,"ngIf"],["class","typechkbox",4,"ngIf"],["mat-button","","mat-icon-button","","aria-label","Add",3,"click"],["mat-button","","mat-icon-button","","aria-label","Clear",3,"click"],[3,"value"],["matInput","","type","number","name","lvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","number","name","hvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","text","name","lvalue_2",3,"placeholder","ngModel","ngModelChange"],["matInput","",3,"ngModel","matDatepicker","placeholder","ngModelChange"],["matSuffix","",3,"for"],["lvpicker",""],["hvpicker",""],[1,"typechkbox"],[3,"ngModel","ngModelChange"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,o){1&t&&(e.TgZ(0,"mat-card"),e.TgZ(1,"mat-card-header"),e.TgZ(2,"mat-card-title"),e._uU(3),e.ALo(4,"transloco"),e.qZA(),e.TgZ(5,"mat-card-subtitle"),e._uU(6),e.ALo(7,"transloco"),e.qZA(),e.qZA(),e.TgZ(8,"mat-card-content"),e.TgZ(9,"div"),e.YNc(10,Ue,22,19,"div",0),e.TgZ(11,"div",1),e.TgZ(12,"button",2),e.NdJ("click",function(){return o.onSearch()}),e.TgZ(13,"mat-icon"),e._uU(14,"search"),e.qZA(),e._uU(15),e.ALo(16,"transloco"),e.qZA(),e.qZA(),e.qZA(),e._UZ(17,"mat-divider"),e.TgZ(18,"div",3),e.TgZ(19,"mat-toolbar",4),e.TgZ(20,"mat-toolbar-row"),e.TgZ(21,"button",5),e.NdJ("click",function(){return o.onGoToPreview()}),e._uU(22),e.ALo(23,"transloco"),e.qZA(),e.qZA(),e.qZA(),e.TgZ(24,"div",6),e.TgZ(25,"table",7),e.ynx(26,8),e.YNc(27,Oe,2,0,"th",9),e.YNc(28,Ne,6,4,"td",10),e.BQk(),e.ynx(29,11),e.YNc(30,De,3,3,"th",9),e.YNc(31,Je,3,3,"td",10),e.BQk(),e.ynx(32,12),e.YNc(33,ke,3,3,"th",9),e.YNc(34,Fe,2,1,"td",10),e.BQk(),e.ynx(35,13),e.YNc(36,Le,3,3,"th",9),e.YNc(37,Qe,3,4,"td",10),e.BQk(),e.YNc(38,Ee,1,0,"tr",14),e.YNc(39,Ye,1,0,"tr",15),e.qZA(),e.qZA(),e._UZ(40,"mat-paginator",16),e.qZA(),e.qZA(),e.qZA()),2&t&&(e.xp6(3),e.Oqu(e.lcZ(4,10,"KnowledgeItem")),e.xp6(3),e.Oqu(e.lcZ(7,12,"Common.Search")),e.xp6(4),e.Q6J("ngForOf",o.filters),e.xp6(5),e.hij(" ",e.lcZ(16,14,"Common.Search")," "),e.xp6(7),e.Oqu(e.lcZ(23,16,"Common.Preview")),e.xp6(3),e.Q6J("dataSource",o.dataSource),e.xp6(13),e.Q6J("matHeaderRowDef",o.displayedColumns),e.xp6(1),e.Q6J("matRowDefColumns",o.displayedColumns),e.xp6(1),e.Q6J("length",o.resultsLength)("pageSize",20))},directives:[g.a8,g.dk,g.n5,g.$j,g.dn,h.sg,C.KE,R.gD,d.JJ,d.On,P.ey,h.O5,K.Nt,d.wV,d.Fj,O.hl,O.nW,C.R9,O.Mq,Te.oG,v.lW,S.Hw,ve.d,M.Ye,M.rD,c.BZ,c.w1,c.fO,c.ge,c.Dz,c.ev,v.zs,c.as,c.XQ,c.nj,c.Gk,I.NW],pipes:[T.Ot,we.M,h.uU],styles:[".table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;margin-top:16px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.data-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}"]}),n})()}];let Re=(()=>{class n{}return n.\u0275fac=function(t){return new(t||n)},n.\u0275mod=e.oAB({type:n}),n.\u0275inj=e.cJS({imports:[[A.Bz.forChild($e)],A.Bz]}),n})();var Pe=r(558);let He=(()=>{class n{}return n.\u0275fac=function(t){return new(t||n)},n.\u0275mod=e.oAB({type:n}),n.\u0275inj=e.cJS({providers:[],imports:[[h.ez,d.u5,d.UX,j.U,B.l,D.nm,J.JP.forChild(),Re,T.y4,Pe.D]]}),n})()}}]);