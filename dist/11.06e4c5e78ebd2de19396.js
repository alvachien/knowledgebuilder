(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{"U+IK":function(t,e,o){"use strict";o.r(e),o.d(e,"KnowledgeItemsModule",function(){return rt});var i=o("ofXK"),r=o("3Pt+"),n=o("0LvA"),c=o("lR5k"),a=o("QPBi"),s=o("jIBr"),l=o("dcRk"),d=o("tyNb"),b=o("fXoL"),m=o("M9IT"),u=o("Dh3D"),h=o("VRyK"),p=o("LRne"),g=o("JX91"),C=o("eIep"),f=o("lJxs"),v=o("JIr8"),S=o("VHTt"),T=o("o0su"),w=o("/t3+"),y=o("bTqV"),I=o("+0xr");function F(t,e){1&t&&(b.Tb(0,"th",17),b.Ec(1,"#"),b.Sb())}function D(t,e){if(1&t){const t=b.Ub();b.Tb(0,"td",18),b.Tb(1,"div"),b.Ec(2),b.Tb(3,"a",19),b.Ec(4),b.gc(5,"transloco"),b.Sb(),b.Tb(6,"a",19),b.Ec(7),b.gc(8,"transloco"),b.Sb(),b.Tb(9,"a",20),b.bc("click",function(){b.uc(t);const o=e.$implicit;return b.fc().onDeleteItem(o.ID)}),b.Ec(10),b.gc(11,"transloco"),b.Sb(),b.Sb(),b.Sb()}if(2&t){const t=e.$implicit;b.Cb(2),b.Gc(" ",t.ID," "),b.Cb(1),b.nc("routerLink","display/",t.ID,""),b.Cb(1),b.Fc(b.hc(5,6,"Common.Display")),b.Cb(2),b.nc("routerLink","edit/",t.ID,""),b.Cb(1),b.Fc(b.hc(8,8,"Common.Change")),b.Cb(3),b.Fc(b.hc(11,10,"Common.Delete"))}}function x(t,e){1&t&&(b.Tb(0,"th",17),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"Category")))}function O(t,e){if(1&t&&(b.Tb(0,"td",18),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t){const t=e.$implicit,o=b.fc();b.Cb(1),b.Fc(b.hc(2,1,o.getKnowledgeItemCategoryName(t.ItemCategory)))}}function M(t,e){1&t&&(b.Tb(0,"th",17),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"Title")))}function E(t,e){if(1&t&&(b.Tb(0,"td",18),b.Ec(1),b.Sb()),2&t){const t=e.$implicit;b.Cb(1),b.Fc(t.Title)}}function k(t,e){1&t&&(b.Tb(0,"th",21),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t&&(b.Cb(1),b.Fc(b.hc(2,1,"CreatedAt")))}function G(t,e){if(1&t&&(b.Tb(0,"td",18),b.Ec(1),b.gc(2,"date"),b.Sb()),2&t){const t=e.$implicit;b.Cb(1),b.Fc(b.ic(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function R(t,e){1&t&&b.Ob(0,"tr",22)}function K(t,e){1&t&&b.Ob(0,"tr",23)}let L=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new b.o}getKnowledgeItemCategoryName(t){return Object(S.x)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe(Object(g.a)({}),Object(C.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getKnowledgeItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(f.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(v.a)(()=>(this.isLoadingResults=!1,Object(p.a)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:S.t.KnowledgeItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}onGoToSearch(){this.router.navigate(["knowledge-item","search"])}onDeleteItem(t){this.odataService.deleteExerciseItem(t).subscribe({next:t=>{this.onRefreshList()},error:t=>{console.error(t)}})}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(b.Nb(T.b),b.Nb(d.b))},t.\u0275cmp=b.Hb({type:t,selectors:[["app-knowledge-items"]],viewQuery:function(t,e){if(1&t&&(b.Ic(m.a,!0),b.Ic(u.a,!0)),2&t){let t;b.rc(t=b.cc())&&(e.paginator=t.first),b.rc(t=b.cc())&&(e.sort=t.first)}},decls:36,vars:22,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create"],["mat-stroked-button","",3,"disabled","click"],["mat-stroked-button","",3,"click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-button","",3,"click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(b.Tb(0,"mat-toolbar-row"),b.Tb(1,"span"),b.Ec(2),b.gc(3,"transloco"),b.Sb(),b.Ob(4,"span",0),b.Tb(5,"section"),b.Tb(6,"a",1),b.Ec(7),b.gc(8,"transloco"),b.Sb(),b.Tb(9,"a",2),b.bc("click",function(){return e.onGoToSearch()}),b.Ec(10),b.gc(11,"transloco"),b.Sb(),b.Tb(12,"a",2),b.bc("click",function(){return e.onGoToPreview()}),b.Ec(13),b.gc(14,"transloco"),b.Sb(),b.Tb(15,"a",3),b.bc("click",function(){return e.onRefreshList()}),b.Ec(16),b.gc(17,"transloco"),b.Sb(),b.Sb(),b.Sb(),b.Tb(18,"div",4),b.Tb(19,"div",5),b.Tb(20,"table",6),b.bc("matSortChange",function(){return e.resetPaging()}),b.Rb(21,7),b.Dc(22,F,2,0,"th",8),b.Dc(23,D,12,12,"td",9),b.Qb(),b.Rb(24,10),b.Dc(25,x,3,3,"th",8),b.Dc(26,O,3,3,"td",9),b.Qb(),b.Rb(27,11),b.Dc(28,M,3,3,"th",8),b.Dc(29,E,2,1,"td",9),b.Qb(),b.Rb(30,12),b.Dc(31,k,3,3,"th",13),b.Dc(32,G,3,4,"td",9),b.Qb(),b.Dc(33,R,1,0,"tr",14),b.Dc(34,K,1,0,"tr",15),b.Sb(),b.Sb(),b.Ob(35,"mat-paginator",16),b.Sb()),2&t&&(b.Cb(2),b.Fc(b.hc(3,12,"KnowledgeItem")),b.Cb(5),b.Fc(b.hc(8,14,"Common.Create")),b.Cb(2),b.lc("disabled",e.dataSource.length<=0),b.Cb(1),b.Fc(b.hc(11,16,"Common.Search")),b.Cb(2),b.lc("disabled",e.dataSource.length<=0),b.Cb(1),b.Fc(b.hc(14,18,"Common.Preview")),b.Cb(3),b.Fc(b.hc(17,20,"Common.Refresh")),b.Cb(4),b.lc("dataSource",e.dataSource),b.Cb(13),b.lc("matHeaderRowDef",e.displayedColumns),b.Cb(1),b.lc("matRowDefColumns",e.displayedColumns),b.Cb(1),b.lc("length",e.resultsLength)("pageSize",20))},directives:[w.c,y.a,d.c,I.j,u.a,I.c,I.e,I.b,I.g,I.i,m.a,I.d,I.a,u.b,I.f,I.h],pipes:[a.d,i.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var N=o("jtHE"),A=o("FtGj"),P=o("rCpU"),j=o("HKRH"),H=o("0IaG"),U=o("Wp6s"),$=o("kmnG"),_=o("qFsG"),V=o("d3UM"),z=o("A5z7"),B=o("XiUz"),Q=o("FKr1"),q=o("NFeN");function J(t,e){if(1&t&&(b.Tb(0,"mat-option",21),b.Ec(1),b.gc(2,"transloco"),b.Sb()),2&t){const t=e.$implicit;b.lc("value",t.value),b.Cb(1),b.Fc(b.hc(2,2,t.i18nterm))}}function X(t,e){1&t&&(b.Tb(0,"mat-icon",24),b.Ec(1,"cancel"),b.Sb())}function W(t,e){if(1&t){const t=b.Ub();b.Tb(0,"mat-chip",22),b.bc("removed",function(){b.uc(t);const o=e.$implicit;return b.fc().removeTag(o)}),b.Ec(1),b.Dc(2,X,2,0,"mat-icon",23),b.Sb()}if(2&t){const t=e.$implicit,o=b.fc();b.lc("selectable",o.selectable)("removable",o.isEditable),b.Cb(1),b.Gc(" ",t," "),b.Cb(1),b.lc("ngIf",o.isEditable)}}function Y(t,e){if(1&t&&(b.Tb(0,"div",25),b.Tb(1,"div",26),b.Tb(2,"mat-form-field",6),b.Tb(3,"mat-label"),b.Ec(4),b.gc(5,"transloco"),b.Sb(),b.Ob(6,"input",27),b.gc(7,"transloco"),b.gc(8,"date"),b.Sb(),b.Sb(),b.Tb(9,"div",26),b.Tb(10,"mat-form-field",6),b.Tb(11,"mat-label"),b.Ec(12),b.gc(13,"transloco"),b.Sb(),b.Ob(14,"input",27),b.gc(15,"transloco"),b.gc(16,"date"),b.Sb(),b.Sb(),b.Sb()),2&t){const t=b.fc();b.Cb(4),b.Fc(b.hc(5,6,"CreatedAt")),b.Cb(2),b.mc("placeholder",b.hc(7,8,"CreatedAt")),b.lc("ngModel",b.ic(8,10,t.currentItem.CreatedAt,"yyyy-M-d HH:mm:ss")),b.Cb(6),b.Fc(b.hc(13,13,"ModifiedAt")),b.Cb(2),b.mc("placeholder",b.hc(15,15,"ModifiedAt")),b.lc("ngModel",b.ic(16,17,t.currentItem.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function Z(t,e){if(1&t){const t=b.Ub();b.Tb(0,"mat-toolbar"),b.Tb(1,"h3"),b.Ec(2),b.gc(3,"transloco"),b.Sb(),b.Ob(4,"div",28),b.Tb(5,"button",29),b.bc("click",function(){return b.uc(t),b.fc().openUploadDialog()}),b.Tb(6,"mat-icon"),b.Ec(7,"file_upload"),b.Sb(),b.Sb(),b.Sb()}2&t&&(b.Cb(2),b.Fc(b.hc(3,1,"Content")))}function tt(t,e){if(1&t){const t=b.Ub();b.Tb(0,"div",26),b.Tb(1,"ngx-monaco-editor",30),b.bc("ngModelChange",function(e){return b.uc(t),b.fc().content=e}),b.Sb(),b.Sb()}if(2&t){const t=b.fc();b.Cb(1),b.lc("options",t.editorOptions)("ngModel",t.content)}}let et=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.uiMode=P.c.Create,this.currentMode="",this.editorOptions={theme:"vs-dark"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[A.g,A.c],this.tags=[],this.arKnowledgeCtgies=[],this.arKnowledgeCtgies=Object(S.y)(),this.itemFormGroup=new r.f({idControl:new r.d({value:null,disabled:!0}),titleControl:new r.d("",r.t.required),ctgyControl:new r.d({value:S.j.Concept}),tagControl:new r.d})}get isDisplayMode(){return this.uiMode===P.c.Display}get isCreateMode(){return this.uiMode===P.c.Create}get isUpdateMode(){return this.uiMode===P.c.Update}get isEditable(){return this.uiMode===P.c.Create||this.uiMode===P.c.Update}ngOnInit(){this.destroyed$=new N.a(1),this.activateRoute.url.subscribe({next:t=>{var e,o;t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=P.c.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=P.c.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=P.c.Display,this.currentMode="Common.Display")),-1!==this.routerID?this.odataService.readKnowledgeItem(this.routerID,this.uiMode===P.c.Update).subscribe({next:t=>{var e,o,i;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("titleControl"))||void 0===o||o.setValue(t.Title),null===(i=this.itemFormGroup.get("ctgyControl"))||void 0===i||i.setValue(+t.ItemCategory),this.content=t.Content,this.tags=t.Tags,this.currentItem=t,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()},error:t=>{console.error(t)}}):(null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue("NEW"),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable(),this.itemFormGroup.markAsPristine(),this.itemFormGroup.markAsUntouched())},error:t=>{console.error(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){var t,e,o,i;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const o=new S.i;o.ItemCategory=null===(t=this.itemFormGroup.get("ctgyControl"))||void 0===t?void 0:t.value,o.Content=this.content,o.Title=null===(e=this.itemFormGroup.get("titleControl"))||void 0===e?void 0:e.value,o.Tags=this.tags,this.odataService.createKnowledgeItem(o).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{console.error(t)}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));this.currentItem&&(this.currentItem.ItemCategory=null===(o=this.itemFormGroup.get("ctgyControl"))||void 0===o?void 0:o.value,this.currentItem.Content=this.content,this.currentItem.Title=null===(i=this.itemFormGroup.get("titleControl"))||void 0===i?void 0:i.value,this.currentItem.Tags=this.tags,this.odataService.changeKnowledgeItem(this.currentItem).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{console.error(t)}}))}}openUploadDialog(){this.dialog.open(j.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onReturnToList(){this.router.navigate(["knowledge-item"])}onCreateNewOne(){this.router.navigate(["knowledge-item","create"])}}return t.\u0275fac=function(e){return new(e||t)(b.Nb(H.a),b.Nb(d.a),b.Nb(d.b),b.Nb(T.b))},t.\u0275cmp=b.Hb({type:t,selectors:[["app-knowledge-item-detail"]],decls:50,vars:38,consts:[[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","#","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],[3,"value",4,"ngFor","ngForOf"],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],["fxLayout","row","class","control-full-width",4,"ngIf"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"value"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(b.Tb(0,"mat-card"),b.Tb(1,"mat-card-header"),b.Tb(2,"mat-card-title"),b.Ec(3),b.gc(4,"transloco"),b.Sb(),b.Tb(5,"mat-card-subtitle"),b.Ec(6),b.gc(7,"transloco"),b.Sb(),b.Sb(),b.Tb(8,"mat-card-content"),b.Tb(9,"form",0),b.Tb(10,"mat-form-field",1),b.Tb(11,"mat-label"),b.Ec(12,"#"),b.Sb(),b.Ob(13,"input",2),b.Sb(),b.Tb(14,"mat-form-field",1),b.Ob(15,"input",3,4),b.gc(17,"transloco"),b.Tb(18,"mat-hint",5),b.Ec(19),b.Sb(),b.Sb(),b.Tb(20,"mat-form-field",6),b.Tb(21,"mat-label"),b.Ec(22),b.gc(23,"transloco"),b.Sb(),b.Tb(24,"mat-select",7),b.Dc(25,J,3,4,"mat-option",8),b.Sb(),b.Sb(),b.Tb(26,"mat-form-field",6),b.Tb(27,"mat-label"),b.Ec(28),b.gc(29,"transloco"),b.Sb(),b.Tb(30,"mat-chip-list",9,10),b.Dc(32,W,3,4,"mat-chip",11),b.Tb(33,"input",12),b.bc("matChipInputTokenEnd",function(t){return e.addTag(t)}),b.Sb(),b.Sb(),b.Sb(),b.Sb(),b.Dc(34,Y,17,20,"div",13),b.Dc(35,Z,8,3,"mat-toolbar",14),b.Tb(36,"div",15),b.Dc(37,tt,2,2,"div",16),b.Tb(38,"div",17),b.Ob(39,"markdown",18),b.Sb(),b.Sb(),b.Sb(),b.Tb(40,"mat-card-actions"),b.Tb(41,"button",19),b.bc("click",function(){return e.onOK()}),b.Ec(42),b.gc(43,"transloco"),b.Sb(),b.Tb(44,"button",20),b.bc("click",function(){return e.onReturnToList()}),b.Ec(45),b.gc(46,"transloco"),b.Sb(),b.Tb(47,"button",19),b.bc("click",function(){return e.onCreateNewOne()}),b.Ec(48),b.gc(49,"transloco"),b.Sb(),b.Sb(),b.Sb()),2&t){const t=b.sc(16),o=b.sc(31);b.Cb(3),b.Fc(b.hc(4,22,"KnowledgeItem")),b.Cb(3),b.Fc(b.hc(7,24,e.currentMode)),b.Cb(3),b.lc("formGroup",e.itemFormGroup),b.Cb(6),b.mc("placeholder",b.hc(17,26,"Title")),b.Cb(4),b.Gc("",t.value.length," / 30"),b.Cb(3),b.Fc(b.hc(23,28,"Category")),b.Cb(3),b.lc("ngForOf",e.arKnowledgeCtgies),b.Cb(3),b.Fc(b.hc(29,30,"Tags")),b.Cb(4),b.lc("ngForOf",e.tags),b.Cb(1),b.lc("matChipInputFor",o)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),b.Cb(1),b.lc("ngIf",!e.isCreateMode&&e.currentItem),b.Cb(1),b.lc("ngIf",e.isCreateMode),b.Cb(2),b.lc("ngIf",!e.isDisplayMode),b.Cb(2),b.lc("data",e.content)("katexOptions",e.mathOptions),b.Cb(2),b.lc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),b.Cb(1),b.Fc(b.hc(43,32,"Save")),b.Cb(3),b.Fc(b.hc(46,34,"Common.ReturnToList")),b.Cb(2),b.lc("disabled",!e.isDisplayMode),b.Cb(1),b.Fc(b.hc(49,36,"Common.CreateAnotherOne"))}},directives:[U.a,U.d,U.g,U.f,U.c,r.u,r.n,r.g,$.c,$.g,_.b,r.c,r.m,r.e,r.s,r.i,$.f,V.a,i.l,z.c,z.b,i.m,B.c,B.a,c.a,U.b,y.b,Q.m,z.a,q.a,z.d,r.p,w.a,n.a],pipes:[a.d,i.e],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}"]}),t})();const ot=[{path:"",component:L},{path:"create",component:et},{path:"display/:id",component:et},{path:"edit/:id",component:et},{path:"search",component:(()=>{class t{constructor(){}ngOnInit(){}}return t.\u0275fac=function(e){return new(e||t)},t.\u0275cmp=b.Hb({type:t,selectors:[["app-knowledge-item-search"]],decls:2,vars:0,template:function(t,e){1&t&&(b.Tb(0,"p"),b.Ec(1,"knowledge-item-search works!"),b.Sb())},styles:[""]}),t})()}];let it=(()=>{class t{}return t.\u0275mod=b.Lb({type:t}),t.\u0275inj=b.Kb({factory:function(e){return new(e||t)},imports:[[d.d.forChild(ot)],d.d]}),t})(),rt=(()=>{class t{}return t.\u0275mod=b.Lb({type:t}),t.\u0275inj=b.Kb({factory:function(e){return new(e||t)},providers:[],imports:[[i.c,r.h,r.r,s.a,l.a,n.b,c.b.forChild(),it,a.c]]}),t})()}}]);