(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"U+IK":function(t,e,o){"use strict";o.r(e),o.d(e,"KnowledgeItemsModule",function(){return rt});var i=o("ofXK"),n=o("3Pt+"),a=o("0LvA"),r=o("lR5k"),c=o("QPBi"),s=o("jIBr"),l=o("dcRk"),d=o("tyNb"),b=o("fXoL"),m=o("M9IT"),u=o("Dh3D"),h=o("VRyK"),p=o("LRne"),g=o("JX91"),C=o("eIep"),f=o("lJxs"),v=o("JIr8"),S=o("VHTt"),T=o("o0su"),w=o("/t3+"),I=o("bTqV"),y=o("+0xr"),D=o("Xa2L");function F(t,e){1&t&&b.Ob(0,"mat-progress-spinner")}function x(t,e){if(1&t&&(b.Tb(0,"div",17),b.Dc(1,F,1,0,"mat-progress-spinner",18),b.Sb()),2&t){const t=b.fc();b.Cb(1),b.lc("ngIf",t.isLoadingResults)}}function O(t,e){1&t&&(b.Tb(0,"th",19),b.Ec(1,"#"),b.Sb())}function M(t,e){if(1&t){const t=b.Ub();b.Tb(0,"td",20),b.Tb(1,"div"),b.Ec(2),b.Tb(3,"a",21),b.Ec(4),b.gc(5,"transloco"),b.Sb(),b.Tb(6,"a",21),b.Ec(7),b.gc(8,"transloco"),b.Sb(),b.Tb(9,"a",22),b.bc("click",function(){b.uc(t);const o=e.$implicit;return b.fc().onDeleteItem(o.ID)}),b.Ec(10),b.gc(11,"transloco"),b.Sb(),b.Sb(),b.Sb()}if(2&t){const t=e.$implicit;b.Cb(2),b.Gc(" ",t.ID," "),b.Cb(1),b.nc("routerLink","display/",t.ID,""),b.Cb(1),b.Fc(b.hc(5,6,"Common.Display")),b.Cb(2),b.nc("routerLink","edit/",t.ID,""),b.Cb(1),b.Fc(b.hc(8,8,"Common.Change")),b.Cb(3),b.Fc(b.hc(11,10,"Common.Delete"))}}function k(t,e){1&t&&(b.Tb(0,"th",19),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"Category")))}function E(t,e){if(1&t&&(b.Tb(0,"td",20),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t){const t=e.$implicit,o=b.fc();b.Cb(1),b.Fc(b.hc(2,1,o.getKnowledgeItemCategoryName(t.Category)))}}function G(t,e){1&t&&(b.Tb(0,"th",19),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"Title")))}function R(t,e){if(1&t&&(b.Tb(0,"td",20),b.Ec(1),b.Sb()),2&t){const t=e.$implicit;b.Cb(1),b.Fc(t.Title)}}function L(t,e){1&t&&(b.Tb(0,"th",19),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"CreatedAt")))}function K(t,e){if(1&t&&(b.Tb(0,"td",20),b.Ec(1),b.gc(2,"date"),b.Sb()),2&t){const t=e.$implicit;b.Cb(1),b.Fc(b.ic(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function A(t,e){1&t&&b.Ob(0,"tr",23)}function P(t,e){1&t&&b.Ob(0,"tr",24)}let N=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new b.o}getKnowledgeItemCategoryName(t){return Object(S.s)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe(Object(g.a)({}),Object(C.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getKnowledgeItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(f.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(v.a)(()=>(this.isLoadingResults=!1,Object(p.a)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:S.q.KnowledgeItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}onDeleteItem(t){this.odataService.deleteExerciseItem(t).subscribe({next:t=>{this.onRefreshList()},error:t=>{console.error(t)}})}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(b.Nb(T.b),b.Nb(d.b))},t.\u0275cmp=b.Hb({type:t,selectors:[["app-knowledge-items"]],viewQuery:function(t,e){if(1&t&&(b.Ic(m.a,!0),b.Ic(u.a,!0)),2&t){let t;b.rc(t=b.cc())&&(e.paginator=t.first),b.rc(t=b.cc())&&(e.sort=t.first)}},decls:34,vars:19,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create"],["mat-stroked-button","",3,"disabled","click"],["mat-stroked-button","",3,"click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","createdat","matSortDisableClear","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(b.Tb(0,"mat-toolbar-row"),b.Tb(1,"span"),b.Ec(2),b.gc(3,"transloco"),b.Sb(),b.Ob(4,"span",0),b.Tb(5,"section"),b.Tb(6,"a",1),b.Ec(7),b.gc(8,"transloco"),b.Sb(),b.Tb(9,"a",2),b.bc("click",function(){return e.onGoToPreview()}),b.Ec(10),b.gc(11,"transloco"),b.Sb(),b.Tb(12,"a",3),b.bc("click",function(){return e.onRefreshList()}),b.Ec(13),b.gc(14,"transloco"),b.Sb(),b.Sb(),b.Sb(),b.Tb(15,"div",4),b.Dc(16,x,2,1,"div",5),b.Tb(17,"div",6),b.Tb(18,"table",7),b.bc("matSortChange",function(){return e.resetPaging()}),b.Rb(19,8),b.Dc(20,O,2,0,"th",9),b.Dc(21,M,12,12,"td",10),b.Qb(),b.Rb(22,11),b.Dc(23,k,3,3,"th",9),b.Dc(24,E,3,3,"td",10),b.Qb(),b.Rb(25,12),b.Dc(26,G,3,3,"th",9),b.Dc(27,R,2,1,"td",10),b.Qb(),b.Rb(28,13),b.Dc(29,L,3,3,"th",9),b.Dc(30,K,3,4,"td",10),b.Qb(),b.Dc(31,A,1,0,"tr",14),b.Dc(32,P,1,0,"tr",15),b.Sb(),b.Sb(),b.Ob(33,"mat-paginator",16),b.Sb()),2&t&&(b.Cb(2),b.Fc(b.hc(3,11,"KnowledgeItem")),b.Cb(5),b.Fc(b.hc(8,13,"Common.Create")),b.Cb(2),b.lc("disabled",e.dataSource.length<=0),b.Cb(1),b.Fc(b.hc(11,15,"Common.Preview")),b.Cb(3),b.Fc(b.hc(14,17,"Common.Refresh")),b.Cb(3),b.lc("ngIf",e.isLoadingResults),b.Cb(2),b.lc("dataSource",e.dataSource),b.Cb(13),b.lc("matHeaderRowDef",e.displayedColumns),b.Cb(1),b.lc("matRowDefColumns",e.displayedColumns),b.Cb(1),b.lc("length",e.resultsLength)("pageSize",20))},directives:[w.c,I.a,d.c,i.m,y.j,u.a,y.c,y.e,y.b,y.g,y.i,m.a,D.a,y.d,y.a,y.f,y.h],pipes:[c.d,i.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var j=o("jtHE"),U=o("FtGj"),_=o("rCpU"),$=o("HKRH"),H=o("0IaG"),V=o("Wp6s"),z=o("qFsG"),q=o("kmnG"),B=o("d3UM"),Q=o("FKr1"),J=o("iadO"),X=o("A5z7"),W=o("XiUz"),Y=o("NFeN");function Z(t,e){1&t&&(b.Tb(0,"mat-icon",28),b.Ec(1,"cancel"),b.Sb())}function tt(t,e){if(1&t){const t=b.Ub();b.Tb(0,"mat-chip",26),b.bc("removed",function(){b.uc(t);const o=e.$implicit;return b.fc().removeTag(o)}),b.Ec(1),b.Dc(2,Z,2,0,"mat-icon",27),b.Sb()}if(2&t){const t=e.$implicit,o=b.fc();b.lc("selectable",o.selectable)("removable",o.isEditable),b.Cb(1),b.Gc(" ",t," "),b.Cb(1),b.lc("ngIf",o.isEditable)}}function et(t,e){if(1&t){const t=b.Ub();b.Tb(0,"mat-toolbar"),b.Tb(1,"h3"),b.Ec(2),b.gc(3,"transloco"),b.Sb(),b.Ob(4,"div",29),b.Tb(5,"button",30),b.bc("click",function(){return b.uc(t),b.fc().openUploadDialog()}),b.Tb(6,"mat-icon"),b.Ec(7,"file_upload"),b.Sb(),b.Sb(),b.Sb()}2&t&&(b.Cb(2),b.Fc(b.hc(3,1,"Content")))}function ot(t,e){if(1&t){const t=b.Ub();b.Tb(0,"div",31),b.Tb(1,"ngx-monaco-editor",32),b.bc("ngModelChange",function(e){return b.uc(t),b.fc().content=e}),b.Sb(),b.Sb()}if(2&t){const t=b.fc();b.Cb(1),b.lc("options",t.editorOptions)("ngModel",t.content)}}let it=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.uiMode=_.c.Create,this.currentMode="",this.editorOptions={theme:"vs-dark"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[U.g,U.c],this.tags=[],this.itemFormGroup=new n.f({idControl:new n.d({value:null,disabled:!0}),titleControl:new n.d("",n.t.required),ctgyControl:new n.d,createdAtControl:new n.d({value:null,disabled:!0}),modifiedAtControl:new n.d({value:null,disabled:!0}),tagControl:new n.d})}get isDisplayMode(){return this.uiMode===_.c.Display}get isCreateMode(){return this.uiMode===_.c.Create}get isUpdateMode(){return this.uiMode===_.c.Update}get isEditable(){return this.uiMode===_.c.Create||this.uiMode===_.c.Update}ngOnInit(){this.destroyed$=new j.a(1),this.activateRoute.url.subscribe({next:t=>{var e,o;t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=_.c.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=_.c.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=_.c.Display,this.currentMode="Common.Display")),-1!==this.routerID?this.odataService.readKnowledgeItem(this.routerID,this.uiMode===_.c.Update).subscribe({next:t=>{var e,o,i,n,a;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("titleControl"))||void 0===o||o.setValue(t.Title),null===(i=this.itemFormGroup.get("ctgyControl"))||void 0===i||i.setValue(t.ItemCategory),null===(n=this.itemFormGroup.get("createdAtControl"))||void 0===n||n.setValue(t.CreatedAt),null===(a=this.itemFormGroup.get("modifiedAtControl"))||void 0===a||a.setValue(t.ModifiedAt),this.content=t.Content,this.tags=t.Tags,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()},error:t=>{console.error(t)}}):(null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue("NEW"),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable())},error:t=>{console.error(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){var t,e,o;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const e=new S.f;e.ItemCategory=S.g.Concept,e.Content=this.content,e.Title=null===(t=this.itemFormGroup.get("titleControl"))||void 0===t?void 0:t.value,e.Tags=this.tags,this.odataService.createKnowledgeItem(e).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const t=new S.f;t.ID=null===(e=this.itemFormGroup.get("idControl"))||void 0===e?void 0:e.value,t.ItemCategory=S.g.Concept,t.Content=this.content,t.Title=null===(o=this.itemFormGroup.get("titleControl"))||void 0===o?void 0:o.value,t.Tags=this.tags,this.odataService.changeKnowledgeItem(t).subscribe({next:e=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{}})}}openUploadDialog(){this.dialog.open($.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onReturnToList(){this.router.navigate(["knowledge-item"])}}return t.\u0275fac=function(e){return new(e||t)(b.Nb(H.a),b.Nb(d.a),b.Nb(d.b),b.Nb(T.b))},t.\u0275cmp=b.Hb({type:t,selectors:[["app-knowledge-item-detail"]],decls:65,vars:48,consts:[[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],["value","0"],["value","1"],["matInput","","formControlName","createdAtControl",3,"matDatepicker"],["matSuffix","",3,"for"],["createdAt",""],["matInput","","formControlName","modifiedAtControl",3,"matDatepicker"],["modifiedAt",""],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["emoji","","katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],["fxFlex","50"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(b.Tb(0,"mat-card"),b.Tb(1,"mat-card-header"),b.Tb(2,"mat-card-title"),b.Ec(3),b.gc(4,"transloco"),b.Sb(),b.Tb(5,"mat-card-subtitle"),b.Ec(6),b.gc(7,"transloco"),b.Sb(),b.Sb(),b.Tb(8,"mat-card-content"),b.Tb(9,"form",0),b.Tb(10,"div",1),b.Ob(11,"input",2),b.Sb(),b.Tb(12,"mat-form-field",1),b.Ob(13,"input",3,4),b.gc(15,"transloco"),b.Tb(16,"mat-hint",5),b.Ec(17),b.Sb(),b.Sb(),b.Tb(18,"mat-form-field",6),b.Tb(19,"mat-label"),b.Ec(20),b.gc(21,"transloco"),b.Sb(),b.Tb(22,"mat-select",7),b.Tb(23,"mat-option",8),b.Ec(24),b.gc(25,"transloco"),b.Sb(),b.Tb(26,"mat-option",9),b.Ec(27),b.gc(28,"transloco"),b.Sb(),b.Sb(),b.Sb(),b.Tb(29,"mat-form-field",6),b.Tb(30,"mat-label"),b.Ec(31),b.gc(32,"transloco"),b.Sb(),b.Ob(33,"input",10),b.Ob(34,"mat-datepicker-toggle",11),b.Ob(35,"mat-datepicker",null,12),b.Sb(),b.Tb(37,"mat-form-field",6),b.Tb(38,"mat-label"),b.Ec(39),b.gc(40,"transloco"),b.Sb(),b.Ob(41,"input",13),b.Ob(42,"mat-datepicker-toggle",11),b.Ob(43,"mat-datepicker",null,14),b.Sb(),b.Tb(45,"mat-form-field",6),b.Tb(46,"mat-label"),b.Ec(47),b.gc(48,"transloco"),b.Sb(),b.Tb(49,"mat-chip-list",15,16),b.Dc(51,tt,3,4,"mat-chip",17),b.Tb(52,"input",18),b.bc("matChipInputTokenEnd",function(t){return e.addTag(t)}),b.Sb(),b.Sb(),b.Sb(),b.Sb(),b.Dc(53,et,8,3,"mat-toolbar",19),b.Tb(54,"div",20),b.Dc(55,ot,2,2,"div",21),b.Tb(56,"div",22),b.Ob(57,"markdown",23),b.Sb(),b.Sb(),b.Sb(),b.Tb(58,"mat-card-actions"),b.Tb(59,"button",24),b.bc("click",function(){return e.onOK()}),b.Ec(60),b.gc(61,"transloco"),b.Sb(),b.Tb(62,"button",25),b.bc("click",function(){return e.onReturnToList()}),b.Ec(63),b.gc(64,"transloco"),b.Sb(),b.Sb(),b.Sb()),2&t){const t=b.sc(14),o=b.sc(36),i=b.sc(44),n=b.sc(50);b.Cb(3),b.Fc(b.hc(4,26,"KnowledgeItem")),b.Cb(3),b.Fc(b.hc(7,28,e.currentMode)),b.Cb(3),b.lc("formGroup",e.itemFormGroup),b.Cb(4),b.mc("placeholder",b.hc(15,30,"Title")),b.Cb(4),b.Gc("",t.value.length," / 30"),b.Cb(3),b.Fc(b.hc(21,32,"Category")),b.Cb(4),b.Fc(b.hc(25,34,"KnowledgeItemCategory.Concept")),b.Cb(3),b.Fc(b.hc(28,36,"KnowledgeItemCategory.Formula")),b.Cb(4),b.Fc(b.hc(32,38,"CreatedAt")),b.Cb(2),b.lc("matDatepicker",o),b.Cb(1),b.lc("for",o),b.Cb(5),b.Fc(b.hc(40,40,"ModifiedAt")),b.Cb(2),b.lc("matDatepicker",i),b.Cb(1),b.lc("for",i),b.Cb(5),b.Fc(b.hc(48,42,"Tags")),b.Cb(4),b.lc("ngForOf",e.tags),b.Cb(1),b.lc("matChipInputFor",n)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),b.Cb(1),b.lc("ngIf",e.isCreateMode),b.Cb(2),b.lc("ngIf",!e.isDisplayMode),b.Cb(2),b.lc("data",e.content)("katexOptions",e.mathOptions),b.Cb(2),b.lc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),b.Cb(1),b.Fc(b.hc(61,44,"Save")),b.Cb(3),b.Fc(b.hc(64,46,"Common.ReturnToList"))}},directives:[V.a,V.d,V.g,V.f,V.c,n.u,n.n,n.g,z.b,n.c,n.m,n.e,q.c,n.s,n.i,q.f,q.g,B.a,Q.m,J.b,J.d,q.i,J.a,X.c,i.l,X.b,i.m,W.c,W.a,r.a,V.b,I.b,X.a,Y.a,X.d,w.a,a.a,n.p],pipes:[c.d],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.control-full-width[_ngcontent-%COMP%]{width:100%}td[_ngcontent-%COMP%]{padding-right:8px}table[_ngcontent-%COMP%]{width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}.toolbar-spacer[_ngcontent-%COMP%]{flex:1 1 auto}"]}),t})();const nt=[{path:"",component:N},{path:"create",component:it},{path:"display/:id",component:it},{path:"edit/:id",component:it}];let at=(()=>{class t{}return t.\u0275mod=b.Lb({type:t}),t.\u0275inj=b.Kb({factory:function(e){return new(e||t)},imports:[[d.d.forChild(nt)],d.d]}),t})(),rt=(()=>{class t{}return t.\u0275mod=b.Lb({type:t}),t.\u0275inj=b.Kb({factory:function(e){return new(e||t)},imports:[[i.c,n.h,n.r,s.a,l.a,a.b,r.b.forChild(),at,c.c]]}),t})()}}]);