"use strict";(self.webpackChunkknowledgebuilder=self.webpackChunkknowledgebuilder||[]).push([[45],{5045:(gt,y,l)=>{l.r(y),l.d(y,{UserCollectionModule:()=>Ct});var C=l(9808),c=l(3075),S=l(107),L=l(9354),Z=l(8608),N=l(7607),R=l(5146),q=l(558),g=l(4521),t=l(5e3),D=l(6087),U=l(4847),P=l(6451),k=l(9646),J=l(8675),Q=l(3900),E=l(4004),H=l(262),f=l(3984),b=l(4594),M=l(7423),I=l(7238),O=l(5245),s=l(8279);function G(o,i){1&o&&(t.TgZ(0,"th",16),t._uU(1,"#"),t.qZA())}function Y(o,i){if(1&o){const e=t.EpF();t.TgZ(0,"td",17)(1,"div"),t._uU(2),t.TgZ(3,"button",18),t.ALo(4,"transloco"),t.TgZ(5,"mat-icon"),t._uU(6,"launch"),t.qZA()(),t.TgZ(7,"button",2),t.NdJ("click",function(){const r=t.CHM(e).$implicit;return t.oxw().onPreview(r.ID)}),t.ALo(8,"transloco"),t.TgZ(9,"mat-icon"),t._uU(10,"slideshow"),t.qZA()(),t.TgZ(11,"button",19),t.ALo(12,"transloco"),t.TgZ(13,"mat-icon"),t._uU(14,"edit"),t.qZA()(),t.TgZ(15,"button",20),t.NdJ("click",function(){const r=t.CHM(e).$implicit;return t.oxw().onDeleteItem(r.ID)}),t.ALo(16,"transloco"),t.TgZ(17,"mat-icon"),t._uU(18,"remove_circle"),t.qZA()()()()}if(2&o){const e=i.$implicit,n=t.oxw();t.xp6(2),t.hij(" ",e.ID," "),t.xp6(1),t.MGl("routerLink","display/",e.ID,""),t.s9C("matTooltip",t.lcZ(4,11,"Common.Display")),t.Q6J("disabled",!n.isExpertMode),t.xp6(4),t.s9C("matTooltip",t.lcZ(8,13,"Common.Preview")),t.Q6J("disabled",!(n.isExpertMode&&e.Items&&e.Items.length>0)),t.xp6(4),t.MGl("routerLink","edit/",e.ID,""),t.s9C("matTooltip",t.lcZ(12,15,"Common.Change")),t.Q6J("disabled",!n.isExpertMode),t.xp6(4),t.s9C("matTooltip",t.lcZ(16,17,"Common.Delete")),t.Q6J("disabled",!n.isExpertMode)}}function F(o,i){1&o&&(t.TgZ(0,"th",16),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Common.Name")))}function j(o,i){if(1&o&&(t.TgZ(0,"td",17),t._uU(1),t.qZA()),2&o){const e=i.$implicit;t.xp6(1),t.Oqu(e.Name)}}function $(o,i){1&o&&(t.TgZ(0,"th",16),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Common.Comment")))}function z(o,i){if(1&o&&(t.TgZ(0,"td",17),t._uU(1),t.qZA()),2&o){const e=i.$implicit;t.xp6(1),t.Oqu(e.Comment)}}function B(o,i){1&o&&(t.TgZ(0,"th",21),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"CreatedAt")))}function K(o,i){if(1&o&&(t.TgZ(0,"td",17),t._uU(1),t.ALo(2,"date"),t.qZA()),2&o){const e=i.$implicit;t.xp6(1),t.Oqu(t.xi3(2,1,e.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function X(o,i){1&o&&t._UZ(0,"tr",22)}function V(o,i){1&o&&t._UZ(0,"tr",23)}let W=(()=>{class o{constructor(e,n){this.odataService=e,this.uiUtilSrv=n,this.displayedColumns=["id","name","comment","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new t.vpe}get isExpertMode(){return this.odataService.isLoggedin}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,P.T)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe((0,J.O)({}),(0,Q.w)(()=>{this.isLoadingResults=!0;const e=this.paginator.pageSize;return this.odataService.getUserCollections(e,e*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),(0,E.U)(e=>(this.isLoadingResults=!1,this.resultsLength=e.totalCount,e.items)),(0,H.K)(()=>(this.isLoadingResults=!1,(0,k.of)([])))).subscribe(e=>this.dataSource=e)}onGoToSearch(){}onPreview(e){const n=[];this.dataSource.forEach(a=>{a.ID===e&&a.Items.forEach(r=>{n.push({refType:r.RefType,refId:r.RefID})})}),this.uiUtilSrv.navigatePreviewPage(n)}onDeleteItem(e){}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return o.\u0275fac=function(e){return new(e||o)(t.Y36(f.CB),t.Y36(f.dM))},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-user-collection"]],viewQuery:function(e,n){if(1&e&&(t.Gf(D.NW,5),t.Gf(U.YE,5)),2&e){let a;t.iGM(a=t.CRH())&&(n.paginator=a.first),t.iGM(a=t.CRH())&&(n.sort=a.first)}},decls:37,vars:20,consts:[[1,"toolbar-spacer"],["mat-icon-button","","color","primary","routerLink","create",3,"disabled","matTooltip"],["mat-icon-button","","color","accent",3,"disabled","matTooltip","click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","name"],["matColumnDef","comment"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","accent",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","warn",3,"disabled","matTooltip","click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(e,n){1&e&&(t.TgZ(0,"mat-toolbar-row")(1,"span")(2,"h1"),t._uU(3),t.ALo(4,"transloco"),t.qZA()(),t._UZ(5,"span",0),t.TgZ(6,"section")(7,"button",1),t.ALo(8,"transloco"),t.TgZ(9,"mat-icon"),t._uU(10,"add_circle"),t.qZA()(),t.TgZ(11,"button",2),t.NdJ("click",function(){return n.onGoToSearch()}),t.ALo(12,"transloco"),t.TgZ(13,"mat-icon"),t._uU(14,"search"),t.qZA()(),t.TgZ(15,"button",2),t.NdJ("click",function(){return n.onRefreshList()}),t.ALo(16,"transloco"),t.TgZ(17,"mat-icon"),t._uU(18,"refresh"),t.qZA()()()(),t.TgZ(19,"div",3)(20,"div",4)(21,"table",5),t.NdJ("matSortChange",function(){return n.resetPaging()}),t.ynx(22,6),t.YNc(23,G,2,0,"th",7),t.YNc(24,Y,19,19,"td",8),t.BQk(),t.ynx(25,9),t.YNc(26,F,3,3,"th",7),t.YNc(27,j,2,1,"td",8),t.BQk(),t.ynx(28,10),t.YNc(29,$,3,3,"th",7),t.YNc(30,z,2,1,"td",8),t.BQk(),t.ynx(31,11),t.YNc(32,B,3,3,"th",12),t.YNc(33,K,3,4,"td",8),t.BQk(),t.YNc(34,X,1,0,"tr",13),t.YNc(35,V,1,0,"tr",14),t.qZA()(),t._UZ(36,"mat-paginator",15),t.qZA()),2&e&&(t.xp6(3),t.Oqu(t.lcZ(4,12,"UserCollections")),t.xp6(4),t.s9C("matTooltip",t.lcZ(8,14,"Common.Create")),t.Q6J("disabled",!n.isExpertMode),t.xp6(4),t.s9C("matTooltip",t.lcZ(12,16,"Common.Search")),t.Q6J("disabled",!n.isExpertMode||n.dataSource.length<=0),t.xp6(4),t.s9C("matTooltip",t.lcZ(16,18,"Common.Refresh")),t.Q6J("disabled",!n.isExpertMode),t.xp6(6),t.Q6J("dataSource",n.dataSource),t.xp6(13),t.Q6J("matHeaderRowDef",n.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",n.displayedColumns),t.xp6(1),t.Q6J("length",n.resultsLength)("pageSize",20))},directives:[b.rD,M.lW,g.rH,I.gM,O.Hw,s.BZ,U.YE,s.w1,s.fO,s.ge,s.Dz,s.ev,U.nU,s.as,s.XQ,s.nj,s.Gk,D.NW],pipes:[Z.Ot,C.uU],styles:[".example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}"]}),o})();var tt=l(4707),d=l(3778),x=l(6481),et=l(8966),u=l(9224),h=l(1125),v=l(3489),ot=l(7531),w=l(7093);function nt(o,i){if(1&o&&(t.TgZ(0,"mat-expansion-panel")(1,"mat-expansion-panel-header")(2,"mat-panel-title"),t._uU(3),t.ALo(4,"transloco"),t.qZA(),t.TgZ(5,"mat-panel-description"),t._uU(6),t.ALo(7,"transloco"),t.TgZ(8,"mat-icon"),t._uU(9,"info"),t.qZA()()(),t.TgZ(10,"div",12)(11,"div",13)(12,"mat-form-field",3)(13,"mat-label"),t._uU(14),t.ALo(15,"transloco"),t.qZA(),t._UZ(16,"input",14),t.ALo(17,"transloco"),t.ALo(18,"date"),t.qZA()(),t.TgZ(19,"div",13)(20,"mat-form-field",3)(21,"mat-label"),t._uU(22),t.ALo(23,"transloco"),t.qZA(),t._UZ(24,"input",14),t.ALo(25,"transloco"),t.ALo(26,"date"),t.qZA()()()()),2&o){const e=t.oxw();t.xp6(3),t.Oqu(t.lcZ(4,8,"Administrative")),t.xp6(3),t.Oqu(t.lcZ(7,10,"AdministrativeInfo")),t.xp6(8),t.Oqu(t.lcZ(15,12,"CreatedAt")),t.xp6(2),t.s9C("placeholder",t.lcZ(17,14,"CreatedAt")),t.Q6J("ngModel",t.xi3(18,16,e.itemObject.CreatedAt,"yyyy-M-d HH:mm:ss")),t.xp6(6),t.Oqu(t.lcZ(23,19,"ModifiedAt")),t.xp6(2),t.s9C("placeholder",t.lcZ(25,21,"ModifiedAt")),t.Q6J("ngModel",t.xi3(26,23,e.itemObject.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function it(o,i){1&o&&(t.TgZ(0,"th",26),t._uU(1,"ID"),t.qZA())}function at(o,i){if(1&o){const e=t.EpF();t.TgZ(0,"td",27),t._uU(1),t.TgZ(2,"button",28),t.NdJ("click",function(){const r=t.CHM(e).$implicit;return t.oxw(2).onDisplayExerciseItem(r.RefID)}),t.ALo(3,"transloco"),t.TgZ(4,"mat-icon"),t._uU(5,"launch"),t.qZA()(),t.TgZ(6,"button",29),t.NdJ("click",function(){const r=t.CHM(e).$implicit;return t.oxw(2).onChangeExerciseItem(r.RefID)}),t.ALo(7,"transloco"),t.TgZ(8,"mat-icon"),t._uU(9,"edit"),t.qZA()(),t.TgZ(10,"button",30),t.NdJ("click",function(){const r=t.CHM(e).$implicit;return t.oxw(2).onDeleteCollItem(r)}),t.ALo(11,"transloco"),t.TgZ(12,"mat-icon"),t._uU(13,"remove_circle"),t.qZA()()()}if(2&o){const e=i.$implicit;t.xp6(1),t.hij(" ",e.RefID," "),t.xp6(1),t.s9C("matTooltip",t.lcZ(3,4,"Common.Display")),t.xp6(4),t.s9C("matTooltip",t.lcZ(7,6,"Common.Change")),t.xp6(4),t.s9C("matTooltip",t.lcZ(11,8,"Common.Delete"))}}function lt(o,i){1&o&&(t.TgZ(0,"th",26),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Type")))}function rt(o,i){if(1&o&&(t.TgZ(0,"td",27),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o){const e=i.$implicit,n=t.oxw(2);t.xp6(1),t.Oqu(t.lcZ(2,1,n.getTagReferenceTypeName(e.RefType)))}}function st(o,i){1&o&&(t.TgZ(0,"th",26),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&o&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Quiz.Date")))}function ct(o,i){if(1&o&&(t.TgZ(0,"td",27),t._uU(1),t.ALo(2,"date"),t.qZA()),2&o){const e=i.$implicit;t.xp6(1),t.Oqu(t.xi3(2,1,e.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function mt(o,i){1&o&&t._UZ(0,"tr",31)}function dt(o,i){1&o&&t._UZ(0,"tr",32)}function pt(o,i){if(1&o&&(t.TgZ(0,"div")(1,"mat-toolbar-row"),t._UZ(2,"span",15)(3,"section"),t.qZA(),t.TgZ(4,"div",16)(5,"div",17)(6,"table",18),t.ynx(7,19),t.YNc(8,it,2,0,"th",20),t.YNc(9,at,14,10,"td",21),t.BQk(),t.ynx(10,22),t.YNc(11,lt,3,3,"th",20),t.YNc(12,rt,3,3,"td",21),t.BQk(),t.ynx(13,23),t.YNc(14,st,3,3,"th",20),t.YNc(15,ct,3,4,"td",21),t.BQk(),t.YNc(16,mt,1,0,"tr",24),t.YNc(17,dt,1,0,"tr",25),t.qZA()()()()),2&o){const e=t.oxw();t.xp6(6),t.Q6J("dataSource",e.dataSource),t.xp6(10),t.Q6J("matHeaderRowDef",e.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",e.displayedColumns)}}let _=(()=>{class o{constructor(e,n,a,r){var m,p;this.dialog=e,this.activateRoute=n,this.uiUtilSrv=a,this.odataService=r,this.routerID=-1,this.displayedColumns=["refid","reftype","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.getTagReferenceTypeName=x.GE,this.uiMode=d.sk.Create,this.currentMode="",this.itemFormGroup=new c.cw({idControl:new c.NI({value:null,disabled:!0}),userControl:new c.NI({value:null===(m=this.odataService.currentUser)||void 0===m?void 0:m.getUserId(),disabled:!0}),nameControl:new c.NI,commentControl:new c.NI}),this.userDisplayAs=null===(p=this.odataService.currentUserDetail)||void 0===p?void 0:p.displayAs}get isDisplayMode(){return this.uiMode===d.sk.Display}get isCreateMode(){return this.uiMode===d.sk.Create}get isUpdateMode(){return this.uiMode===d.sk.Update}get isEditable(){return this.uiMode===d.sk.Create||this.uiMode===d.sk.Update}ngOnInit(){this.destroyed$=new tt.t(1),this.activateRoute.url.subscribe({next:e=>{e instanceof Array&&e.length>0&&("create"===e[0].path?(this.routerID=-1,this.uiMode=d.sk.Create,this.currentMode="Common.Create"):"edit"===e[0].path?(this.routerID=+e[1].path,this.uiMode=d.sk.Update,this.currentMode="Common.Change"):"display"===e[0].path&&(this.routerID=+e[1].path,this.uiMode=d.sk.Display,this.currentMode="Common.Display")),-1!==this.routerID&&this.odataService.readUserCollection(this.routerID,this.uiMode===d.sk.Update).subscribe({next:n=>{this.onSetHeaderData(n),this.itemObject=n,this.dataSource=n.Items},error:n=>{this.uiUtilSrv.showSnackInfo(n)}})},error:e=>{this.uiUtilSrv.showSnackInfo(e)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onSetHeaderData(e){var n,a,r,m,p,T,A;null===(n=this.itemFormGroup.get("idControl"))||void 0===n||n.setValue(e.ID),null===(a=this.itemFormGroup.get("idControl"))||void 0===a||a.disable(),null===(r=this.itemFormGroup.get("userControl"))||void 0===r||r.setValue(null===(m=this.odataService.currentUser)||void 0===m?void 0:m.getUserId()),null===(p=this.itemFormGroup.get("userControl"))||void 0===p||p.disable(),null===(T=this.itemFormGroup.get("nameControl"))||void 0===T||T.setValue(e.Name),null===(A=this.itemFormGroup.get("commentControl"))||void 0===A||A.setValue(e.Comment),this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()}onOK(){var e,n;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&this.uiUtilSrv.showSnackInfo(this.itemFormGroup.errors.toString()));this.itemObject=new x.GH,this.itemObject.Name=null===(e=this.itemFormGroup.get("nameControl"))||void 0===e?void 0:e.value,this.itemObject.Comment=null===(n=this.itemFormGroup.get("commentControl"))||void 0===n?void 0:n.value,this.itemObject.User=this.odataService.currentUser.getUserId(),this.odataService.createUserCollection(this.itemObject).subscribe({next:a=>{this.uiUtilSrv.navigateUserCollectionDisplayPage(a.ID)},error:a=>{this.uiUtilSrv.showSnackInfo(a)}})}}onReturnToList(){this.uiUtilSrv.navigateUserCollectionListPage()}onCreateNewOne(){this.uiUtilSrv.navigateUserCollectionCreatePage()}onCreateItem(){}onDeleteCollItem(e){e.RefType===x.ik.ExerciseItem?this.odataService.removeExerciseItemFromCollection(e).subscribe({next:n=>{this.uiUtilSrv.showSnackInfo("DONE");const a=this.dataSource.findIndex(r=>r.RefID===e.RefID&&r.RefType===e.RefType);-1!==a&&this.dataSource.splice(a,1)},error:n=>{this.uiUtilSrv.showSnackInfo(n)}}):e.RefID===x.ik.KnowledgeItem&&this.odataService.removeKnowledgeItemFromCollection(e).subscribe({next:n=>{this.uiUtilSrv.showSnackInfo("DONE");const a=this.dataSource.findIndex(r=>r.RefID===e.RefID&&r.RefType===e.RefType);-1!==a&&this.dataSource.splice(a,1)},error:n=>{this.uiUtilSrv.showSnackInfo(n)}})}onDisplayExerciseItem(e){this.uiUtilSrv.navigateExerciseItemDisplayPage(e)}onChangeExerciseItem(e){this.uiUtilSrv.navigateExerciseItemChangePage(e)}}return o.\u0275fac=function(e){return new(e||o)(t.Y36(et.uw),t.Y36(g.gz),t.Y36(f.dM),t.Y36(f.CB))},o.\u0275cmp=t.Xpm({type:o,selectors:[["app-user-collection-detail"]],decls:56,vars:36,consts:[["multi","",1,"example-headers-align"],["expanded",""],[3,"formGroup"],["appearance","fill",1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["matInput","","type","text","placeholder","User","formControlName","userControl"],["align","start"],["matInput","","type","text","placeholder","Name","formControlName","nameControl"],["matInput","","type","text","placeholder","Comment","formControlName","commentControl"],[4,"ngIf"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","",1,"example-table",3,"dataSource"],["matColumnDef","refid"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"matTooltip","click"],["mat-icon-button","","color","accent",3,"matTooltip","click"],["mat-icon-button","","color","warn",3,"matTooltip","click"],["mat-header-row",""],["mat-row",""]],template:function(e,n){1&e&&(t.TgZ(0,"mat-card")(1,"mat-card-header")(2,"mat-card-title"),t._uU(3),t.ALo(4,"transloco"),t.qZA(),t.TgZ(5,"mat-card-subtitle"),t._uU(6),t.ALo(7,"transloco"),t.qZA()(),t.TgZ(8,"mat-card-content")(9,"mat-accordion",0)(10,"mat-expansion-panel",1)(11,"mat-expansion-panel-header")(12,"mat-panel-title"),t._uU(13),t.ALo(14,"transloco"),t.qZA(),t.TgZ(15,"mat-panel-description"),t._uU(16),t.ALo(17,"transloco"),t.TgZ(18,"mat-icon"),t._uU(19,"public"),t.qZA()()(),t.TgZ(20,"form",2)(21,"mat-form-field",3)(22,"mat-label"),t._uU(23,"#"),t.qZA(),t._UZ(24,"input",4),t.qZA(),t.TgZ(25,"mat-form-field",3)(26,"mat-label"),t._uU(27,"User"),t.qZA(),t._UZ(28,"input",5),t.TgZ(29,"mat-hint",6),t._uU(30),t.ALo(31,"transloco"),t.TgZ(32,"strong"),t._uU(33),t.qZA()()(),t.TgZ(34,"mat-form-field",3)(35,"mat-label"),t._uU(36),t.ALo(37,"transloco"),t.qZA(),t._UZ(38,"input",7),t.qZA(),t.TgZ(39,"mat-form-field",3)(40,"mat-label"),t._uU(41),t.ALo(42,"transloco"),t.qZA(),t._UZ(43,"input",8),t.qZA()()(),t.YNc(44,nt,27,26,"mat-expansion-panel",9),t.qZA(),t.YNc(45,pt,18,3,"div",9),t.qZA(),t.TgZ(46,"mat-card-actions")(47,"button",10),t.NdJ("click",function(){return n.onOK()}),t._uU(48),t.ALo(49,"transloco"),t.qZA(),t.TgZ(50,"button",11),t.NdJ("click",function(){return n.onReturnToList()}),t._uU(51),t.ALo(52,"transloco"),t.qZA(),t.TgZ(53,"button",10),t.NdJ("click",function(){return n.onCreateNewOne()}),t._uU(54),t.ALo(55,"transloco"),t.qZA()()()),2&e&&(t.xp6(3),t.Oqu(t.lcZ(4,16,"UserCollection")),t.xp6(3),t.Oqu(t.lcZ(7,18,n.currentMode)),t.xp6(7),t.Oqu(t.lcZ(14,20,"Header")),t.xp6(3),t.Oqu(t.lcZ(17,22,"HeaderInfo")),t.xp6(4),t.Q6J("formGroup",n.itemFormGroup),t.xp6(10),t.hij("",t.lcZ(31,24,"Common.DisplayAs"),": "),t.xp6(3),t.Oqu(n.userDisplayAs),t.xp6(3),t.Oqu(t.lcZ(37,26,"Common.Name")),t.xp6(5),t.Oqu(t.lcZ(42,28,"Common.Comment")),t.xp6(3),t.Q6J("ngIf",!n.isCreateMode&&n.itemObject),t.xp6(1),t.Q6J("ngIf",!n.isCreateMode),t.xp6(2),t.Q6J("disabled",!(n.isEditable&&n.itemFormGroup.valid)),t.xp6(1),t.Oqu(t.lcZ(49,30,"Save")),t.xp6(3),t.Oqu(t.lcZ(52,32,"Common.ReturnToList")),t.xp6(2),t.Q6J("disabled",!n.isDisplayMode),t.xp6(1),t.Oqu(t.lcZ(55,34,"Common.CreateAnotherOne")))},directives:[u.a8,u.dk,u.n5,u.$j,u.dn,h.pp,h.ib,h.yz,h.yK,h.u4,O.Hw,c._Y,c.JL,c.sg,v.KE,v.hX,ot.Nt,c.Fj,c.JJ,c.u,v.bx,C.O5,w.xw,w.yH,c.On,b.rD,s.BZ,s.w1,s.fO,s.ge,s.Dz,s.ev,M.lW,I.gM,s.as,s.XQ,s.nj,s.Gk,u.hq],pipes:[Z.Ot,C.uU],styles:[".example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}.example-action-buttons[_ngcontent-%COMP%]{padding-bottom:20px}.example-headers-align[_ngcontent-%COMP%]{margin:8px}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-title[_ngcontent-%COMP%], .example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%]{flex-basis:0}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%]{justify-content:space-between;align-items:center}.example-headers-align[_ngcontent-%COMP%]   .mat-form-field[_ngcontent-%COMP%] + .mat-form-field[_ngcontent-%COMP%]{margin-left:8px}"]}),o})();const ut=[{path:"",component:W},{path:"display/:id",component:_},{path:"create",component:_},{path:"edit/:id",component:_}];let ht=(()=>{class o{}return o.\u0275fac=function(e){return new(e||o)},o.\u0275mod=t.oAB({type:o}),o.\u0275inj=t.cJS({imports:[[g.Bz.forChild(ut)],g.Bz]}),o})(),Ct=(()=>{class o{}return o.\u0275fac=function(e){return new(e||o)},o.\u0275mod=t.oAB({type:o}),o.\u0275inj=t.cJS({imports:[[C.ez,c.u5,c.UX,N.U,R.l,S.nm,L.JP.forChild(),Z.y4,q.D,ht]]}),o})()}}]);