(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{V7M2:function(t,e,o){"use strict";o.r(e),o.d(e,"ExerciseItemsModule",function(){return rt});var i=o("ofXK"),n=o("3Pt+"),a=o("yvwu"),c=o("lR5k"),r=o("QPBi"),s=o("jIBr"),l=o("dcRk"),b=o("tyNb"),d=o("M9IT"),m=o("Dh3D"),p=o("VRyK"),h=o("LRne"),u=o("JX91"),g=o("eIep"),C=o("lJxs"),f=o("JIr8"),T=o("NUjs"),S=o("fXoL"),x=o("o0su"),v=o("/t3+"),w=o("bTqV"),I=o("+0xr"),O=o("Xa2L");function y(t,e){1&t&&S.Ob(0,"mat-progress-spinner")}function D(t,e){if(1&t&&(S.Tb(0,"div",16),S.Dc(1,y,1,0,"mat-progress-spinner",17),S.Sb()),2&t){const t=S.fc();S.Cb(1),S.lc("ngIf",t.isLoadingResults)}}function E(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1,"#"),S.Sb())}function F(t,e){if(1&t&&(S.Tb(0,"td",19),S.Tb(1,"div"),S.Ec(2),S.Tb(3,"a",20),S.Ec(4),S.gc(5,"transloco"),S.Sb(),S.Tb(6,"a",20),S.Ec(7),S.gc(8,"transloco"),S.Sb(),S.Sb(),S.Sb()),2&t){const t=e.$implicit;S.Cb(2),S.Gc(" ",t.ID," "),S.Cb(1),S.nc("routerLink","display/",t.ID,""),S.Cb(1),S.Fc(S.hc(5,5,"Display")),S.Cb(2),S.nc("routerLink","edit/",t.ID,""),S.Cb(1),S.Fc(S.hc(8,7,"Change"))}}function M(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t&&(S.Cb(1),S.Fc(S.hc(2,1,"Type")))}function k(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t){const t=e.$implicit,o=S.fc();S.Cb(1),S.Fc(S.hc(2,1,o.getExerciseItemTypeName(t.ItemType)))}}function _(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1),S.gc(2,"transloco"),S.Sb()),2&t&&(S.Cb(1),S.Fc(S.hc(2,1,"KnowledgeItem")))}function j(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.Sb()),2&t){const t=e.$implicit;S.Cb(1),S.Fc(t.KnowledgeItemID)}}function A(t,e){1&t&&(S.Tb(0,"th",18),S.Ec(1,"Created At"),S.Sb())}function G(t,e){if(1&t&&(S.Tb(0,"td",19),S.Ec(1),S.gc(2,"date"),S.Sb()),2&t){const t=e.$implicit;S.Cb(1),S.Fc(S.ic(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function R(t,e){1&t&&S.Ob(0,"tr",21)}function L(t,e){1&t&&S.Ob(0,"tr",22)}let N=(()=>{class t{constructor(t){this.odataService=t,this.displayedColumns=["id","itemtype","knowledgeitem","createdat"],this.data=[],this.resultsLength=0,this.isLoadingResults=!0}getExerciseItemTypeName(t){return Object(T.b)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(p.a)(this.sort.sortChange,this.paginator.page).pipe(Object(u.a)({}),Object(g.a)(()=>(this.isLoadingResults=!0,this.odataService.getExerciseItems())),Object(C.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(f.a)(()=>(this.isLoadingResults=!1,Object(h.a)([])))).subscribe(t=>this.data=t)}}return t.\u0275fac=function(e){return new(e||t)(S.Nb(x.b))},t.\u0275cmp=S.Hb({type:t,selectors:[["app-exercise-items"]],viewQuery:function(t,e){if(1&t&&(S.Ic(d.a,!0),S.Ic(m.a,!0)),2&t){let t;S.rc(t=S.cc())&&(e.paginator=t.first),S.rc(t=S.cc())&&(e.sort=t.first)}},decls:29,vars:12,consts:[[1,"example-spacer"],[1,"example-button-row"],["mat-stroked-button","","routerLink","create"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","createdat",1,"example-table",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","itemtype"],["matColumnDef","knowledgeitem"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(S.Tb(0,"mat-toolbar-row"),S.Tb(1,"span"),S.Ec(2),S.gc(3,"transloco"),S.Sb(),S.Ob(4,"span",0),S.Tb(5,"section"),S.Tb(6,"div",1),S.Tb(7,"a",2),S.Ec(8),S.gc(9,"transloco"),S.Sb(),S.Sb(),S.Sb(),S.Sb(),S.Tb(10,"div",3),S.Dc(11,D,2,1,"div",4),S.Tb(12,"div",5),S.Tb(13,"table",6),S.Rb(14,7),S.Dc(15,E,2,0,"th",8),S.Dc(16,F,9,9,"td",9),S.Qb(),S.Rb(17,10),S.Dc(18,M,3,3,"th",8),S.Dc(19,k,3,3,"td",9),S.Qb(),S.Rb(20,11),S.Dc(21,_,3,3,"th",8),S.Dc(22,j,2,1,"td",9),S.Qb(),S.Rb(23,12),S.Dc(24,A,2,0,"th",8),S.Dc(25,G,3,4,"td",9),S.Qb(),S.Dc(26,R,1,0,"tr",13),S.Dc(27,L,1,0,"tr",14),S.Sb(),S.Sb(),S.Ob(28,"mat-paginator",15),S.Sb()),2&t&&(S.Cb(2),S.Fc(S.hc(3,8,"ExerciseItem")),S.Cb(6),S.Fc(S.hc(9,10,"Create")),S.Cb(3),S.lc("ngIf",e.isLoadingResults),S.Cb(2),S.lc("dataSource",e.data),S.Cb(13),S.lc("matHeaderRowDef",e.displayedColumns),S.Cb(1),S.lc("matRowDefColumns",e.displayedColumns),S.Cb(1),S.lc("length",e.resultsLength)("pageSize",30))},directives:[v.c,w.a,b.c,i.m,I.j,m.a,I.c,I.e,I.b,I.g,I.i,d.a,O.a,I.d,I.a,I.f,I.h],pipes:[r.d,i.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.example-rate-limit-reached[_ngcontent-%COMP%]{color:#980000;max-width:360px;text-align:center}.mat-column-number[_ngcontent-%COMP%], .mat-column-state[_ngcontent-%COMP%]{max-width:64px}.mat-column-created[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var P=o("jtHE"),K=o("FtGj"),U=o("HKRH"),$=o("0IaG"),H=o("Wp6s"),Q=o("kmnG"),V=o("qFsG"),z=o("d3UM"),B=o("FKr1"),J=o("iadO"),X=o("A5z7"),q=o("XiUz"),W=o("NFeN");function Y(t,e){1&t&&(S.Tb(0,"mat-icon",28),S.Ec(1,"cancel"),S.Sb())}function Z(t,e){if(1&t){const t=S.Ub();S.Tb(0,"mat-chip",26),S.bc("removed",function(){S.uc(t);const o=e.$implicit;return S.fc().removeTag(o)}),S.Ec(1),S.Dc(2,Y,2,0,"mat-icon",27),S.Sb()}if(2&t){const t=e.$implicit,o=S.fc();S.lc("selectable",o.selectable)("removable",o.isEditable),S.Cb(1),S.Gc(" ",t," "),S.Cb(1),S.lc("ngIf",o.isEditable)}}function tt(t,e){if(1&t){const t=S.Ub();S.Tb(0,"mat-toolbar"),S.Tb(1,"h3"),S.Ec(2),S.gc(3,"transloco"),S.Sb(),S.Ob(4,"div",29),S.Tb(5,"button",30),S.bc("click",function(){return S.uc(t),S.fc().openUploadDialog()}),S.Ec(6,"Upload"),S.Sb(),S.Sb()}2&t&&(S.Cb(2),S.Fc(S.hc(3,1,"Content")))}function et(t,e){if(1&t){const t=S.Ub();S.Tb(0,"div",31),S.Tb(1,"ngx-monaco-editor",32),S.bc("ngModelChange",function(e){return S.uc(t),S.fc().content=e}),S.Sb(),S.Sb()}if(2&t){const t=S.fc();S.Cb(1),S.lc("options",t.editorOptions)("ngModel",t.content)}}function ot(t,e){if(1&t){const t=S.Ub();S.Tb(0,"mat-toolbar"),S.Tb(1,"h3"),S.Ec(2),S.gc(3,"transloco"),S.Sb(),S.Ob(4,"div",29),S.Tb(5,"button",30),S.bc("click",function(){return S.uc(t),S.fc().openAnswerUploadDialog()}),S.Tb(6,"mat-icon"),S.Ec(7,"file_upload"),S.Sb(),S.Sb(),S.Sb()}2&t&&(S.Cb(2),S.Fc(S.hc(3,1,"Answer")))}function it(t,e){if(1&t){const t=S.Ub();S.Tb(0,"div",31),S.Tb(1,"ngx-monaco-editor",32),S.bc("ngModelChange",function(e){return S.uc(t),S.fc().answerContent=e}),S.Sb(),S.Sb()}if(2&t){const t=S.fc();S.Cb(1),S.lc("options",t.editorOptions)("ngModel",t.answerContent)}}let nt=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.editorOptions={theme:"vs-dark"},this.content="New Exercise Item",this.answerContent="",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[K.g,K.c],this.tags=[],this.itemFormGroup=new n.f({idControl:new n.d({value:null,disabled:!0}),typeControl:new n.d,createdAtControl:new n.d({value:null,disabled:!0}),modifiedAtControl:new n.d({value:null,disabled:!0}),knowledgeControl:new n.d,tagControl:new n.d}),this.currentMode="Create"}get isDisplayMode(){return"Display"===this.currentMode}get isCreateMode(){return"Create"===this.currentMode}get isEditable(){return"Create"===this.currentMode||"Change"===this.currentMode}ngOnInit(){this._destroyed$=new P.a(1),this.activateRoute.url.subscribe({next:t=>{t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.currentMode="Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.currentMode="Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.currentMode="Display")),-1!==this.routerID&&this.odataService.readExerciseItem(this.routerID).subscribe({next:t=>{this.onSetItemData(t),this._itemObject=t},error:t=>{console.error(t)}})},error:t=>{console.error(t)}})}ngOnDestroy(){this._destroyed$&&(this._destroyed$.complete(),this._destroyed$=void 0)}onOK(){if("Create"===this.currentMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.error(this.itemFormGroup.errors));this._itemObject=new T.a,this._itemObject.ItemType=this.itemFormGroup.get("typeControl").value,this._itemObject.Content=this.content,this._itemObject.Tags=this.tags,this._itemObject.Answer=this.answerContent,this.odataService.createExerciseItem(this._itemObject).subscribe({next:t=>{this.router.navigate(["/exercise-item/display",t.ID])},error:t=>{console.error(t)}})}else if("Change"===this.currentMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));this._itemObject&&(this._itemObject.ItemType=this.itemFormGroup.get("typeControl").value,this._itemObject.Content=this.content,this._itemObject.Tags=this.tags,this._itemObject.Answer=this.answerContent,this.odataService.changeExerciseItem(this._itemObject).subscribe({next:t=>{this.router.navigate(["/exercise-item/display",t.ID])},error:t=>{console.error(t)}}))}}openUploadDialog(){this.dialog.open(U.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}openAnswerUploadDialog(){this.dialog.open(U.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.answerContent+=`\n  ![Img](${t.url})\n            `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onSetItemData(t){var e,o,i,n,a;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable(),null===(i=this.itemFormGroup.get("typeControl"))||void 0===i||i.setValue(t.ItemType),null===(n=this.itemFormGroup.get("createdAtControl"))||void 0===n||n.setValue(t.CreatedAt),null===(a=this.itemFormGroup.get("modifiedAtControl"))||void 0===a||a.setValue(t.ModifiedAt),this.content=t.Content,this.tags=t.Tags,"Display"===this.currentMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()}}return t.\u0275fac=function(e){return new(e||t)(S.Nb($.a),S.Nb(b.a),S.Nb(b.b),S.Nb(x.b))},t.\u0275cmp=S.Hb({type:t,selectors:[["app-exercise-item-detail"]],decls:79,vars:58,consts:[[3,"formGroup"],["appearance","fill",1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["required","","formControlName","typeControl"],["value","0"],["value","1"],["value","2"],["value","3"],["value","4"],["matInput","","formControlName","createdAtControl",3,"matDatepicker"],["matSuffix","",3,"for"],["createdAt",""],["matInput","","formControlName","modifiedAtControl",3,"matDatepicker"],["modifiedAt",""],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],["matInput","","type","text","placeholder","Knowledge ID","formControlName","knowledgeControl"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["emoji","","katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button",""],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],["fxFlex","50"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(S.Tb(0,"mat-card"),S.Tb(1,"mat-card-header"),S.Tb(2,"mat-card-title"),S.Ec(3),S.gc(4,"transloco"),S.Sb(),S.Tb(5,"mat-card-subtitle"),S.Ec(6),S.Sb(),S.Sb(),S.Tb(7,"mat-card-content"),S.Tb(8,"form",0),S.Tb(9,"mat-form-field",1),S.Tb(10,"mat-label"),S.Ec(11,"#"),S.Sb(),S.Ob(12,"input",2),S.Sb(),S.Tb(13,"mat-form-field",1),S.Tb(14,"mat-label"),S.Ec(15),S.gc(16,"transloco"),S.Sb(),S.Tb(17,"mat-select",3),S.Tb(18,"mat-option",4),S.Ec(19),S.gc(20,"transloco"),S.Sb(),S.Tb(21,"mat-option",5),S.Ec(22),S.gc(23,"transloco"),S.Sb(),S.Tb(24,"mat-option",6),S.Ec(25),S.gc(26,"transloco"),S.Sb(),S.Tb(27,"mat-option",7),S.Ec(28),S.gc(29,"transloco"),S.Sb(),S.Tb(30,"mat-option",8),S.Ec(31),S.gc(32,"transloco"),S.Sb(),S.Sb(),S.Sb(),S.Tb(33,"mat-form-field",1),S.Tb(34,"mat-label"),S.Ec(35),S.gc(36,"transloco"),S.Sb(),S.Ob(37,"input",9),S.Ob(38,"mat-datepicker-toggle",10),S.Ob(39,"mat-datepicker",null,11),S.Sb(),S.Tb(41,"mat-form-field",1),S.Tb(42,"mat-label"),S.Ec(43),S.gc(44,"transloco"),S.Sb(),S.Ob(45,"input",12),S.Ob(46,"mat-datepicker-toggle",10),S.Ob(47,"mat-datepicker",null,13),S.Sb(),S.Tb(49,"mat-form-field",1),S.Tb(50,"mat-label"),S.Ec(51),S.gc(52,"transloco"),S.Sb(),S.Tb(53,"mat-chip-list",14,15),S.Dc(55,Z,3,4,"mat-chip",16),S.Tb(56,"input",17),S.bc("matChipInputTokenEnd",function(t){return e.addTag(t)}),S.Sb(),S.Sb(),S.Sb(),S.Tb(57,"mat-form-field",1),S.Tb(58,"mat-label"),S.Ec(59),S.gc(60,"transloco"),S.Sb(),S.Ob(61,"input",18),S.Sb(),S.Sb(),S.Dc(62,tt,7,3,"mat-toolbar",19),S.Tb(63,"div",20),S.Dc(64,et,2,2,"div",21),S.Tb(65,"div",22),S.Ob(66,"markdown",23),S.Sb(),S.Sb(),S.Dc(67,ot,8,3,"mat-toolbar",19),S.Tb(68,"div",20),S.Dc(69,it,2,2,"div",21),S.Tb(70,"div",22),S.Ob(71,"markdown",23),S.Sb(),S.Sb(),S.Sb(),S.Tb(72,"mat-card-actions"),S.Tb(73,"button",24),S.bc("click",function(){return e.onOK()}),S.Ec(74),S.gc(75,"transloco"),S.Sb(),S.Tb(76,"button",25),S.Ec(77),S.gc(78,"transloco"),S.Sb(),S.Sb(),S.Sb()),2&t){const t=S.sc(40),o=S.sc(48),i=S.sc(54);S.Cb(3),S.Fc(S.hc(4,32,"ExerciseItem")),S.Cb(3),S.Fc(e.currentMode),S.Cb(2),S.lc("formGroup",e.itemFormGroup),S.Cb(7),S.Fc(S.hc(16,34,"Type")),S.Cb(4),S.Fc(S.hc(20,36,"ExerciseItemType.Question")),S.Cb(3),S.Fc(S.hc(23,38,"ExerciseItemType.SingleChoice")),S.Cb(3),S.Fc(S.hc(26,40,"ExerciseItemType.MultipleChoices")),S.Cb(3),S.Fc(S.hc(29,42,"ExerciseItemType.ShortAnswer")),S.Cb(3),S.Fc(S.hc(32,44,"ExerciseItemType.EssayQuestion")),S.Cb(4),S.Fc(S.hc(36,46,"CreatedAt")),S.Cb(2),S.lc("matDatepicker",t),S.Cb(1),S.lc("for",t),S.Cb(5),S.Fc(S.hc(44,48,"ModifiedAt")),S.Cb(2),S.lc("matDatepicker",o),S.Cb(1),S.lc("for",o),S.Cb(5),S.Fc(S.hc(52,50,"Tags")),S.Cb(4),S.lc("ngForOf",e.tags),S.Cb(1),S.lc("matChipInputFor",i)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),S.Cb(3),S.Fc(S.hc(60,52,"KnowledgeItem")),S.Cb(3),S.lc("ngIf",e.isCreateMode),S.Cb(2),S.lc("ngIf",!e.isDisplayMode),S.Cb(2),S.lc("data",e.content)("katexOptions",e.mathOptions),S.Cb(1),S.lc("ngIf",e.isCreateMode),S.Cb(2),S.lc("ngIf",e.isCreateMode),S.Cb(2),S.lc("data",e.answerContent)("katexOptions",e.mathOptions),S.Cb(2),S.lc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),S.Cb(1),S.Fc(S.hc(75,54,"Save")),S.Cb(3),S.Fc(S.hc(78,56,"Cancel"))}},directives:[H.a,H.d,H.g,H.f,H.c,n.u,n.n,n.g,Q.c,Q.g,V.b,n.c,n.m,n.e,z.a,n.s,B.m,J.b,J.d,Q.i,J.a,X.c,i.l,X.b,i.m,q.c,q.a,c.a,H.b,w.b,X.a,W.a,X.d,v.a,a.a,n.p],pipes:[r.d],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.control-full-width[_ngcontent-%COMP%]{width:100%}td[_ngcontent-%COMP%]{padding-right:8px}table[_ngcontent-%COMP%]{width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:10px}.toolbar-spacer[_ngcontent-%COMP%]{flex:1 1 auto}"]}),t})();const at=[{path:"",component:N},{path:"create",component:nt},{path:"display/:id",component:nt},{path:"edit/:id",component:nt}];let ct=(()=>{class t{}return t.\u0275mod=S.Lb({type:t}),t.\u0275inj=S.Kb({factory:function(e){return new(e||t)},imports:[[b.d.forChild(at)],b.d]}),t})(),rt=(()=>{class t{}return t.\u0275mod=S.Lb({type:t}),t.\u0275inj=S.Kb({factory:function(e){return new(e||t)},imports:[[i.c,n.h,n.r,s.a,l.a,a.b,c.b.forChild(),ct,r.c]]}),t})()}}]);