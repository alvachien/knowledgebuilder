(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{"U+IK":function(t,e,o){"use strict";o.r(e),o.d(e,"KnowledgeItemsModule",function(){return rt});var i=o("ofXK"),a=o("3Pt+"),n=o("0LvA"),r=o("lR5k"),c=o("QPBi"),l=o("jIBr"),s=o("dcRk"),d=o("tyNb"),b=o("M9IT"),m=o("Dh3D"),u=o("VRyK"),h=o("LRne"),p=o("JX91"),g=o("eIep"),C=o("lJxs"),f=o("JIr8"),v=o("VHTt"),S=o("fXoL"),T=o("o0su"),w=o("/t3+"),I=o("bTqV"),y=o("+0xr"),D=o("Xa2L");function F(t,e){1&t&&S.Ob(0,"mat-progress-spinner")}function O(t,e){if(1&t&&(S.Tb(0,"div",16),S.Dc(1,F,1,0,"mat-progress-spinner",17),S.Sb()),2&t){const t=S.fc();S.Cb(1),S.lc("ngIf",t.isLoadingResults)}}function x(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1,"#"),S.Sb())}function M(t,e){if(1&t&&(S.Tb(0,"td",19),S.Tb(1,"div"),S.Ec(2),S.Tb(3,"a",20),S.Ec(4),S.gc(5,"transloco"),S.Sb(),S.Tb(6,"a",20),S.Ec(7),S.gc(8,"transloco"),S.Sb(),S.Sb(),S.Sb()),2&t){const t=e.$implicit;S.Cb(2),S.Gc(" ",t.ID," "),S.Cb(1),S.nc("routerLink","display/",t.ID,""),S.Cb(1),S.Fc(S.hc(5,5,"Display")),S.Cb(2),S.nc("routerLink","edit/",t.ID,""),S.Cb(1),S.Fc(S.hc(8,7,"Change"))}}function k(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t&&(S.Cb(1),S.Fc(S.hc(2,1,"Category")))}function E(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t){const t=e.$implicit,o=S.fc();S.Cb(1),S.Fc(S.hc(2,1,o.getKnowledgeItemCategoryName(t.Category)))}}function G(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t&&(S.Cb(1),S.Fc(S.hc(2,1,"Title")))}function R(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.Sb()),2&t){const t=e.$implicit;S.Cb(1),S.Fc(t.Title)}}function K(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t&&(S.Cb(1),S.Fc(S.hc(2,1,"CreatedAt")))}function L(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.gc(2,"date"),S.Sb()),2&t){const t=e.$implicit;S.Cb(1),S.Fc(S.ic(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function A(t,e){1&t&&S.Ob(0,"tr",21)}function P(t,e){1&t&&S.Ob(0,"tr",22)}let N=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0}getKnowledgeItemCategoryName(t){return Object(v.s)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(u.a)(this.sort.sortChange,this.paginator.page).pipe(Object(p.a)({}),Object(g.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getKnowledgeItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(C.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(f.a)(()=>(this.isLoadingResults=!1,Object(h.a)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:v.q.KnowledgeItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(S.Nb(T.b),S.Nb(d.b))},t.\u0275cmp=S.Hb({type:t,selectors:[["app-knowledge-items"]],viewQuery:function(t,e){if(1&t&&(S.Ic(b.a,!0),S.Ic(m.a,!0)),2&t){let t;S.rc(t=S.cc())&&(e.paginator=t.first),S.rc(t=S.cc())&&(e.sort=t.first)}},decls:31,vars:16,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create"],["mat-stroked-button","",3,"disabled","click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","createdat","matSortDisableClear","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(S.Tb(0,"mat-toolbar-row"),S.Tb(1,"span"),S.Ec(2),S.gc(3,"transloco"),S.Sb(),S.Ob(4,"span",0),S.Tb(5,"section"),S.Tb(6,"a",1),S.Ec(7),S.gc(8,"transloco"),S.Sb(),S.Tb(9,"a",2),S.bc("click",function(){return e.onGoToPreview()}),S.Ec(10),S.gc(11,"transloco"),S.Sb(),S.Sb(),S.Sb(),S.Tb(12,"div",3),S.Dc(13,O,2,1,"div",4),S.Tb(14,"div",5),S.Tb(15,"table",6),S.bc("matSortChange",function(){return e.resetPaging()}),S.Rb(16,7),S.Dc(17,x,2,0,"th",8),S.Dc(18,M,9,9,"td",9),S.Qb(),S.Rb(19,10),S.Dc(20,k,3,3,"th",8),S.Dc(21,E,3,3,"td",9),S.Qb(),S.Rb(22,11),S.Dc(23,G,3,3,"th",8),S.Dc(24,R,2,1,"td",9),S.Qb(),S.Rb(25,12),S.Dc(26,K,3,3,"th",8),S.Dc(27,L,3,4,"td",9),S.Qb(),S.Dc(28,A,1,0,"tr",13),S.Dc(29,P,1,0,"tr",14),S.Sb(),S.Sb(),S.Ob(30,"mat-paginator",15),S.Sb()),2&t&&(S.Cb(2),S.Fc(S.hc(3,10,"KnowledgeItem")),S.Cb(5),S.Fc(S.hc(8,12,"Create")),S.Cb(2),S.lc("disabled",e.dataSource.length<=0),S.Cb(1),S.Fc(S.hc(11,14,"Common.Preview")),S.Cb(3),S.lc("ngIf",e.isLoadingResults),S.Cb(2),S.lc("dataSource",e.dataSource),S.Cb(13),S.lc("matHeaderRowDef",e.displayedColumns),S.Cb(1),S.lc("matRowDefColumns",e.displayedColumns),S.Cb(1),S.lc("length",e.resultsLength)("pageSize",20))},directives:[w.c,I.a,d.c,i.m,y.j,m.a,y.c,y.e,y.b,y.g,y.i,b.a,D.a,y.d,y.a,y.f,y.h],pipes:[c.d,i.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var j=o("jtHE"),U=o("FtGj"),_=o("rCpU"),H=o("HKRH"),$=o("0IaG"),V=o("Wp6s"),z=o("qFsG"),q=o("kmnG"),B=o("d3UM"),Q=o("FKr1"),J=o("iadO"),X=o("A5z7"),W=o("XiUz"),Y=o("NFeN");function Z(t,e){1&t&&(S.Tb(0,"mat-icon",28),S.Ec(1,"cancel"),S.Sb())}function tt(t,e){if(1&t){const t=S.Ub();S.Tb(0,"mat-chip",26),S.bc("removed",function(){S.uc(t);const o=e.$implicit;return S.fc().removeTag(o)}),S.Ec(1),S.Dc(2,Z,2,0,"mat-icon",27),S.Sb()}if(2&t){const t=e.$implicit,o=S.fc();S.lc("selectable",o.selectable)("removable",o.isEditable),S.Cb(1),S.Gc(" ",t," "),S.Cb(1),S.lc("ngIf",o.isEditable)}}function et(t,e){if(1&t){const t=S.Ub();S.Tb(0,"mat-toolbar"),S.Tb(1,"h3"),S.Ec(2),S.gc(3,"transloco"),S.Sb(),S.Ob(4,"div",29),S.Tb(5,"button",30),S.bc("click",function(){return S.uc(t),S.fc().openUploadDialog()}),S.Tb(6,"mat-icon"),S.Ec(7,"file_upload"),S.Sb(),S.Sb(),S.Sb()}2&t&&(S.Cb(2),S.Fc(S.hc(3,1,"Content")))}function ot(t,e){if(1&t){const t=S.Ub();S.Tb(0,"div",31),S.Tb(1,"ngx-monaco-editor",32),S.bc("ngModelChange",function(e){return S.uc(t),S.fc().content=e}),S.Sb(),S.Sb()}if(2&t){const t=S.fc();S.Cb(1),S.lc("options",t.editorOptions)("ngModel",t.content)}}let it=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.uiMode=_.c.Create,this.currentMode="",this.editorOptions={theme:"vs-dark"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[U.g,U.c],this.tags=[],this.itemFormGroup=new a.f({idControl:new a.d({value:null,disabled:!0}),titleControl:new a.d("",a.t.required),ctgyControl:new a.d,createdAtControl:new a.d({value:null,disabled:!0}),modifiedAtControl:new a.d({value:null,disabled:!0}),tagControl:new a.d})}get isDisplayMode(){return this.uiMode===_.c.Display}get isCreateMode(){return this.uiMode===_.c.Create}get isUpdateMode(){return this.uiMode===_.c.Update}get isEditable(){return this.uiMode===_.c.Create||this.uiMode===_.c.Update}ngOnInit(){this.destroyed$=new j.a(1),this.activateRoute.url.subscribe({next:t=>{var e,o;t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=_.c.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=_.c.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=_.c.Display,this.currentMode="Common.Display")),-1!==this.routerID?this.odataService.readKnowledgeItem(this.routerID).subscribe({next:t=>{var e,o,i,a,n;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("titleControl"))||void 0===o||o.setValue(t.Title),null===(i=this.itemFormGroup.get("ctgyControl"))||void 0===i||i.setValue(t.ItemCategory),null===(a=this.itemFormGroup.get("createdAtControl"))||void 0===a||a.setValue(t.CreatedAt),null===(n=this.itemFormGroup.get("modifiedAtControl"))||void 0===n||n.setValue(t.ModifiedAt),this.content=t.Content,this.tags=t.Tags,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()},error:t=>{console.error(t)}}):(null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue("NEW"),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable())},error:t=>{console.error(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){var t,e,o;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const e=new v.f;e.ItemCategory=v.g.Concept,e.Content=this.content,e.Title=null===(t=this.itemFormGroup.get("titleControl"))||void 0===t?void 0:t.value,e.Tags=this.tags,this.odataService.createKnowledgeItem(e).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const t=new v.f;t.ID=null===(e=this.itemFormGroup.get("idControl"))||void 0===e?void 0:e.value,t.ItemCategory=v.g.Concept,t.Content=this.content,t.Title=null===(o=this.itemFormGroup.get("titleControl"))||void 0===o?void 0:o.value,t.Tags=this.tags,this.odataService.changeKnowledgeItem(t).subscribe({next:e=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{}})}}openUploadDialog(){this.dialog.open(H.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onReturnToList(){this.router.navigate(["knowledge-item"])}}return t.\u0275fac=function(e){return new(e||t)(S.Nb($.a),S.Nb(d.a),S.Nb(d.b),S.Nb(T.b))},t.\u0275cmp=S.Hb({type:t,selectors:[["app-knowledge-item-detail"]],decls:65,vars:48,consts:[[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],["value","0"],["value","1"],["matInput","","formControlName","createdAtControl",3,"matDatepicker"],["matSuffix","",3,"for"],["createdAt",""],["matInput","","formControlName","modifiedAtControl",3,"matDatepicker"],["modifiedAt",""],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["emoji","","katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],["fxFlex","50"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(S.Tb(0,"mat-card"),S.Tb(1,"mat-card-header"),S.Tb(2,"mat-card-title"),S.Ec(3),S.gc(4,"transloco"),S.Sb(),S.Tb(5,"mat-card-subtitle"),S.Ec(6),S.gc(7,"transloco"),S.Sb(),S.Sb(),S.Tb(8,"mat-card-content"),S.Tb(9,"form",0),S.Tb(10,"div",1),S.Ob(11,"input",2),S.Sb(),S.Tb(12,"mat-form-field",1),S.Ob(13,"input",3,4),S.gc(15,"transloco"),S.Tb(16,"mat-hint",5),S.Ec(17),S.Sb(),S.Sb(),S.Tb(18,"mat-form-field",6),S.Tb(19,"mat-label"),S.Ec(20),S.gc(21,"transloco"),S.Sb(),S.Tb(22,"mat-select",7),S.Tb(23,"mat-option",8),S.Ec(24),S.gc(25,"transloco"),S.Sb(),S.Tb(26,"mat-option",9),S.Ec(27),S.gc(28,"transloco"),S.Sb(),S.Sb(),S.Sb(),S.Tb(29,"mat-form-field",6),S.Tb(30,"mat-label"),S.Ec(31),S.gc(32,"transloco"),S.Sb(),S.Ob(33,"input",10),S.Ob(34,"mat-datepicker-toggle",11),S.Ob(35,"mat-datepicker",null,12),S.Sb(),S.Tb(37,"mat-form-field",6),S.Tb(38,"mat-label"),S.Ec(39),S.gc(40,"transloco"),S.Sb(),S.Ob(41,"input",13),S.Ob(42,"mat-datepicker-toggle",11),S.Ob(43,"mat-datepicker",null,14),S.Sb(),S.Tb(45,"mat-form-field",6),S.Tb(46,"mat-label"),S.Ec(47),S.gc(48,"transloco"),S.Sb(),S.Tb(49,"mat-chip-list",15,16),S.Dc(51,tt,3,4,"mat-chip",17),S.Tb(52,"input",18),S.bc("matChipInputTokenEnd",function(t){return e.addTag(t)}),S.Sb(),S.Sb(),S.Sb(),S.Sb(),S.Dc(53,et,8,3,"mat-toolbar",19),S.Tb(54,"div",20),S.Dc(55,ot,2,2,"div",21),S.Tb(56,"div",22),S.Ob(57,"markdown",23),S.Sb(),S.Sb(),S.Sb(),S.Tb(58,"mat-card-actions"),S.Tb(59,"button",24),S.bc("click",function(){return e.onOK()}),S.Ec(60),S.gc(61,"transloco"),S.Sb(),S.Tb(62,"button",25),S.bc("click",function(){return e.onReturnToList()}),S.Ec(63),S.gc(64,"transloco"),S.Sb(),S.Sb(),S.Sb()),2&t){const t=S.sc(14),o=S.sc(36),i=S.sc(44),a=S.sc(50);S.Cb(3),S.Fc(S.hc(4,26,"KnowledgeItem")),S.Cb(3),S.Fc(S.hc(7,28,e.currentMode)),S.Cb(3),S.lc("formGroup",e.itemFormGroup),S.Cb(4),S.mc("placeholder",S.hc(15,30,"Title")),S.Cb(4),S.Gc("",t.value.length," / 30"),S.Cb(3),S.Fc(S.hc(21,32,"Category")),S.Cb(4),S.Fc(S.hc(25,34,"KnowledgeItemCategory.Concept")),S.Cb(3),S.Fc(S.hc(28,36,"KnowledgeItemCategory.Formula")),S.Cb(4),S.Fc(S.hc(32,38,"CreatedAt")),S.Cb(2),S.lc("matDatepicker",o),S.Cb(1),S.lc("for",o),S.Cb(5),S.Fc(S.hc(40,40,"ModifiedAt")),S.Cb(2),S.lc("matDatepicker",i),S.Cb(1),S.lc("for",i),S.Cb(5),S.Fc(S.hc(48,42,"Tags")),S.Cb(4),S.lc("ngForOf",e.tags),S.Cb(1),S.lc("matChipInputFor",a)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),S.Cb(1),S.lc("ngIf",e.isCreateMode),S.Cb(2),S.lc("ngIf",!e.isDisplayMode),S.Cb(2),S.lc("data",e.content)("katexOptions",e.mathOptions),S.Cb(2),S.lc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),S.Cb(1),S.Fc(S.hc(61,44,"Save")),S.Cb(3),S.Fc(S.hc(64,46,"Common.ReturnToList"))}},directives:[V.a,V.d,V.g,V.f,V.c,a.u,a.n,a.g,z.b,a.c,a.m,a.e,q.c,a.s,a.i,q.f,q.g,B.a,Q.m,J.b,J.d,q.i,J.a,X.c,i.l,X.b,i.m,W.c,W.a,r.a,V.b,I.b,X.a,Y.a,X.d,w.a,n.a,a.p],pipes:[c.d],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.control-full-width[_ngcontent-%COMP%]{width:100%}td[_ngcontent-%COMP%]{padding-right:8px}table[_ngcontent-%COMP%]{width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}.toolbar-spacer[_ngcontent-%COMP%]{flex:1 1 auto}"]}),t})();const at=[{path:"",component:N},{path:"create",component:it},{path:"display/:id",component:it},{path:"edit/:id",component:it}];let nt=(()=>{class t{}return t.\u0275mod=S.Lb({type:t}),t.\u0275inj=S.Kb({factory:function(e){return new(e||t)},imports:[[d.d.forChild(at)],d.d]}),t})(),rt=(()=>{class t{}return t.\u0275mod=S.Lb({type:t}),t.\u0275inj=S.Kb({factory:function(e){return new(e||t)},imports:[[i.c,a.h,a.r,l.a,s.a,n.b,r.b.forChild(),nt,c.c]]}),t})()}}]);