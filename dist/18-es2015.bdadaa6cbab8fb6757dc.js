(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{RVRs:function(t,e,o){"use strict";o.r(e),o.d(e,"UserCollectionModule",function(){return nt});var i=o("ofXK"),n=o("3Pt+"),a=o("0LvA"),c=o("lR5k"),r=o("QPBi"),l=o("jIBr"),s=o("dcRk"),m=o("iasb"),b=o("tyNb"),d=o("fXoL"),u=o("M9IT"),p=o("Dh3D"),h=o("VRyK"),f=o("LRne"),g=o("JX91"),C=o("eIep"),x=o("lJxs"),v=o("JIr8"),E=o("o0su"),V=o("/t3+"),W=o("bTqV"),w=o("Qu3c"),y=o("NFeN"),D=o("+0xr");function M(t,e){1&t&&(d.Wb(0,"th",16),d.Fc(1,"#"),d.Vb())}function I(t,e){if(1&t){const t=d.Xb();d.Wb(0,"td",17),d.Wb(1,"div"),d.Fc(2),d.Wb(3,"button",18),d.jc(4,"transloco"),d.Wb(5,"mat-icon"),d.Fc(6,"launch"),d.Vb(),d.Vb(),d.Wb(7,"button",2),d.ec("click",function(){d.xc(t);const o=e.$implicit;return d.ic().onPreview(o.ID)}),d.jc(8,"transloco"),d.Wb(9,"mat-icon"),d.Fc(10,"slideshow"),d.Vb(),d.Vb(),d.Wb(11,"button",19),d.jc(12,"transloco"),d.Wb(13,"mat-icon"),d.Fc(14,"edit"),d.Vb(),d.Vb(),d.Wb(15,"button",20),d.ec("click",function(){d.xc(t);const o=e.$implicit;return d.ic().onDeleteItem(o.ID)}),d.jc(16,"transloco"),d.Wb(17,"mat-icon"),d.Fc(18,"remove_circle"),d.Vb(),d.Vb(),d.Vb(),d.Vb()}if(2&t){const t=e.$implicit,o=d.ic();d.Eb(2),d.Hc(" ",t.ID," "),d.Eb(1),d.qc("routerLink","display/",t.ID,""),d.pc("matTooltip",d.kc(4,11,"Common.Display")),d.oc("disabled",!o.isExpertMode),d.Eb(4),d.pc("matTooltip",d.kc(8,13,"Common.Preview")),d.oc("disabled",!(o.isExpertMode&&t.Items&&t.Items.length>0)),d.Eb(4),d.qc("routerLink","edit/",t.ID,""),d.pc("matTooltip",d.kc(12,15,"Common.Change")),d.oc("disabled",!o.isExpertMode),d.Eb(4),d.pc("matTooltip",d.kc(16,17,"Common.Delete")),d.oc("disabled",!o.isExpertMode)}}function k(t,e){1&t&&(d.Wb(0,"th",16),d.Fc(1),d.jc(2,"transloco"),d.Vb()),2&t&&(d.Eb(1),d.Gc(d.kc(2,1,"Common.Name")))}function F(t,e){if(1&t&&(d.Wb(0,"td",17),d.Fc(1),d.Vb()),2&t){const t=e.$implicit;d.Eb(1),d.Gc(t.Name)}}function j(t,e){1&t&&(d.Wb(0,"th",16),d.Fc(1),d.jc(2,"transloco"),d.Vb()),2&t&&(d.Eb(1),d.Gc(d.kc(2,1,"Common.Comment")))}function S(t,e){if(1&t&&(d.Wb(0,"td",17),d.Fc(1),d.Vb()),2&t){const t=e.$implicit;d.Eb(1),d.Gc(t.Comment)}}function O(t,e){1&t&&(d.Wb(0,"th",21),d.Fc(1),d.jc(2,"transloco"),d.Vb()),2&t&&(d.Eb(1),d.Gc(d.kc(2,1,"CreatedAt")))}function R(t,e){if(1&t&&(d.Wb(0,"td",17),d.Fc(1),d.jc(2,"date"),d.Vb()),2&t){const t=e.$implicit;d.Eb(1),d.Gc(d.lc(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function G(t,e){1&t&&d.Rb(0,"tr",22)}function U(t,e){1&t&&d.Rb(0,"tr",23)}let P=(()=>{class t{constructor(t,e){this.odataService=t,this.uiUtilSrv=e,this.displayedColumns=["id","name","comment","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new d.o}get isExpertMode(){return this.odataService.isLoggedin}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe(Object(g.a)({}),Object(C.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getUserCollections(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(x.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(v.a)(()=>(this.isLoadingResults=!1,Object(f.a)([])))).subscribe(t=>this.dataSource=t)}onGoToSearch(){}onPreview(t){const e=[];this.dataSource.forEach(o=>{o.ID===t&&o.Items.forEach(t=>{e.push({refType:t.RefType,refId:t.RefID})})}),this.uiUtilSrv.navigatePreviewPage(e)}onDeleteItem(t){}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(d.Qb(E.d),d.Qb(E.f))},t.\u0275cmp=d.Kb({type:t,selectors:[["app-user-collection"]],viewQuery:function(t,e){if(1&t&&(d.Kc(u.a,1),d.Kc(p.a,1)),2&t){let t;d.uc(t=d.fc())&&(e.paginator=t.first),d.uc(t=d.fc())&&(e.sort=t.first)}},decls:37,vars:20,consts:[[1,"toolbar-spacer"],["mat-icon-button","","color","primary","routerLink","create",3,"disabled","matTooltip"],["mat-icon-button","","color","accent",3,"disabled","matTooltip","click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","name"],["matColumnDef","comment"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","accent",3,"disabled","routerLink","matTooltip"],["mat-icon-button","","color","warn",3,"disabled","matTooltip","click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(d.Wb(0,"mat-toolbar-row"),d.Wb(1,"span"),d.Wb(2,"h1"),d.Fc(3),d.jc(4,"transloco"),d.Vb(),d.Vb(),d.Rb(5,"span",0),d.Wb(6,"section"),d.Wb(7,"button",1),d.jc(8,"transloco"),d.Wb(9,"mat-icon"),d.Fc(10,"add_circle"),d.Vb(),d.Vb(),d.Wb(11,"button",2),d.ec("click",function(){return e.onGoToSearch()}),d.jc(12,"transloco"),d.Wb(13,"mat-icon"),d.Fc(14,"search"),d.Vb(),d.Vb(),d.Wb(15,"button",2),d.ec("click",function(){return e.onRefreshList()}),d.jc(16,"transloco"),d.Wb(17,"mat-icon"),d.Fc(18,"refresh"),d.Vb(),d.Vb(),d.Vb(),d.Vb(),d.Wb(19,"div",3),d.Wb(20,"div",4),d.Wb(21,"table",5),d.ec("matSortChange",function(){return e.resetPaging()}),d.Ub(22,6),d.Ec(23,M,2,0,"th",7),d.Ec(24,I,19,19,"td",8),d.Tb(),d.Ub(25,9),d.Ec(26,k,3,3,"th",7),d.Ec(27,F,2,1,"td",8),d.Tb(),d.Ub(28,10),d.Ec(29,j,3,3,"th",7),d.Ec(30,S,2,1,"td",8),d.Tb(),d.Ub(31,11),d.Ec(32,O,3,3,"th",12),d.Ec(33,R,3,4,"td",8),d.Tb(),d.Ec(34,G,1,0,"tr",13),d.Ec(35,U,1,0,"tr",14),d.Vb(),d.Vb(),d.Rb(36,"mat-paginator",15),d.Vb()),2&t&&(d.Eb(3),d.Gc(d.kc(4,12,"UserCollections")),d.Eb(4),d.pc("matTooltip",d.kc(8,14,"Common.Create")),d.oc("disabled",!e.isExpertMode),d.Eb(4),d.pc("matTooltip",d.kc(12,16,"Common.Search")),d.oc("disabled",!e.isExpertMode||e.dataSource.length<=0),d.Eb(4),d.pc("matTooltip",d.kc(16,18,"Common.Refresh")),d.oc("disabled",!e.isExpertMode),d.Eb(6),d.oc("dataSource",e.dataSource),d.Eb(13),d.oc("matHeaderRowDef",e.displayedColumns),d.Eb(1),d.oc("matRowDefColumns",e.displayedColumns),d.Eb(1),d.oc("length",e.resultsLength)("pageSize",20))},directives:[V.c,W.b,b.c,w.a,y.a,D.j,p.a,D.c,D.e,D.b,D.g,D.i,u.a,D.d,D.a,p.b,D.f,D.h],pipes:[r.d,i.e],styles:[".example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}"]}),t})();var T=o("jtHE"),_=o("rCpU"),H=o("VHTt"),L=o("0IaG"),A=o("Wp6s"),N=o("7EHt"),$=o("kmnG"),Q=o("qFsG"),z=o("XiUz");function K(t,e){if(1&t&&(d.Wb(0,"mat-expansion-panel"),d.Wb(1,"mat-expansion-panel-header"),d.Wb(2,"mat-panel-title"),d.Fc(3),d.jc(4,"transloco"),d.Vb(),d.Wb(5,"mat-panel-description"),d.Fc(6),d.jc(7,"transloco"),d.Wb(8,"mat-icon"),d.Fc(9,"info"),d.Vb(),d.Vb(),d.Vb(),d.Wb(10,"div",12),d.Wb(11,"div",13),d.Wb(12,"mat-form-field",3),d.Wb(13,"mat-label"),d.Fc(14),d.jc(15,"transloco"),d.Vb(),d.Rb(16,"input",14),d.jc(17,"transloco"),d.jc(18,"date"),d.Vb(),d.Vb(),d.Wb(19,"div",13),d.Wb(20,"mat-form-field",3),d.Wb(21,"mat-label"),d.Fc(22),d.jc(23,"transloco"),d.Vb(),d.Rb(24,"input",14),d.jc(25,"transloco"),d.jc(26,"date"),d.Vb(),d.Vb(),d.Vb(),d.Vb()),2&t){const t=d.ic();d.Eb(3),d.Gc(d.kc(4,8,"Administrative")),d.Eb(3),d.Gc(d.kc(7,10,"AdministrativeInfo")),d.Eb(8),d.Gc(d.kc(15,12,"CreatedAt")),d.Eb(2),d.pc("placeholder",d.kc(17,14,"CreatedAt")),d.oc("ngModel",d.lc(18,16,t.itemObject.CreatedAt,"yyyy-M-d HH:mm:ss")),d.Eb(6),d.Gc(d.kc(23,19,"ModifiedAt")),d.Eb(2),d.pc("placeholder",d.kc(25,21,"ModifiedAt")),d.oc("ngModel",d.lc(26,23,t.itemObject.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function X(t,e){1&t&&(d.Wb(0,"th",25),d.Fc(1,"ID"),d.Vb())}function q(t,e){if(1&t){const t=d.Xb();d.Wb(0,"td",26),d.Fc(1),d.Wb(2,"button",27),d.ec("click",function(){d.xc(t);const o=e.$implicit;return d.ic(2).onDisplayExerciseItem(o.RefID)}),d.jc(3,"transloco"),d.Wb(4,"mat-icon"),d.Fc(5,"launch"),d.Vb(),d.Vb(),d.Wb(6,"button",28),d.ec("click",function(){d.xc(t);const o=e.$implicit;return d.ic(2).onChangeExerciseItem(o.RefID)}),d.jc(7,"transloco"),d.Wb(8,"mat-icon"),d.Fc(9,"edit"),d.Vb(),d.Vb(),d.Wb(10,"button",29),d.ec("click",function(){d.xc(t);const o=e.$implicit;return d.ic(2).onDeleteCollItem(o)}),d.jc(11,"transloco"),d.Wb(12,"mat-icon"),d.Fc(13,"remove_circle"),d.Vb(),d.Vb(),d.Vb()}if(2&t){const t=e.$implicit;d.Eb(1),d.Hc(" ",t.RefID," "),d.Eb(1),d.pc("matTooltip",d.kc(3,4,"Common.Display")),d.Eb(4),d.pc("matTooltip",d.kc(7,6,"Common.Change")),d.Eb(4),d.pc("matTooltip",d.kc(11,8,"Common.Delete"))}}function J(t,e){1&t&&(d.Wb(0,"th",25),d.Fc(1),d.jc(2,"transloco"),d.Vb()),2&t&&(d.Eb(1),d.Gc(d.kc(2,1,"Quiz.Date")))}function B(t,e){if(1&t&&(d.Wb(0,"td",26),d.Fc(1),d.jc(2,"date"),d.Vb()),2&t){const t=e.$implicit;d.Eb(1),d.Gc(d.lc(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function Y(t,e){1&t&&d.Rb(0,"tr",30)}function Z(t,e){1&t&&d.Rb(0,"tr",31)}function tt(t,e){if(1&t&&(d.Wb(0,"div"),d.Wb(1,"mat-toolbar-row"),d.Rb(2,"span",15),d.Rb(3,"section"),d.Vb(),d.Wb(4,"div",16),d.Wb(5,"div",17),d.Wb(6,"table",18),d.Ub(7,19),d.Ec(8,X,2,0,"th",20),d.Ec(9,q,14,10,"td",21),d.Tb(),d.Ub(10,22),d.Ec(11,J,3,3,"th",20),d.Ec(12,B,3,4,"td",21),d.Tb(),d.Ec(13,Y,1,0,"tr",23),d.Ec(14,Z,1,0,"tr",24),d.Vb(),d.Vb(),d.Vb(),d.Vb()),2&t){const t=d.ic();d.Eb(6),d.oc("dataSource",t.dataSource),d.Eb(7),d.oc("matHeaderRowDef",t.displayedColumns),d.Eb(1),d.oc("matRowDefColumns",t.displayedColumns)}}let et=(()=>{class t{constructor(t,e,o,i){var a,c;this.dialog=t,this.activateRoute=e,this.uiUtilSrv=o,this.odataService=i,this.routerID=-1,this.displayedColumns=["refid","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.uiMode=_.b.Create,this.currentMode="",this.itemFormGroup=new n.g({idControl:new n.e({value:null,disabled:!0}),userControl:new n.e({value:null===(a=this.odataService.currentUser)||void 0===a?void 0:a.getUserId(),disabled:!0}),nameControl:new n.e,commentControl:new n.e}),this.userDisplayAs=null===(c=this.odataService.currentUserDetail)||void 0===c?void 0:c.displayAs}get isDisplayMode(){return this.uiMode===_.b.Display}get isCreateMode(){return this.uiMode===_.b.Create}get isUpdateMode(){return this.uiMode===_.b.Update}get isEditable(){return this.uiMode===_.b.Create||this.uiMode===_.b.Update}ngOnInit(){this.destroyed$=new T.a(1),this.activateRoute.url.subscribe({next:t=>{t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=_.b.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=_.b.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=_.b.Display,this.currentMode="Common.Display")),-1!==this.routerID&&this.odataService.readUserCollection(this.routerID,this.uiMode===_.b.Update).subscribe({next:t=>{this.onSetHeaderData(t),this.itemObject=t,this.dataSource=t.Items},error:t=>{this.uiUtilSrv.showSnackInfo(t)}})},error:t=>{this.uiUtilSrv.showSnackInfo(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onSetHeaderData(t){var e,o,i,n,a,c,r;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable(),null===(i=this.itemFormGroup.get("userControl"))||void 0===i||i.setValue(null===(n=this.odataService.currentUser)||void 0===n?void 0:n.getUserId()),null===(a=this.itemFormGroup.get("userControl"))||void 0===a||a.disable(),null===(c=this.itemFormGroup.get("nameControl"))||void 0===c||c.setValue(t.Name),null===(r=this.itemFormGroup.get("commentControl"))||void 0===r||r.setValue(t.Comment),this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()}onOK(){var t,e;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&this.uiUtilSrv.showSnackInfo(this.itemFormGroup.errors.toString()));this.itemObject=new H.G,this.itemObject.Name=null===(t=this.itemFormGroup.get("nameControl"))||void 0===t?void 0:t.value,this.itemObject.Comment=null===(e=this.itemFormGroup.get("commentControl"))||void 0===e?void 0:e.value,this.itemObject.User=this.odataService.currentUser.getUserId(),this.odataService.createUserCollection(this.itemObject).subscribe({next:t=>{this.uiUtilSrv.navigateUserCollectionDisplayPage(t.ID)},error:t=>{this.uiUtilSrv.showSnackInfo(t)}})}}onReturnToList(){this.uiUtilSrv.navigateUserCollectionListPage()}onCreateNewOne(){this.uiUtilSrv.navigateUserCollectionCreatePage()}onCreateItem(){}onDeleteCollItem(t){this.odataService.removeExerciseItemFromCollection(t).subscribe({next:e=>{this.uiUtilSrv.showSnackInfo("DONE");const o=this.dataSource.findIndex(e=>e.RefID===t.RefID&&e.RefType===t.RefType);-1!==o&&this.dataSource.splice(o,1)},error:t=>{this.uiUtilSrv.showSnackInfo(t)}})}onDisplayExerciseItem(t){this.uiUtilSrv.navigateExerciseItemDisplayPage(t)}onChangeExerciseItem(t){this.uiUtilSrv.navigateExerciseItemChangePage(t)}}return t.\u0275fac=function(e){return new(e||t)(d.Qb(L.b),d.Qb(b.a),d.Qb(E.f),d.Qb(E.d))},t.\u0275cmp=d.Kb({type:t,selectors:[["app-user-collection-detail"]],decls:56,vars:36,consts:[["multi","",1,"example-headers-align"],["expanded",""],[3,"formGroup"],["appearance","fill",1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["matInput","","type","text","placeholder","User","formControlName","userControl"],["align","start"],["matInput","","type","text","placeholder","Name","formControlName","nameControl"],["matInput","","type","text","placeholder","Comment","formControlName","commentControl"],[4,"ngIf"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","",1,"example-table",3,"dataSource"],["matColumnDef","refid"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],["mat-header-cell",""],["mat-cell",""],["mat-icon-button","","color","primary",3,"matTooltip","click"],["mat-icon-button","","color","accent",3,"matTooltip","click"],["mat-icon-button","","color","warn",3,"matTooltip","click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(d.Wb(0,"mat-card"),d.Wb(1,"mat-card-header"),d.Wb(2,"mat-card-title"),d.Fc(3),d.jc(4,"transloco"),d.Vb(),d.Wb(5,"mat-card-subtitle"),d.Fc(6),d.jc(7,"transloco"),d.Vb(),d.Vb(),d.Wb(8,"mat-card-content"),d.Wb(9,"mat-accordion",0),d.Wb(10,"mat-expansion-panel",1),d.Wb(11,"mat-expansion-panel-header"),d.Wb(12,"mat-panel-title"),d.Fc(13),d.jc(14,"transloco"),d.Vb(),d.Wb(15,"mat-panel-description"),d.Fc(16),d.jc(17,"transloco"),d.Wb(18,"mat-icon"),d.Fc(19,"public"),d.Vb(),d.Vb(),d.Vb(),d.Wb(20,"form",2),d.Wb(21,"mat-form-field",3),d.Wb(22,"mat-label"),d.Fc(23,"#"),d.Vb(),d.Rb(24,"input",4),d.Vb(),d.Wb(25,"mat-form-field",3),d.Wb(26,"mat-label"),d.Fc(27,"User"),d.Vb(),d.Rb(28,"input",5),d.Wb(29,"mat-hint",6),d.Fc(30),d.jc(31,"transloco"),d.Wb(32,"strong"),d.Fc(33),d.Vb(),d.Vb(),d.Vb(),d.Wb(34,"mat-form-field",3),d.Wb(35,"mat-label"),d.Fc(36),d.jc(37,"transloco"),d.Vb(),d.Rb(38,"input",7),d.Vb(),d.Wb(39,"mat-form-field",3),d.Wb(40,"mat-label"),d.Fc(41),d.jc(42,"transloco"),d.Vb(),d.Rb(43,"input",8),d.Vb(),d.Vb(),d.Vb(),d.Ec(44,K,27,26,"mat-expansion-panel",9),d.Vb(),d.Ec(45,tt,15,3,"div",9),d.Vb(),d.Wb(46,"mat-card-actions"),d.Wb(47,"button",10),d.ec("click",function(){return e.onOK()}),d.Fc(48),d.jc(49,"transloco"),d.Vb(),d.Wb(50,"button",11),d.ec("click",function(){return e.onReturnToList()}),d.Fc(51),d.jc(52,"transloco"),d.Vb(),d.Wb(53,"button",10),d.ec("click",function(){return e.onCreateNewOne()}),d.Fc(54),d.jc(55,"transloco"),d.Vb(),d.Vb(),d.Vb()),2&t&&(d.Eb(3),d.Gc(d.kc(4,16,"UserCollection")),d.Eb(3),d.Gc(d.kc(7,18,e.currentMode)),d.Eb(7),d.Gc(d.kc(14,20,"Header")),d.Eb(3),d.Gc(d.kc(17,22,"HeaderInfo")),d.Eb(4),d.oc("formGroup",e.itemFormGroup),d.Eb(10),d.Hc("",d.kc(31,24,"Common.DisplayAs"),": "),d.Eb(3),d.Gc(e.userDisplayAs),d.Eb(3),d.Gc(d.kc(37,26,"Common.Name")),d.Eb(5),d.Gc(d.kc(42,28,"Common.Comment")),d.Eb(3),d.oc("ngIf",!e.isCreateMode&&e.itemObject),d.Eb(1),d.oc("ngIf",!e.isCreateMode),d.Eb(2),d.oc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),d.Eb(1),d.Gc(d.kc(49,30,"Save")),d.Eb(3),d.Gc(d.kc(52,32,"Common.ReturnToList")),d.Eb(2),d.oc("disabled",!e.isDisplayMode),d.Eb(1),d.Gc(d.kc(55,34,"Common.CreateAnotherOne")))},directives:[A.a,A.d,A.g,A.f,A.c,N.a,N.c,N.e,N.f,N.d,y.a,n.v,n.o,n.h,$.c,$.g,Q.b,n.c,n.n,n.f,$.f,i.m,A.b,W.b,z.c,z.a,n.q,V.c,D.j,D.c,D.e,D.b,D.g,D.i,D.d,D.a,w.a,D.f,D.h],pipes:[r.d,i.e],styles:[".example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}.example-action-buttons[_ngcontent-%COMP%]{padding-bottom:20px}.example-headers-align[_ngcontent-%COMP%]{margin:8px}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%], .example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-title[_ngcontent-%COMP%]{flex-basis:0}.example-headers-align[_ngcontent-%COMP%]   .mat-expansion-panel-header-description[_ngcontent-%COMP%]{justify-content:space-between;align-items:center}.example-headers-align[_ngcontent-%COMP%]   .mat-form-field[_ngcontent-%COMP%] + .mat-form-field[_ngcontent-%COMP%]{margin-left:8px}"]}),t})();const ot=[{path:"",component:P},{path:"display/:id",component:et},{path:"create",component:et},{path:"edit/:id",component:et}];let it=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=d.Ob({type:t}),t.\u0275inj=d.Nb({imports:[[b.e.forChild(ot)],b.e]}),t})(),nt=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=d.Ob({type:t}),t.\u0275inj=d.Nb({imports:[[i.c,n.i,n.s,l.a,s.a,a.b,c.b.forChild(),r.c,m.a,it]]}),t})()}}]);