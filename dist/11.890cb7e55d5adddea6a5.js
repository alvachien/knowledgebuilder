(window.webpackJsonp=window.webpackJsonp||[]).push([[11],{"U+IK":function(t,e,o){"use strict";o.r(e),o.d(e,"KnowledgeItemsModule",function(){return kt});var i=o("ofXK"),c=o("3Pt+"),a=o("0LvA"),n=o("lR5k"),r=o("QPBi"),l=o("jIBr"),s=o("dcRk"),b=o("tyNb"),m=o("fXoL"),d=o("M9IT"),u=o("Dh3D"),h=o("VRyK"),p=o("LRne"),g=o("JX91"),f=o("eIep"),C=o("lJxs"),D=o("JIr8"),v=o("VHTt"),T=o("o0su"),w=o("/t3+"),U=o("bTqV"),y=o("+0xr");function I(t,e){1&t&&(m.Ub(0,"th",17),m.Dc(1,"#"),m.Tb())}function M(t,e){if(1&t){const t=m.Vb();m.Ub(0,"td",18),m.Ub(1,"div"),m.Dc(2),m.Ub(3,"a",19),m.Dc(4),m.hc(5,"transloco"),m.Tb(),m.Ub(6,"a",19),m.Dc(7),m.hc(8,"transloco"),m.Tb(),m.Ub(9,"a",20),m.cc("click",function(){m.vc(t);const o=e.$implicit;return m.gc().onDeleteItem(o.ID)}),m.Dc(10),m.hc(11,"transloco"),m.Tb(),m.Tb(),m.Tb()}if(2&t){const t=e.$implicit;m.Db(2),m.Fc(" ",t.ID," "),m.Db(1),m.oc("routerLink","display/",t.ID,""),m.Db(1),m.Ec(m.ic(5,6,"Common.Display")),m.Db(2),m.oc("routerLink","edit/",t.ID,""),m.Db(1),m.Ec(m.ic(8,8,"Common.Change")),m.Db(3),m.Ec(m.ic(11,10,"Common.Delete"))}}function x(t,e){1&t&&(m.Ub(0,"th",17),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"Category")))}function O(t,e){if(1&t&&(m.Ub(0,"td",18),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t){const t=e.$implicit,o=m.gc();m.Db(1),m.Ec(m.ic(2,1,o.getKnowledgeItemCategoryName(t.ItemCategory)))}}function F(t,e){1&t&&(m.Ub(0,"th",17),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"Title")))}function k(t,e){if(1&t&&(m.Ub(0,"td",18),m.Dc(1),m.Tb()),2&t){const t=e.$implicit;m.Db(1),m.Ec(t.Title)}}function S(t,e){1&t&&(m.Ub(0,"th",21),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"CreatedAt")))}function E(t,e){if(1&t&&(m.Ub(0,"td",18),m.Dc(1),m.hc(2,"date"),m.Tb()),2&t){const t=e.$implicit;m.Db(1),m.Ec(m.jc(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function P(t,e){1&t&&m.Pb(0,"tr",22)}function $(t,e){1&t&&m.Pb(0,"tr",23)}let R=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new m.o}getKnowledgeItemCategoryName(t){return Object(v.x)(t)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe(Object(g.a)({}),Object(f.a)(()=>{this.isLoadingResults=!0;const t=this.paginator.pageSize;return this.odataService.getKnowledgeItems(t,t*this.paginator.pageIndex,this.sort.active,this.sort.direction)}),Object(C.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(D.a)(()=>(this.isLoadingResults=!1,Object(p.a)([])))).subscribe(t=>this.dataSource=t)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:v.t.KnowledgeItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}onGoToSearch(){this.router.navigate(["knowledge-item","search"])}onDeleteItem(t){this.odataService.deleteExerciseItem(t).subscribe({next:t=>{this.onRefreshList()},error:t=>{console.error(t)}})}onRefreshList(){this.refreshEvent.emit()}resetPaging(){this.paginator.pageIndex=0}}return t.\u0275fac=function(e){return new(e||t)(m.Ob(T.b),m.Ob(b.b))},t.\u0275cmp=m.Ib({type:t,selectors:[["app-knowledge-items"]],viewQuery:function(t,e){if(1&t&&(m.Hc(d.a,1),m.Hc(u.a,1)),2&t){let t;m.sc(t=m.dc())&&(e.paginator=t.first),m.sc(t=m.dc())&&(e.sort=t.first)}},decls:36,vars:22,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create"],["mat-stroked-button","",3,"disabled","click"],["mat-stroked-button","",3,"click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"routerLink"],["mat-button","",3,"click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(m.Ub(0,"mat-toolbar-row"),m.Ub(1,"span"),m.Dc(2),m.hc(3,"transloco"),m.Tb(),m.Pb(4,"span",0),m.Ub(5,"section"),m.Ub(6,"a",1),m.Dc(7),m.hc(8,"transloco"),m.Tb(),m.Ub(9,"a",2),m.cc("click",function(){return e.onGoToSearch()}),m.Dc(10),m.hc(11,"transloco"),m.Tb(),m.Ub(12,"a",2),m.cc("click",function(){return e.onGoToPreview()}),m.Dc(13),m.hc(14,"transloco"),m.Tb(),m.Ub(15,"a",3),m.cc("click",function(){return e.onRefreshList()}),m.Dc(16),m.hc(17,"transloco"),m.Tb(),m.Tb(),m.Tb(),m.Ub(18,"div",4),m.Ub(19,"div",5),m.Ub(20,"table",6),m.cc("matSortChange",function(){return e.resetPaging()}),m.Sb(21,7),m.Cc(22,I,2,0,"th",8),m.Cc(23,M,12,12,"td",9),m.Rb(),m.Sb(24,10),m.Cc(25,x,3,3,"th",8),m.Cc(26,O,3,3,"td",9),m.Rb(),m.Sb(27,11),m.Cc(28,F,3,3,"th",8),m.Cc(29,k,2,1,"td",9),m.Rb(),m.Sb(30,12),m.Cc(31,S,3,3,"th",13),m.Cc(32,E,3,4,"td",9),m.Rb(),m.Cc(33,P,1,0,"tr",14),m.Cc(34,$,1,0,"tr",15),m.Tb(),m.Tb(),m.Pb(35,"mat-paginator",16),m.Tb()),2&t&&(m.Db(2),m.Ec(m.ic(3,12,"KnowledgeItem")),m.Db(5),m.Ec(m.ic(8,14,"Common.Create")),m.Db(2),m.mc("disabled",e.dataSource.length<=0),m.Db(1),m.Ec(m.ic(11,16,"Common.Search")),m.Db(2),m.mc("disabled",e.dataSource.length<=0),m.Db(1),m.Ec(m.ic(14,18,"Common.Preview")),m.Db(3),m.Ec(m.ic(17,20,"Common.Refresh")),m.Db(4),m.mc("dataSource",e.dataSource),m.Db(13),m.mc("matHeaderRowDef",e.displayedColumns),m.Db(1),m.mc("matRowDefColumns",e.displayedColumns),m.Db(1),m.mc("length",e.resultsLength)("pageSize",20))},directives:[w.c,U.a,b.c,y.j,u.a,y.c,y.e,y.b,y.g,y.i,d.a,y.d,y.a,u.b,y.f,y.h],pipes:[r.d,i.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),t})();var j=o("jtHE"),G=o("FtGj"),L=o("rCpU"),V=o("HKRH"),K=o("0IaG"),N=o("Wp6s"),A=o("kmnG"),H=o("qFsG"),_=o("d3UM"),z=o("A5z7"),q=o("XiUz"),B=o("FKr1"),J=o("NFeN");function X(t,e){if(1&t&&(m.Ub(0,"mat-option",21),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t){const t=e.$implicit;m.mc("value",t.value),m.Db(1),m.Ec(m.ic(2,2,t.i18nterm))}}function Q(t,e){1&t&&(m.Ub(0,"mat-icon",24),m.Dc(1,"cancel"),m.Tb())}function W(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-chip",22),m.cc("removed",function(){m.vc(t);const o=e.$implicit;return m.gc().removeTag(o)}),m.Dc(1),m.Cc(2,Q,2,0,"mat-icon",23),m.Tb()}if(2&t){const t=e.$implicit,o=m.gc();m.mc("selectable",o.selectable)("removable",o.isEditable),m.Db(1),m.Fc(" ",t," "),m.Db(1),m.mc("ngIf",o.isEditable)}}function Y(t,e){if(1&t&&(m.Ub(0,"div",25),m.Ub(1,"div",26),m.Ub(2,"mat-form-field",6),m.Ub(3,"mat-label"),m.Dc(4),m.hc(5,"transloco"),m.Tb(),m.Pb(6,"input",27),m.hc(7,"transloco"),m.hc(8,"date"),m.Tb(),m.Tb(),m.Ub(9,"div",26),m.Ub(10,"mat-form-field",6),m.Ub(11,"mat-label"),m.Dc(12),m.hc(13,"transloco"),m.Tb(),m.Pb(14,"input",27),m.hc(15,"transloco"),m.hc(16,"date"),m.Tb(),m.Tb(),m.Tb()),2&t){const t=m.gc();m.Db(4),m.Ec(m.ic(5,6,"CreatedAt")),m.Db(2),m.nc("placeholder",m.ic(7,8,"CreatedAt")),m.mc("ngModel",m.jc(8,10,t.currentItem.CreatedAt,"yyyy-M-d HH:mm:ss")),m.Db(6),m.Ec(m.ic(13,13,"ModifiedAt")),m.Db(2),m.nc("placeholder",m.ic(15,15,"ModifiedAt")),m.mc("ngModel",m.jc(16,17,t.currentItem.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function Z(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-toolbar"),m.Ub(1,"h3"),m.Dc(2),m.hc(3,"transloco"),m.Tb(),m.Pb(4,"div",28),m.Ub(5,"button",29),m.cc("click",function(){return m.vc(t),m.gc().openUploadDialog()}),m.Ub(6,"mat-icon"),m.Dc(7,"file_upload"),m.Tb(),m.Tb(),m.Tb()}2&t&&(m.Db(2),m.Ec(m.ic(3,1,"Content")))}function tt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"div",26),m.Ub(1,"ngx-monaco-editor",30),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().content=e}),m.Tb(),m.Tb()}if(2&t){const t=m.gc();m.Db(1),m.mc("options",t.editorOptions)("ngModel",t.content)}}let et=(()=>{class t{constructor(t,e,o,i){this.dialog=t,this.activateRoute=e,this.router=o,this.odataService=i,this.routerID=-1,this.uiMode=L.c.Create,this.currentMode="",this.editorOptions={theme:"vs-dark"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[G.g,G.c],this.tags=[],this.arKnowledgeCtgies=[],this.arKnowledgeCtgies=Object(v.y)(),this.itemFormGroup=new c.f({idControl:new c.d({value:null,disabled:!0}),titleControl:new c.d("",c.t.required),ctgyControl:new c.d({value:v.j.Concept}),tagControl:new c.d})}get isDisplayMode(){return this.uiMode===L.c.Display}get isCreateMode(){return this.uiMode===L.c.Create}get isUpdateMode(){return this.uiMode===L.c.Update}get isEditable(){return this.uiMode===L.c.Create||this.uiMode===L.c.Update}ngOnInit(){this.destroyed$=new j.a(1),this.activateRoute.url.subscribe({next:t=>{var e,o;t instanceof Array&&t.length>0&&("create"===t[0].path?(this.routerID=-1,this.uiMode=L.c.Create,this.currentMode="Common.Create"):"edit"===t[0].path?(this.routerID=+t[1].path,this.uiMode=L.c.Update,this.currentMode="Common.Change"):"display"===t[0].path&&(this.routerID=+t[1].path,this.uiMode=L.c.Display,this.currentMode="Common.Display")),-1!==this.routerID?this.odataService.readKnowledgeItem(this.routerID,this.uiMode===L.c.Update).subscribe({next:t=>{var e,o,i;null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue(t.ID),null===(o=this.itemFormGroup.get("titleControl"))||void 0===o||o.setValue(t.Title),null===(i=this.itemFormGroup.get("ctgyControl"))||void 0===i||i.setValue(+t.ItemCategory),this.content=t.Content,this.tags=t.Tags,this.currentItem=t,this.isDisplayMode?this.itemFormGroup.disable():this.itemFormGroup.markAsPristine()},error:t=>{console.error(t)}}):(null===(e=this.itemFormGroup.get("idControl"))||void 0===e||e.setValue("NEW"),null===(o=this.itemFormGroup.get("idControl"))||void 0===o||o.disable(),this.itemFormGroup.markAsPristine(),this.itemFormGroup.markAsUntouched())},error:t=>{console.error(t)}})}ngOnDestroy(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}onOK(){var t,e,o,i;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));const o=new v.i;o.ItemCategory=null===(t=this.itemFormGroup.get("ctgyControl"))||void 0===t?void 0:t.value,o.Content=this.content,o.Title=null===(e=this.itemFormGroup.get("titleControl"))||void 0===e?void 0:e.value,o.Tags=this.tags,this.odataService.createKnowledgeItem(o).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{console.error(t)}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));this.currentItem&&(this.currentItem.ItemCategory=null===(o=this.itemFormGroup.get("ctgyControl"))||void 0===o?void 0:o.value,this.currentItem.Content=this.content,this.currentItem.Title=null===(i=this.itemFormGroup.get("titleControl"))||void 0===i?void 0:i.value,this.currentItem.Tags=this.tags,this.odataService.changeKnowledgeItem(this.currentItem).subscribe({next:t=>{this.router.navigate(["knowledge-item/display",t.ID])},error:t=>{console.error(t)}}))}}openUploadDialog(){this.dialog.open(V.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:t=>{console.log(t),t.forEach(t=>{this.content+=`\n![Img](${t.url})\n          `})}})}addTag(t){const e=t.input,o=t.value;(o||"").trim()&&this.tags.push(o.trim()),e&&(e.value="")}removeTag(t){const e=this.tags.indexOf(t);e>=0&&this.tags.splice(e,1)}onReturnToList(){this.router.navigate(["knowledge-item"])}onCreateNewOne(){this.router.navigate(["knowledge-item","create"])}}return t.\u0275fac=function(e){return new(e||t)(m.Ob(K.a),m.Ob(b.a),m.Ob(b.b),m.Ob(T.b))},t.\u0275cmp=m.Ib({type:t,selectors:[["app-knowledge-item-detail"]],decls:50,vars:38,consts:[[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","#","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],[3,"value",4,"ngFor","ngForOf"],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],["fxLayout","row","class","control-full-width",4,"ngIf"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"value"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(t,e){if(1&t&&(m.Ub(0,"mat-card"),m.Ub(1,"mat-card-header"),m.Ub(2,"mat-card-title"),m.Dc(3),m.hc(4,"transloco"),m.Tb(),m.Ub(5,"mat-card-subtitle"),m.Dc(6),m.hc(7,"transloco"),m.Tb(),m.Tb(),m.Ub(8,"mat-card-content"),m.Ub(9,"form",0),m.Ub(10,"mat-form-field",1),m.Ub(11,"mat-label"),m.Dc(12,"#"),m.Tb(),m.Pb(13,"input",2),m.Tb(),m.Ub(14,"mat-form-field",1),m.Pb(15,"input",3,4),m.hc(17,"transloco"),m.Ub(18,"mat-hint",5),m.Dc(19),m.Tb(),m.Tb(),m.Ub(20,"mat-form-field",6),m.Ub(21,"mat-label"),m.Dc(22),m.hc(23,"transloco"),m.Tb(),m.Ub(24,"mat-select",7),m.Cc(25,X,3,4,"mat-option",8),m.Tb(),m.Tb(),m.Ub(26,"mat-form-field",6),m.Ub(27,"mat-label"),m.Dc(28),m.hc(29,"transloco"),m.Tb(),m.Ub(30,"mat-chip-list",9,10),m.Cc(32,W,3,4,"mat-chip",11),m.Ub(33,"input",12),m.cc("matChipInputTokenEnd",function(t){return e.addTag(t)}),m.Tb(),m.Tb(),m.Tb(),m.Tb(),m.Cc(34,Y,17,20,"div",13),m.Cc(35,Z,8,3,"mat-toolbar",14),m.Ub(36,"div",15),m.Cc(37,tt,2,2,"div",16),m.Ub(38,"div",17),m.Pb(39,"markdown",18),m.Tb(),m.Tb(),m.Tb(),m.Ub(40,"mat-card-actions"),m.Ub(41,"button",19),m.cc("click",function(){return e.onOK()}),m.Dc(42),m.hc(43,"transloco"),m.Tb(),m.Ub(44,"button",20),m.cc("click",function(){return e.onReturnToList()}),m.Dc(45),m.hc(46,"transloco"),m.Tb(),m.Ub(47,"button",19),m.cc("click",function(){return e.onCreateNewOne()}),m.Dc(48),m.hc(49,"transloco"),m.Tb(),m.Tb(),m.Tb()),2&t){const t=m.tc(16),o=m.tc(31);m.Db(3),m.Ec(m.ic(4,22,"KnowledgeItem")),m.Db(3),m.Ec(m.ic(7,24,e.currentMode)),m.Db(3),m.mc("formGroup",e.itemFormGroup),m.Db(6),m.nc("placeholder",m.ic(17,26,"Title")),m.Db(4),m.Fc("",t.value.length," / 30"),m.Db(3),m.Ec(m.ic(23,28,"Category")),m.Db(3),m.mc("ngForOf",e.arKnowledgeCtgies),m.Db(3),m.Ec(m.ic(29,30,"Tags")),m.Db(4),m.mc("ngForOf",e.tags),m.Db(1),m.mc("matChipInputFor",o)("matChipInputSeparatorKeyCodes",e.separatorKeysCodes)("matChipInputAddOnBlur",e.addOnBlur),m.Db(1),m.mc("ngIf",!e.isCreateMode&&e.currentItem),m.Db(1),m.mc("ngIf",e.isCreateMode),m.Db(2),m.mc("ngIf",!e.isDisplayMode),m.Db(2),m.mc("data",e.content)("katexOptions",e.mathOptions),m.Db(2),m.mc("disabled",!(e.isEditable&&e.itemFormGroup.valid)),m.Db(1),m.Ec(m.ic(43,32,"Save")),m.Db(3),m.Ec(m.ic(46,34,"Common.ReturnToList")),m.Db(2),m.mc("disabled",!e.isDisplayMode),m.Db(1),m.Ec(m.ic(49,36,"Common.CreateAnotherOne"))}},directives:[N.a,N.d,N.g,N.f,N.c,c.u,c.n,c.g,A.c,A.g,H.b,c.c,c.m,c.e,c.s,c.i,A.f,_.a,i.l,z.c,z.b,i.m,q.c,q.a,n.a,N.b,U.b,B.m,z.a,J.a,z.d,c.p,w.a,a.a],pipes:[r.d,i.e],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}"]}),t})();var ot=o("2Vo4"),it=o("nYR2"),ct=o("f0Cb"),at=o("iadO"),nt=o("bSwM"),rt=o("pFkP");function lt(t,e){if(1&t&&(m.Ub(0,"mat-option",25),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t){const t=e.$implicit;m.mc("value",t.value),m.Db(1),m.Fc(" ",m.ic(2,2,t.displayas)," ")}}function st(t,e){if(1&t&&(m.Ub(0,"mat-option",25),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t){const t=e.$implicit;m.mc("value",t.value),m.Db(1),m.Fc(" ",m.ic(2,2,t.i18nterm)," ")}}function bt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-form-field"),m.Ub(1,"input",26),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[0]=e}),m.hc(2,"transloco"),m.Tb(),m.Tb()}if(2&t){const t=m.gc().$implicit;m.Db(1),m.nc("placeholder",m.ic(2,2,"Value")),m.mc("ngModel",t.value[0])}}function mt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-form-field"),m.Ub(1,"input",27),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[1]=e}),m.hc(2,"transloco"),m.Tb(),m.Tb()}if(2&t){const t=m.gc().$implicit;m.Db(1),m.nc("placeholder",m.ic(2,2,"Value")),m.mc("ngModel",t.value[1])}}function dt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-form-field"),m.Ub(1,"input",28),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[0]=e}),m.hc(2,"transloco"),m.Tb(),m.Tb()}if(2&t){const t=m.gc().$implicit;m.Db(1),m.nc("placeholder",m.ic(2,2,"Value")),m.mc("ngModel",t.value[0])}}function ut(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-form-field"),m.Ub(1,"input",29),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[0]=e}),m.hc(2,"transloco"),m.Tb(),m.Pb(3,"mat-datepicker-toggle",30),m.Pb(4,"mat-datepicker",null,31),m.Tb()}if(2&t){const t=m.tc(5),e=m.gc().$implicit;m.Db(1),m.nc("placeholder",m.ic(2,4,"Value")),m.mc("ngModel",e.value[0])("matDatepicker",t),m.Db(2),m.mc("for",t)}}function ht(t,e){if(1&t){const t=m.Vb();m.Ub(0,"mat-form-field"),m.Ub(1,"input",29),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[1]=e}),m.hc(2,"transloco"),m.Tb(),m.Pb(3,"mat-datepicker-toggle",30),m.Pb(4,"mat-datepicker",null,32),m.Tb()}if(2&t){const t=m.tc(5),e=m.gc().$implicit;m.Db(1),m.nc("placeholder",m.ic(2,4,"Value")),m.mc("ngModel",e.value[1])("matDatepicker",t),m.Db(2),m.mc("for",t)}}function pt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"div",33),m.Ub(1,"mat-checkbox",34),m.cc("ngModelChange",function(e){return m.vc(t),m.gc().$implicit.value[0]=e}),m.Tb(),m.Tb()}if(2&t){const t=m.gc().$implicit;m.Db(1),m.mc("ngModel",t.value[0])}}function gt(t,e){if(1&t){const t=m.Vb();m.Ub(0,"div",17),m.Ub(1,"mat-form-field"),m.Ub(2,"mat-select",18),m.cc("ngModelChange",function(t){return e.$implicit.fieldName=t})("selectionChange",function(){m.vc(t);const o=e.$implicit;return m.gc().onFieldSelectionChanged(o)}),m.hc(3,"transloco"),m.Cc(4,lt,3,4,"mat-option",19),m.Tb(),m.Tb(),m.Ub(5,"mat-form-field"),m.Ub(6,"mat-select",20),m.cc("ngModelChange",function(t){return e.$implicit.operator=t}),m.hc(7,"transloco"),m.Cc(8,st,3,4,"mat-option",19),m.hc(9,"operatorFilter"),m.Tb(),m.Tb(),m.Cc(10,bt,3,4,"mat-form-field",21),m.Cc(11,mt,3,4,"mat-form-field",21),m.Cc(12,dt,3,4,"mat-form-field",21),m.Cc(13,ut,6,6,"mat-form-field",21),m.Cc(14,ht,6,6,"mat-form-field",21),m.Cc(15,pt,2,1,"div",22),m.Ub(16,"button",23),m.cc("click",function(){return m.vc(t),m.gc().onAddFilter()}),m.Ub(17,"mat-icon"),m.Dc(18,"add"),m.Tb(),m.Tb(),m.Ub(19,"button",24),m.cc("click",function(){m.vc(t);const o=e.index;return m.gc().onRemoveFilter(o)}),m.Ub(20,"mat-icon"),m.Dc(21,"close"),m.Tb(),m.Tb(),m.Tb()}if(2&t){const t=e.$implicit,o=m.gc();m.Db(2),m.nc("placeholder",m.ic(3,12,"Field")),m.mc("ngModel",t.fieldName),m.Db(2),m.mc("ngForOf",o.allFields),m.Db(2),m.nc("placeholder",m.ic(7,14,"Operator")),m.mc("ngModel",t.operator),m.Db(2),m.mc("ngForOf",m.jc(9,16,o.allOperators,t.valueType)),m.Db(2),m.mc("ngIf",1===t.valueType),m.Db(1),m.mc("ngIf",1===t.valueType),m.Db(1),m.mc("ngIf",2===t.valueType),m.Db(1),m.mc("ngIf",3===t.valueType),m.Db(1),m.mc("ngIf",3===t.valueType),m.Db(1),m.mc("ngIf",4===t.valueType)}}function ft(t,e){1&t&&(m.Ub(0,"th",35),m.Dc(1,"#"),m.Tb())}function Ct(t,e){if(1&t){const t=m.Vb();m.Ub(0,"td",36),m.Ub(1,"div"),m.Dc(2),m.Ub(3,"a",37),m.cc("click",function(){m.vc(t);const o=e.$implicit;return m.gc().onDisplayItem(o.ID)}),m.Dc(4),m.hc(5,"transloco"),m.Tb(),m.Tb(),m.Tb()}if(2&t){const t=e.$implicit;m.Db(2),m.Fc(" ",t.ID," "),m.Db(2),m.Ec(m.ic(5,2,"Common.Display"))}}function Dt(t,e){1&t&&(m.Ub(0,"th",35),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"Category")))}function vt(t,e){if(1&t&&(m.Ub(0,"td",36),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t){const t=e.$implicit,o=m.gc();m.Db(1),m.Ec(m.ic(2,1,o.getKnowledgeItemCategoryName(t.ItemCategory)))}}function Tt(t,e){1&t&&(m.Ub(0,"th",35),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"Title")))}function wt(t,e){if(1&t&&(m.Ub(0,"td",36),m.Dc(1),m.Tb()),2&t){const t=e.$implicit;m.Db(1),m.Ec(t.Title)}}function Ut(t,e){1&t&&(m.Ub(0,"th",35),m.Dc(1),m.hc(2,"transloco"),m.Tb()),2&t&&(m.Db(1),m.Ec(m.ic(2,1,"CreatedAt")))}function yt(t,e){if(1&t&&(m.Ub(0,"td",36),m.Dc(1),m.hc(2,"date"),m.Tb()),2&t){const t=e.$implicit;m.Db(1),m.Ec(m.jc(2,1,t.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function It(t,e){1&t&&m.Pb(0,"tr",38)}function Mt(t,e){1&t&&m.Pb(0,"tr",39)}const xt=[{path:"",component:R},{path:"create",component:et},{path:"display/:id",component:et},{path:"edit/:id",component:et},{path:"search",component:(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.filters=[],this.allOperators=[],this.allFields=[],this.filterEditable=!0,this.pageSize=20,this.pageSizeOptions=[20,40,60,100],this.isLoadingResults=!1,this.subjFilters=new ot.a([]),this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.allOperators=v.u.getGeneralFilterOperatorDisplayStrings(),this.allFields=[{displayas:"Content",value:"Content",valueType:2}]}ngOnInit(){this.onAddFilter()}ngAfterViewInit(){this.subjFilters.subscribe(()=>this.paginator.pageIndex=0),Object(h.a)(this.subjFilters,this.paginator.page).pipe(Object(g.a)({}),Object(f.a)(()=>{if(this.subjFilters.value.length<=0)return Object(p.a)([]);this.isLoadingResults=!0;const t=this.prepareFilters(this.subjFilters.value),e=this.paginator.pageSize;return this.odataService.getKnowledgeItems(e,e*this.paginator.pageIndex,void 0,void 0,t)}),Object(it.a)(()=>this.isLoadingResults=!1),Object(C.a)(t=>(this.resultsLength=t.totalCount,t.items)),Object(D.a)(()=>Object(p.a)(void 0))).subscribe({next:t=>this.dataSource=t,error:t=>console.log(t)})}getKnowledgeItemCategoryName(t){return Object(v.x)(t)}onAddFilter(){this.filters.push(new v.e)}onRemoveFilter(t){this.filters.splice(t,1),0===this.filters.length&&this.onAddFilter()}onFieldSelectionChanged(t){this.allFields.forEach(e=>{e.value===t.fieldName&&(t.valueType=e.valueType)})}prepareFilters(t){let e="";return t.sort((t,e)=>t.fieldName.localeCompare(e.fieldName)),t.forEach(t=>{"Content"===t.fieldName&&(t.operator===v.f.Equal?e=e?`${e} and ${t.fieldName} eq '${t.lowValue}'`:`${t.fieldName} eq '${t.lowValue}'`:t.operator===v.f.Like&&(e=e?`${e} and contains(${t.fieldName},'${t.lowValue}')`:`contains(${t.fieldName},'${t.lowValue}')`))}),e}onSearch(){const t=[];this.filters.forEach(e=>{const o={};switch(o.valueType=+e.valueType,e.valueType){case v.g.boolean:case v.g.date:case v.g.number:break;case v.g.string:o.fieldName=e.fieldName,o.operator=+e.operator,o.lowValue=e.value[0],o.highValue=e.operator===v.f.Between?e.value[1]:""}t.push(o)}),this.subjFilters.next(t)}onDisplayItem(t){this.router.navigate(["knowledge-item","display",t.toString()])}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{t.push({refType:v.t.KnowledgeItem,refId:e.ID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}}return t.\u0275fac=function(e){return new(e||t)(m.Ob(T.b),m.Ob(b.b))},t.\u0275cmp=m.Ib({type:t,selectors:[["app-knowledge-item-search"]],viewQuery:function(t,e){if(1&t&&m.Hc(d.a,3),2&t){let t;m.sc(t=m.dc())&&(e.paginator=t.first)}},decls:41,vars:18,consts:[["class","demo-full-width",4,"ngFor","ngForOf"],[1,"control-full-width"],["mat-button","","aria-label","Search",3,"click"],[1,"table-container","mat-elevation-z8"],["color","primary"],["mat-flat-button","","color","primary",3,"click"],[1,"table-container"],["mat-table","",1,"mat-elevation-z8",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"demo-full-width"],[3,"placeholder","ngModel","ngModelChange","selectionChange"],[3,"value",4,"ngFor","ngForOf"],[3,"placeholder","ngModel","ngModelChange"],[4,"ngIf"],["class","typechkbox",4,"ngIf"],["mat-button","","mat-icon-button","","aria-label","Add",3,"click"],["mat-button","","mat-icon-button","","aria-label","Clear",3,"click"],[3,"value"],["matInput","","type","number","name","lvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","number","name","hvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","text","name","lvalue_2",3,"placeholder","ngModel","ngModelChange"],["matInput","",3,"ngModel","matDatepicker","placeholder","ngModelChange"],["matSuffix","",3,"for"],["lvpicker",""],["hvpicker",""],[1,"typechkbox"],[3,"ngModel","ngModelChange"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(m.Ub(0,"mat-card"),m.Ub(1,"mat-card-header"),m.Ub(2,"mat-card-title"),m.Dc(3),m.hc(4,"transloco"),m.Tb(),m.Ub(5,"mat-card-subtitle"),m.Dc(6),m.hc(7,"transloco"),m.Tb(),m.Tb(),m.Ub(8,"mat-card-content"),m.Ub(9,"div"),m.Cc(10,gt,22,19,"div",0),m.Ub(11,"div",1),m.Ub(12,"button",2),m.cc("click",function(){return e.onSearch()}),m.Ub(13,"mat-icon"),m.Dc(14,"search"),m.Tb(),m.Dc(15),m.hc(16,"transloco"),m.Tb(),m.Tb(),m.Tb(),m.Pb(17,"mat-divider"),m.Ub(18,"div",3),m.Ub(19,"mat-toolbar",4),m.Ub(20,"mat-toolbar-row"),m.Ub(21,"button",5),m.cc("click",function(){return e.onGoToPreview()}),m.Dc(22),m.hc(23,"transloco"),m.Tb(),m.Tb(),m.Tb(),m.Ub(24,"div",6),m.Ub(25,"table",7),m.Sb(26,8),m.Cc(27,ft,2,0,"th",9),m.Cc(28,Ct,6,4,"td",10),m.Rb(),m.Sb(29,11),m.Cc(30,Dt,3,3,"th",9),m.Cc(31,vt,3,3,"td",10),m.Rb(),m.Sb(32,12),m.Cc(33,Tt,3,3,"th",9),m.Cc(34,wt,2,1,"td",10),m.Rb(),m.Sb(35,13),m.Cc(36,Ut,3,3,"th",9),m.Cc(37,yt,3,4,"td",10),m.Rb(),m.Cc(38,It,1,0,"tr",14),m.Cc(39,Mt,1,0,"tr",15),m.Tb(),m.Tb(),m.Pb(40,"mat-paginator",16),m.Tb(),m.Tb(),m.Tb()),2&t&&(m.Db(3),m.Ec(m.ic(4,10,"KnowledgeItem")),m.Db(3),m.Ec(m.ic(7,12,"Common.Search")),m.Db(4),m.mc("ngForOf",e.filters),m.Db(5),m.Fc(" ",m.ic(16,14,"Common.Search")," "),m.Db(7),m.Ec(m.ic(23,16,"Common.Preview")),m.Db(3),m.mc("dataSource",e.dataSource),m.Db(13),m.mc("matHeaderRowDef",e.displayedColumns),m.Db(1),m.mc("matRowDefColumns",e.displayedColumns),m.Db(1),m.mc("length",e.resultsLength)("pageSize",20))},directives:[N.a,N.d,N.g,N.f,N.c,i.l,U.b,J.a,ct.a,w.a,w.c,y.j,y.c,y.e,y.b,y.g,y.i,d.a,A.c,_.a,c.m,c.p,i.m,B.m,H.b,c.q,c.c,at.b,at.d,A.i,at.a,nt.a,y.d,y.a,U.a,y.f,y.h],pipes:[r.d,rt.a,i.e],styles:[".table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;margin-top:16px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.data-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}"]}),t})()}];let Ot=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=m.Mb({type:t}),t.\u0275inj=m.Lb({imports:[[b.d.forChild(xt)],b.d]}),t})();var Ft=o("iasb");let kt=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=m.Mb({type:t}),t.\u0275inj=m.Lb({providers:[],imports:[[i.c,c.h,c.r,l.a,s.a,a.b,n.b.forChild(),Ot,r.c,Ft.a]]}),t})()}}]);