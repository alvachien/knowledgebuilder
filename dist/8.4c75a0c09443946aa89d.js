(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{V7M2:function(t,e,o){"use strict";o.r(e),o.d(e,"ExerciseItemsModule",function(){return dt});var i=o("ofXK"),n=o("3Pt+"),c=o("0LvA"),a=o("lR5k"),r=o("QPBi"),s=o("jIBr"),l=o("dcRk"),b=o("tyNb"),d=o("M9IT"),m=o("Dh3D"),h=o("VRyK"),u=o("LRne"),p=o("JX91"),g=o("eIep"),C=o("lJxs"),f=o("JIr8"),T=o("VHTt"),S=o("NUjs"),v=o("fXoL"),w=o("o0su"),I=o("/t3+"),x=o("bTqV"),O=o("+0xr"),y=o("Xa2L");function D(t,e){1&t&&v.Ob(0,"mat-progress-spinner")}function E(t,e){if(1&t&&(v.Tb(0,"div",17),v.Dc(1,D,1,0,"mat-progress-spinner",18),v.Sb()),2&t){const t=v.fc();v.Cb(1),v.lc("ngIf",t.isLoadingResults)}}function F(t,e){1&t&&(v.Tb(0,"th",19),v.Ec(1,"#"),v.Sb())}function M(t,e){if(1&t&&(v.Tb(0,"td",20),v.Tb(1,"div"),v.Ec(2),v.Tb(3,"a",21),v.Ec(4),v.gc(5,"transloco"),v.Sb(),v.Tb(6,"a",21),v.Ec(7),v.gc(8,"transloco"),v.Sb(),v.Sb(),v.Sb()),2&t){const t=e.$implicit;v.Cb(2),v.Gc(" ",t.ID," "),v.Cb(1),v.nc("routerLink","display/",t.ID,""),v.Cb(1),v.Fc(v.hc(5,5,"Display")),v.Cb(2),v.nc("routerLink","edit/",t.ID,""),v.Cb(1),v.Fc(v.hc(8,7,"Change"))}}function k(t,e){1&t&&(v.Tb(0,"th",19),v.Ec(1),v.gc(2,"transloco"),v.Sb()),2&t&&(v.Cb(1),v.Fc(v.hc(2,1,"Type")))}function j(t,e){if(1&t&&(v.Tb(0,"td",20),v.Ec(1),v.gc(2,"transloco"),v.Sb()),2&t){const t=e.$implicit,o=v.fc();v.Cb(1),v.Fc(v.hc(2,1,o.getExerciseItemTypeName(t.ItemType)))}}function A(t,e){1&t&&(v.Tb(0,"th",19),v.Ec(1),v.gc(2,"transloco"),v.Sb()),2&t&&(v.Cb(1),v.Fc(v.hc(2,1,"Tag")))}function G(t,e){if(1&t&&(v.Tb(0,"td",20),v.Ec(1),v.Sb()),2&t){const t=e.$implicit;v.Cb(1),v.Fc(t.Tags.toString())}}function R(t,e){1&t&&(v.Tb(0,"th",19),v.Ec(1),v.gc(2,"transloco"),v.Sb()),2&t&&(v.Cb(1),v.Fc(v.hc(2,1,"KnowledgeItem")))}function L(t,e){if(1&t&&(v.Tb(0,"td",20),v.Ec(1),v.Sb()),2&t){const t=e.$implicit;v.Cb(1),v.Fc(t.KnowledgeItemID)}}function P(t,e){1&t&&(v.Tb(0,"th",19),v.Ec(1),v.gc(2,"transloco"),v.Sb()),2&t&&(v.Cb(1),v.Fc(v.hc(2,1,"CreatedAt")))}function N(t,e){if(1&t&&(v.Tb(0,"td",20),v.Ec(1),v.gc(2,"date"),v.Sb()),2&t){const t=e.$implicit;v.Cb(1),v.Fc(v.ic(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function U(t,e){1&t&&v.Ob(0,"tr",22)}function K(t,e){1&t&&v.Ob(0,"tr",23)}let _=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["id","itemtype","tags","knowledgeitem","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0}getExerciseItemTypeName(t){return Object(S.b)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.sort.sortChange,this.paginator.page).pipe(Object(p.a)({}),Object(g.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getExerciseItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(C.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(f.a)(()=>(this.isLoadingResults=!1,Object(u.a)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:T.q.ExerciseItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(v.Nb(w.b),v.Nb(b.b))},t.\u0275cmp=v.Hb({type:t,selectors:[["app-exercise-items"]],viewQuery:function(t,e){if(1&t&&(v.Ic(d.a,!0),v.Ic(m.a,!0)),2&t){let t;v.rc(t=v.cc())&&(e.paginator=t.first),v.rc(t=v.cc())&&(e.sort=t.first)}},decls:34,vars:16,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create"],["mat-stroked-button","",3,"disabled","click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"table-container"],["mat-table","","matSort","","matSortActive","createdat",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","itemtype"],["matColumnDef","tags"],["matColumnDef","knowledgeitem"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(v.Tb(0,"mat-toolbar-row"),v.Tb(1,"span"),v.Ec(2),v.gc(3,"transloco"),v.Sb(),v.Ob(4,"span",0),v.Tb(5,"section"),v.Tb(6,"a",1),v.Ec(7),v.gc(8,"transloco"),v.Sb(),v.Tb(9,"a",2),v.bc("click",function(){return e.onGoToPreview()}),v.Ec(10),v.gc(11,"transloco"),v.Sb(),v.Sb(),v.Sb(),v.Tb(12,"div",3),v.Dc(13,E,2,1,"div",4),v.Tb(14,"div",5),v.Tb(15,"table",6),v.bc("matSortChange",function(){return e.resetPaging()}),v.Rb(16,7),v.Dc(17,F,2,0,"th",8),v.Dc(18,M,9,9,"td",9),v.Qb(),v.Rb(19,10),v.Dc(20,k,3,3,"th",8),v.Dc(21,j,3,3,"td",9),v.Qb(),v.Rb(22,11),v.Dc(23,A,3,3,"th",8),v.Dc(24,G,2,1,"td",9),v.Qb(),v.Rb(25,12),v.Dc(26,R,3,3,"th",8),v.Dc(27,L,2,1,"td",9),v.Qb(),v.Rb(28,13),v.Dc(29,P,3,3,"th",8),v.Dc(30,N,3,4,"td",9),v.Qb(),v.Dc(31,U,1,0,"tr",14),v.Dc(32,K,1,0,"tr",15),v.Sb(),v.Sb(),v.Ob(33,"mat-paginator",16),v.Sb()),2&t&&(v.Cb(2),v.Fc(v.hc(3,10,"ExerciseItem")),v.Cb(5),v.Fc(v.hc(8,12,"Create")),v.Cb(2),v.lc("disabled",e.dataSource.length<=0),v.Cb(1),v.Fc(v.hc(11,14,"Common.Preview")),v.Cb(3),v.lc("ngIf",e.isLoadingResults),v.Cb(2),v.lc("dataSource",e.dataSource),v.Cb(16),v.lc("matHeaderRowDef",e.displayedColumns),v.Cb(1),v.lc("matRowDefColumns",e.displayedColumns),v.Cb(1),v.lc("length",e.resultsLength)("pageSize",20))},directives:[I.c,x.a,b.c,i.m,O.j,m.a,O.c,O.e,O.b,O.g,O.i,d.a,y.a,O.d,O.a,O.f,O.h],pipes:[r.d,i.e],styles:[".example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:64px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var $=o("jtHE"),H=o("FtGj"),Q=o("rCpU"),V=o("HKRH"),z=o("0IaG"),B=o("Wp6s"),J=o("kmnG"),X=o("qFsG"),q=o("d3UM"),W=o("FKr1"),Y=o("iadO"),Z=o("A5z7"),tt=o("XiUz"),et=o("NFeN");function ot(t,e){1&t&&(v.Tb(0,"mat-icon",28),v.Ec(1,"cancel"),v.Sb())}function it(t,e){if(1&t){const t=v.Ub();v.Tb(0,"mat-chip",26),v.bc("removed",function(){v.uc(t);const o=e.$implicit;return v.fc().removeTag(o)}),v.Ec(1),v.Dc(2,ot,2,0,"mat-icon",27),v.Sb()}if(2&t){const t=e.$implicit,o=v.fc();v.lc("selectable",o.selectable)("removable",o.isEditable),v.Cb(1),v.Gc(" ",t," "),v.Cb(1),v.lc("ngIf",o.isEditable)}}function nt(t,e){if(1&t){const t=v.Ub();v.Tb(0,"mat-toolbar"),v.Tb(1,"h3"),v.Ec(2),v.gc(3,"transloco"),v.Sb(),v.Ob(4,"div",29),v.Tb(5,"button",30),v.bc("click",function(){return v.uc(t),v.fc().openUploadDialog()}),v.Ec(6,"Upload"),v.Sb(),v.Sb()}2&t&&(v.Cb(2),v.Fc(v.hc(3,1,"Content")))}function ct(t,e){if(1&t){const t=v.Ub();v.Tb(0,"div",31),v.Tb(1,"ngx-monaco-editor",32),v.bc("ngModelChange",function(e){return v.uc(t),v.fc().content=e}),v.Sb(),v.Sb()}if(2&t){const t=v.fc();v.Cb(1),v.lc("options",t.editorOptions)("ngModel",t.content)}}function at(t,e){if(1&t){const t=v.Ub();v.Tb(0,"mat-toolbar"),v.Tb(1,"h3"),v.Ec(2),v.gc(3,"transloco"),v.Sb(),v.Ob(4,"div",29),v.Tb(5,"button",30),v.bc("click",function(){return v.uc(t),v.fc().openAnswerUploadDialog()}),v.Tb(6,"mat-icon"),v.Ec(7,"file_upload"),v.Sb(),v.Sb(),v.Sb()}2&t&&(v.Cb(2),v.Fc(v.hc(3,1,"Answer")))}function rt(t,e){if(1&t){const t=v.Ub();v.Tb(0,"div",31),v.Tb(1,"ngx-monaco-editor",32),v.bc("ngModelChange",function(e){return v.uc(t),v.fc().answerContent=e}),v.Sb(),v.Sb()}if(2&t){const t=v.fc();v.Cb(1),v.lc("options",t.editorOptions)("ngModel",t.answerContent)}}let st=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.uiMode=Q.c.Create,this.currentMode="",this.editorOptions={theme:"vs-dark"},this.content="New Exercise Item",this.answerContent="",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[H.g,H.c],this.tags=[],this.itemFormGroup=new n.f({idControl:new n.d({value:null,disabled:!0}),typeControl:new n.d,createdAtControl:new n.d({value:null,disabled:!0}),modifiedAtControl:new n.d({value:null,disabled:!0}),knowledgeControl:new n.d,tagControl:new n.d})}get isDisplayMode(){return this.uiMode===Q.c.Display}get isCreateMode(){return this.uiMode===Q.c.Create}get isUpdateMode(){return this.uiMode===Q.c.Update}get isEditable(){return this.uiMode===Q.c.Create||this.uiMode===Q.c.Update}ngOnInit(){this.destroyed$=new $.a(1),this.activateRoute.url.subscribe({next:t=>{t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=Q.c.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=Q.c.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=Q.c.Display,this.currentMode="Common.Display")),-1!==this.routerID&&this.odataService.readExerciseItem(this.routerID).subscribe({next:t=>{this.onSetItemData(t),this.itemObject=t},error:t=>{console.error(t)}})},error:t=>{console.error(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.error(this.itemFormGroup.errors));this.itemObject=new S.a,this.itemObject.ItemType=this.itemFormGroup.get("typeControl").value,this.itemObject.Content=this.content,this.itemObject.Tags=this.tags,this.itemObject.Answer=this.answerContent,this.odataService.createExerciseItem(this.itemObject).subscribe({next:t=>{this.router.navigate(["/exercise-item/display",t.ID])},error:t=>{console.error(t)}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));this.itemObject&&(this.itemObject.ItemType=this.itemFormGroup.get("typeControl").value,this.itemObject.Content=this.content,this.itemObject.Tags=this.tags,this.itemObject.Answer=this.answerContent,this.odataService.changeExerciseItem(this.itemObject).subscribe({next:t=>{this.router.navigate(["/exercise-item/display",t.ID])},error:t=>{console.error(t)}}))}}openUploadDialog(){this.dialog.open(V.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}openAnswerUploadDialog(){this.dialog.open(V.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.answerContent+=`\n  ![Img](${t.url})\n            `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onSetItemData(t){var e,o,i,n,c;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable(),null===(i=this.itemFormGroup.get("typeControl"))||void 0===i||i.setValue(t.ItemType),null===(n=this.itemFormGroup.get("createdAtControl"))||void 0===n||n.setValue(t.CreatedAt),null===(c=this.itemFormGroup.get("modifiedAtControl"))||void 0===c||c.setValue(t.ModifiedAt),this.content=t.Content,this.tags=t.Tags,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()}onReturnToList(){this.router.navigate(["exercise-item"])}}return t.\u0275fac=function(e){return new(e||t)(v.Nb(z.a),v.Nb(b.a),v.Nb(b.b),v.Nb(w.b))},t.\u0275cmp=v.Hb({type:t,selectors:[["app-exercise-item-detail"]],decls:80,vars:60,consts:[[3,"formGroup"],["appearance","fill",1,"control-full-width"],["matInput","","type","text","placeholder","ID","formControlName","idControl"],["required","","formControlName","typeControl"],["value","0"],["value","1"],["value","2"],["value","3"],["value","4"],["matInput","","formControlName","createdAtControl",3,"matDatepicker"],["matSuffix","",3,"for"],["createdAt",""],["matInput","","formControlName","modifiedAtControl",3,"matDatepicker"],["modifiedAt",""],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],["matInput","","type","text","placeholder","Knowledge ID","formControlName","knowledgeControl"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["emoji","","katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],["fxFlex","50"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(v.Tb(0,"mat-card"),v.Tb(1,"mat-card-header"),v.Tb(2,"mat-card-title"),v.Ec(3),v.gc(4,"transloco"),v.Sb(),v.Tb(5,"mat-card-subtitle"),v.Ec(6),v.gc(7,"transloco"),v.Sb(),v.Sb(),v.Tb(8,"mat-card-content"),v.Tb(9,"form",0),v.Tb(10,"mat-form-field",1),v.Tb(11,"mat-label"),v.Ec(12,"#"),v.Sb(),v.Ob(13,"input",2),v.Sb(),v.Tb(14,"mat-form-field",1),v.Tb(15,"mat-label"),v.Ec(16),v.gc(17,"transloco"),v.Sb(),v.Tb(18,"mat-select",3),v.Tb(19,"mat-option",4),v.Ec(20),v.gc(21,"transloco"),v.Sb(),v.Tb(22,"mat-option",5),v.Ec(23),v.gc(24,"transloco"),v.Sb(),v.Tb(25,"mat-option",6),v.Ec(26),v.gc(27,"transloco"),v.Sb(),v.Tb(28,"mat-option",7),v.Ec(29),v.gc(30,"transloco"),v.Sb(),v.Tb(31,"mat-option",8),v.Ec(32),v.gc(33,"transloco"),v.Sb(),v.Sb(),v.Sb(),v.Tb(34,"mat-form-field",1),v.Tb(35,"mat-label"),v.Ec(36),v.gc(37,"transloco"),v.Sb(),v.Ob(38,"input",9),v.Ob(39,"mat-datepicker-toggle",10),v.Ob(40,"mat-datepicker",null,11),v.Sb(),v.Tb(42,"mat-form-field",1),v.Tb(43,"mat-label"),v.Ec(44),v.gc(45,"transloco"),v.Sb(),v.Ob(46,"input",12),v.Ob(47,"mat-datepicker-toggle",10),v.Ob(48,"mat-datepicker",null,13),v.Sb(),v.Tb(50,"mat-form-field",1),v.Tb(51,"mat-label"),v.Ec(52),v.gc(53,"transloco"),v.Sb(),v.Tb(54,"mat-chip-list",14,15),v.Dc(56,it,3,4,"mat-chip",16),v.Tb(57,"input",17),v.bc("matChipInputTokenEnd",function(t){return e.addTag(t)}),v.Sb(),v.Sb(),v.Sb(),v.Tb(58,"mat-form-field",1),v.Tb(59,"mat-label"),v.Ec(60),v.gc(61,"transloco"),v.Sb(),v.Ob(62,"input",18),v.Sb(),v.Sb(),v.Dc(63,nt,7,3,"mat-toolbar",19),v.Tb(64,"div",20),v.Dc(65,ct,2,2,"div",21),v.Tb(66,"div",22),v.Ob(67,"markdown",23),v.Sb(),v.Sb(),v.Dc(68,at,8,3,"mat-toolbar",19),v.Tb(69,"div",20),v.Dc(70,rt,2,2,"div",21),v.Tb(71,"div",22),v.Ob(72,"markdown",23),v.Sb(),v.Sb(),v.Sb(),v.Tb(73,"mat-card-actions"),v.Tb(74,"button",24),v.bc("click",function(){return e.onOK()}),v.Ec(75),v.gc(76,"transloco"),v.Sb(),v.Tb(77,"button",25),v.bc("click",function(){return e.onReturnToList()}),v.Ec(78),v.gc(79,"transloco"),v.Sb(),v.Sb(),v.Sb()),2&t){const t=v.sc(41),o=v.sc(49),i=v.sc(55);v.Cb(3),v.Fc(v.hc(4,32,"ExerciseItem")),v.Cb(3),v.Fc(v.hc(7,34,e.currentMode)),v.Cb(3),v.lc("formGroup",e.itemFormGroup),v.Cb(7),v.Fc(v.hc(17,36,"Type")),v.Cb(4),v.Fc(v.hc(21,38,"ExerciseItemType.Question")),v.Cb(3),v.Fc(v.hc(24,40,"ExerciseItemType.SingleChoice")),v.Cb(3),v.Fc(v.hc(27,42,"ExerciseItemType.MultipleChoices")),v.Cb(3),v.Fc(v.hc(30,44,"ExerciseItemType.ShortAnswer")),v.Cb(3),v.Fc(v.hc(33,46,"ExerciseItemType.EssayQuestion")),v.Cb(4),v.Fc(v.hc(37,48,"CreatedAt")),v.Cb(2),v.lc("matDatepicker",t),v.Cb(1),v.lc("for",t),v.Cb(5),v.Fc(v.hc(45,50,"ModifiedAt")),v.Cb(2),v.lc("matDatepicker",o),v.Cb(1),v.lc("for",o),v.Cb(5),v.Fc(v.hc(53,52,"Tags")),v.Cb(4),v.lc("ngForOf",e.tags),v.Cb(1),v.lc("matChipInputFor",i)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),v.Cb(3),v.Fc(v.hc(61,54,"KnowledgeItem")),v.Cb(3),v.lc("ngIf",e.isCreateMode),v.Cb(2),v.lc("ngIf",!e.isDisplayMode),v.Cb(2),v.lc("data",e.content)("katexOptions",e.mathOptions),v.Cb(1),v.lc("ngIf",e.isCreateMode),v.Cb(2),v.lc("ngIf",e.isCreateMode),v.Cb(2),v.lc("data",e.answerContent)("katexOptions",e.mathOptions),v.Cb(2),v.lc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),v.Cb(1),v.Fc(v.hc(76,56,"Save")),v.Cb(3),v.Fc(v.hc(79,58,"Common.ReturnToList"))}},directives:[B.a,B.d,B.g,B.f,B.c,n.u,n.n,n.g,J.c,J.g,X.b,n.c,n.m,n.e,q.a,n.s,W.m,Y.b,Y.d,J.i,Y.a,Z.c,i.l,Z.b,i.m,tt.c,tt.a,a.a,B.b,x.b,Z.a,et.a,Z.d,I.a,c.a,n.p],pipes:[r.d],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.control-full-width[_ngcontent-%COMP%]{width:100%}td[_ngcontent-%COMP%]{padding-right:8px}table[_ngcontent-%COMP%]{width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:10px}.toolbar-spacer[_ngcontent-%COMP%]{flex:1 1 auto}"]}),t})();const lt=[{path:"",component:_},{path:"create",component:st},{path:"display/:id",component:st},{path:"edit/:id",component:st}];let bt=(()=>{class t{}return t.\u0275mod=v.Lb({type:t}),t.\u0275inj=v.Kb({factory:function(e){return new(e||t)},imports:[[b.d.forChild(lt)],b.d]}),t})(),dt=(()=>{class t{}return t.\u0275mod=v.Lb({type:t}),t.\u0275inj=v.Kb({factory:function(e){return new(e||t)},imports:[[i.c,n.h,n.r,s.a,l.a,c.b,a.b.forChild(),bt,r.c]]}),t})()}}]);