!function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function n(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{"U+IK":function(t,o,i){"use strict";i.r(o),i.d(o,"KnowledgeItemsModule",function(){return Re});var a=i("ofXK"),c=i("3Pt+"),r=i("0LvA"),l=i("lR5k"),d=i("QPBi"),u=i("jIBr"),b=i("dcRk"),s=i("tyNb"),m=i("fXoL"),p=i("M9IT"),f=i("Dh3D"),h=i("VRyK"),g=i("LRne"),v=i("JX91"),C=i("eIep"),E=i("lJxs"),y=i("JIr8"),w=i("VHTt"),V=i("o0su"),U=i("/t3+"),k=i("bTqV"),F=i("+0xr");function I(e,t){1&e&&(m.Vb(0,"th",16),m.Ec(1,"#"),m.Ub())}function M(e,t){if(1&e){var n=m.Wb();m.Vb(0,"td",17),m.Vb(1,"div"),m.Ec(2),m.Vb(3,"a",18),m.Ec(4),m.ic(5,"transloco"),m.Ub(),m.Vb(6,"a",18),m.Ec(7),m.ic(8,"transloco"),m.Ub(),m.Vb(9,"a",19),m.dc("click",function(){m.wc(n);var e=t.$implicit;return m.hc().onDeleteItem(e.ID)}),m.Ec(10),m.ic(11,"transloco"),m.Ub(),m.Ub(),m.Ub()}if(2&e){var o=t.$implicit,i=m.hc();m.Eb(2),m.Gc(" ",o.ID," "),m.Eb(1),m.pc("routerLink","display/",o.ID,""),m.nc("disabled",!i.isExpertMode),m.Eb(1),m.Fc(m.jc(5,9,"Common.Display")),m.Eb(2),m.pc("routerLink","edit/",o.ID,""),m.nc("disabled",!i.isExpertMode),m.Eb(1),m.Fc(m.jc(8,11,"Common.Change")),m.Eb(2),m.nc("disabled",!i.isExpertMode),m.Eb(1),m.Fc(m.jc(11,13,"Common.Delete"))}}function D(e,t){1&e&&(m.Vb(0,"th",16),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"Category")))}function x(e,t){if(1&e&&(m.Vb(0,"td",17),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e){var n=t.$implicit,o=m.hc();m.Eb(1),m.Fc(m.jc(2,1,o.getKnowledgeItemCategoryName(n.ItemCategory)))}}function j(e,t){1&e&&(m.Vb(0,"th",16),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"Title")))}function O(e,t){if(1&e&&(m.Vb(0,"td",17),m.Ec(1),m.Ub()),2&e){var n=t.$implicit;m.Eb(1),m.Fc(n.Title)}}function S(e,t){1&e&&(m.Vb(0,"th",20),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"CreatedAt")))}function T(e,t){if(1&e&&(m.Vb(0,"td",17),m.Ec(1),m.ic(2,"date"),m.Ub()),2&e){var n=t.$implicit;m.Eb(1),m.Fc(m.kc(2,1,n.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function G(e,t){1&e&&m.Qb(0,"tr",21)}function P(e,t){1&e&&m.Qb(0,"tr",22)}var R,$=((R=function(){function t(n,o){e(this,t),this.odataService=n,this.router=o,this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.isLoadingResults=!0,this.refreshEvent=new m.o}return n(t,[{key:"getKnowledgeItemCategoryName",value:function(e){return Object(w.C)(e)}},{key:"isExpertMode",get:function(){return this.odataService.expertMode}},{key:"ngAfterViewInit",value:function(){var e=this;this.sort.sortChange.subscribe(function(){return e.paginator.pageIndex=0}),Object(h.a)(this.sort.sortChange,this.paginator.page,this.refreshEvent).pipe(Object(v.a)({}),Object(C.a)(function(){e.isLoadingResults=!0;var t=e.paginator.pageSize;return e.odataService.getKnowledgeItems(t,t*e.paginator.pageIndex,e.sort.active,e.sort.direction)}),Object(E.a)(function(t){return e.isLoadingResults=!1,e.resultsLength=t.totalCount,t.items}),Object(y.a)(function(){return e.isLoadingResults=!1,Object(g.a)([])})).subscribe(function(t){return e.dataSource=t})}},{key:"onGoToPreview",value:function(){var e=[];this.dataSource.forEach(function(t){e.push({refType:w.y.KnowledgeItem,refId:t.ID})}),this.odataService.previewObjList=e,this.router.navigate(["preview"])}},{key:"onGoToSearch",value:function(){this.router.navigate(["knowledge-item","search"])}},{key:"onDeleteItem",value:function(e){var t=this;this.odataService.deleteExerciseItem(e).subscribe({next:function(e){t.onRefreshList()},error:function(e){console.error(e)}})}},{key:"onRefreshList",value:function(){this.refreshEvent.emit()}},{key:"resetPaging",value:function(){this.paginator.pageIndex=0}}]),t}()).\u0275fac=function(e){return new(e||R)(m.Pb(V.b),m.Pb(s.b))},R.\u0275cmp=m.Jb({type:R,selectors:[["app-knowledge-items"]],viewQuery:function(e,t){var n;1&e&&(m.Jc(p.a,1),m.Jc(f.a,1)),2&e&&(m.tc(n=m.ec())&&(t.paginator=n.first),m.tc(n=m.ec())&&(t.sort=n.first))},decls:36,vars:24,consts:[[1,"toolbar-spacer"],["mat-stroked-button","","routerLink","create",3,"disabled"],["mat-stroked-button","",3,"disabled","click"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","",1,"example-table",3,"dataSource","matSortChange"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-cell","","mat-sort-header","",4,"matHeaderCellDef"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"disabled","routerLink"],["mat-button","",3,"disabled","click"],["mat-header-cell","","mat-sort-header",""],["mat-header-row",""],["mat-row",""]],template:function(e,t){1&e&&(m.Vb(0,"mat-toolbar-row"),m.Vb(1,"span"),m.Ec(2),m.ic(3,"transloco"),m.Ub(),m.Qb(4,"span",0),m.Vb(5,"section"),m.Vb(6,"a",1),m.Ec(7),m.ic(8,"transloco"),m.Ub(),m.Vb(9,"a",2),m.dc("click",function(){return t.onGoToSearch()}),m.Ec(10),m.ic(11,"transloco"),m.Ub(),m.Vb(12,"a",2),m.dc("click",function(){return t.onGoToPreview()}),m.Ec(13),m.ic(14,"transloco"),m.Ub(),m.Vb(15,"a",2),m.dc("click",function(){return t.onRefreshList()}),m.Ec(16),m.ic(17,"transloco"),m.Ub(),m.Ub(),m.Ub(),m.Vb(18,"div",3),m.Vb(19,"div",4),m.Vb(20,"table",5),m.dc("matSortChange",function(){return t.resetPaging()}),m.Tb(21,6),m.Dc(22,I,2,0,"th",7),m.Dc(23,M,12,15,"td",8),m.Sb(),m.Tb(24,9),m.Dc(25,D,3,3,"th",7),m.Dc(26,x,3,3,"td",8),m.Sb(),m.Tb(27,10),m.Dc(28,j,3,3,"th",7),m.Dc(29,O,2,1,"td",8),m.Sb(),m.Tb(30,11),m.Dc(31,S,3,3,"th",12),m.Dc(32,T,3,4,"td",8),m.Sb(),m.Dc(33,G,1,0,"tr",13),m.Dc(34,P,1,0,"tr",14),m.Ub(),m.Ub(),m.Qb(35,"mat-paginator",15),m.Ub()),2&e&&(m.Eb(2),m.Fc(m.jc(3,14,"KnowledgeItem")),m.Eb(4),m.nc("disabled",!t.isExpertMode),m.Eb(1),m.Fc(m.jc(8,16,"Common.Create")),m.Eb(2),m.nc("disabled",!t.isExpertMode||t.dataSource.length<=0),m.Eb(1),m.Fc(m.jc(11,18,"Common.Search")),m.Eb(2),m.nc("disabled",!t.isExpertMode||t.dataSource.length<=0),m.Eb(1),m.Fc(m.jc(14,20,"Common.Preview")),m.Eb(2),m.nc("disabled",!t.isExpertMode),m.Eb(1),m.Fc(m.jc(17,22,"Common.Refresh")),m.Eb(4),m.nc("dataSource",t.dataSource),m.Eb(13),m.nc("matHeaderRowDef",t.displayedColumns),m.Eb(1),m.nc("matRowDefColumns",t.displayedColumns),m.Eb(1),m.nc("length",t.resultsLength)("pageSize",20))},directives:[U.c,k.a,s.c,F.j,f.a,F.c,F.e,F.b,F.g,F.i,p.a,F.d,F.a,f.b,F.f,F.h],pipes:[d.d,a.e],styles:[".example-spacer[_ngcontent-%COMP%]{flex:1 1 auto}.example-container[_ngcontent-%COMP%]{position:relative;min-height:500px}.example-table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:100px}.mat-column-createdat[_ngcontent-%COMP%]{max-width:124px}"]}),R),L=i("jtHE"),K=i("FtGj"),N=i("rCpU"),A=i("HKRH"),Q=i("0IaG"),_=i("Wp6s"),H=i("kmnG"),z=i("qFsG"),W=i("d3UM"),J=i("A5z7"),q=i("XiUz"),B=i("FKr1"),X=i("NFeN");function Y(e,t){if(1&e&&(m.Vb(0,"mat-option",21),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e){var n=t.$implicit;m.nc("value",n.value),m.Eb(1),m.Fc(m.jc(2,2,n.i18nterm))}}function Z(e,t){1&e&&(m.Vb(0,"mat-icon",24),m.Ec(1,"cancel"),m.Ub())}function ee(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-chip",22),m.dc("removed",function(){m.wc(n);var e=t.$implicit;return m.hc().removeTag(e)}),m.Ec(1),m.Dc(2,Z,2,0,"mat-icon",23),m.Ub()}if(2&e){var o=t.$implicit,i=m.hc();m.nc("selectable",i.selectable)("removable",i.isEditable),m.Eb(1),m.Gc(" ",o," "),m.Eb(1),m.nc("ngIf",i.isEditable)}}function te(e,t){if(1&e&&(m.Vb(0,"div",25),m.Vb(1,"div",26),m.Vb(2,"mat-form-field",6),m.Vb(3,"mat-label"),m.Ec(4),m.ic(5,"transloco"),m.Ub(),m.Qb(6,"input",27),m.ic(7,"transloco"),m.ic(8,"date"),m.Ub(),m.Ub(),m.Vb(9,"div",26),m.Vb(10,"mat-form-field",6),m.Vb(11,"mat-label"),m.Ec(12),m.ic(13,"transloco"),m.Ub(),m.Qb(14,"input",27),m.ic(15,"transloco"),m.ic(16,"date"),m.Ub(),m.Ub(),m.Ub()),2&e){var n=m.hc();m.Eb(4),m.Fc(m.jc(5,6,"CreatedAt")),m.Eb(2),m.oc("placeholder",m.jc(7,8,"CreatedAt")),m.nc("ngModel",m.kc(8,10,n.currentItem.CreatedAt,"yyyy-M-d HH:mm:ss")),m.Eb(6),m.Fc(m.jc(13,13,"ModifiedAt")),m.Eb(2),m.oc("placeholder",m.jc(15,15,"ModifiedAt")),m.nc("ngModel",m.kc(16,17,n.currentItem.ModifiedAt,"yyyy-M-d HH:mm:ss"))}}function ne(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-toolbar"),m.Vb(1,"h3"),m.Ec(2),m.ic(3,"transloco"),m.Ub(),m.Qb(4,"div",28),m.Vb(5,"button",29),m.dc("click",function(){return m.wc(n),m.hc().openUploadDialog()}),m.Vb(6,"mat-icon"),m.Ec(7,"file_upload"),m.Ub(),m.Ub(),m.Ub()}2&e&&(m.Eb(2),m.Fc(m.jc(3,1,"Content")))}function oe(e,t){if(1&e){var n=m.Wb();m.Vb(0,"div",26),m.Vb(1,"ngx-monaco-editor",30),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().content=e}),m.Ub(),m.Ub()}if(2&e){var o=m.hc();m.Eb(1),m.nc("options",o.editorOptions)("ngModel",o.content)}}var ie,ae=((ie=function(){function t(n,o,i,a){e(this,t),this.dialog=n,this.activateRoute=o,this.router=i,this.odataService=a,this.routerID=-1,this.uiMode=N.b.Create,this.currentMode="",this.editorOptions={theme:"vs-dark",wordWrap:"on"},this.content="New Knowledge Item",this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.selectable=!0,this.addOnBlur=!0,this.separatorKeysCodes=[K.g,K.c],this.tags=[],this.arKnowledgeCtgies=[],this.arKnowledgeCtgies=Object(w.D)(),this.itemFormGroup=new c.f({idControl:new c.d({value:null,disabled:!0}),titleControl:new c.d("",c.t.required),ctgyControl:new c.d({value:w.o.Concept}),tagControl:new c.d})}return n(t,[{key:"isDisplayMode",get:function(){return this.uiMode===N.b.Display}},{key:"isCreateMode",get:function(){return this.uiMode===N.b.Create}},{key:"isUpdateMode",get:function(){return this.uiMode===N.b.Update}},{key:"isEditable",get:function(){return this.uiMode===N.b.Create||this.uiMode===N.b.Update}},{key:"ngOnInit",value:function(){var e=this;this.destroyed$=new L.a(1),this.activateRoute.url.subscribe({next:function(t){var n,o;t instanceof Array&&t.length>0&&("create"===t[0].path?(e.routerID=-1,e.uiMode=N.b.Create,e.currentMode="Common.Create"):"edit"===t[0].path?(e.routerID=+t[1].path,e.uiMode=N.b.Update,e.currentMode="Common.Change"):"display"===t[0].path&&(e.routerID=+t[1].path,e.uiMode=N.b.Display,e.currentMode="Common.Display")),-1!==e.routerID?e.odataService.readKnowledgeItem(e.routerID,e.uiMode===N.b.Update).subscribe({next:function(t){var n,o,i;null===(n=e.itemFormGroup.get("idControl"))||void 0===n||n.setValue(t.ID),null===(o=e.itemFormGroup.get("titleControl"))||void 0===o||o.setValue(t.Title),null===(i=e.itemFormGroup.get("ctgyControl"))||void 0===i||i.setValue(+t.ItemCategory),e.content=t.Content,e.tags=t.Tags,e.currentItem=t,e.isDisplayMode?e.itemFormGroup.disable():e.itemFormGroup.markAsPristine()},error:function(e){console.error(e)}}):(null===(n=e.itemFormGroup.get("idControl"))||void 0===n||n.setValue("NEW"),null===(o=e.itemFormGroup.get("idControl"))||void 0===o||o.disable(),e.itemFormGroup.markAsPristine(),e.itemFormGroup.markAsUntouched())},error:function(e){console.error(e)}})}},{key:"ngOnDestroy",value:function(){this.destroyed$&&(this.destroyed$.complete(),this.destroyed$=void 0)}},{key:"onOK",value:function(){var e,t,n,o,i=this;if(this.isCreateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));var a=new w.n;a.ItemCategory=null===(e=this.itemFormGroup.get("ctgyControl"))||void 0===e?void 0:e.value,a.Content=this.content,a.Title=null===(t=this.itemFormGroup.get("titleControl"))||void 0===t?void 0:t.value,a.Tags=this.tags,this.odataService.createKnowledgeItem(a).subscribe({next:function(e){i.router.navigate(["knowledge-item/display",e.ID])},error:function(e){console.error(e)}})}else if(this.isUpdateMode){if(!this.itemFormGroup.valid)return void(this.itemFormGroup.errors&&console.log(this.itemFormGroup.errors));this.currentItem&&(this.currentItem.ItemCategory=null===(n=this.itemFormGroup.get("ctgyControl"))||void 0===n?void 0:n.value,this.currentItem.Content=this.content,this.currentItem.Title=null===(o=this.itemFormGroup.get("titleControl"))||void 0===o?void 0:o.value,this.currentItem.Tags=this.tags,this.odataService.changeKnowledgeItem(this.currentItem).subscribe({next:function(e){i.router.navigate(["knowledge-item/display",e.ID])},error:function(e){console.error(e)}}))}}},{key:"openUploadDialog",value:function(){var e=this;this.dialog.open(A.a,{width:"50%",height:"50%"}).afterClosed().subscribe({next:function(t){console.log(t),t.forEach(function(t){e.content+="\n![Img](".concat(t.url,")\n          ")})}})}},{key:"addTag",value:function(e){var t=e.input,n=e.value;(n||"").trim()&&this.tags.push(n.trim()),t&&(t.value="")}},{key:"removeTag",value:function(e){var t=this.tags.indexOf(e);t>=0&&this.tags.splice(t,1)}},{key:"onReturnToList",value:function(){this.router.navigate(["knowledge-item"])}},{key:"onCreateNewOne",value:function(){this.router.navigate(["knowledge-item","create"])}}]),t}()).\u0275fac=function(e){return new(e||ie)(m.Pb(Q.b),m.Pb(s.a),m.Pb(s.b),m.Pb(V.b))},ie.\u0275cmp=m.Jb({type:ie,selectors:[["app-knowledge-item-detail"]],decls:50,vars:38,consts:[[3,"formGroup"],[1,"control-full-width"],["matInput","","type","text","placeholder","#","formControlName","idControl"],["matInput","","type","text","formControlName","titleControl","required","","name","title","maxlength","30",3,"placeholder"],["title",""],["align","end"],["appearance","fill",1,"control-full-width"],["required","","formControlName","ctgyControl"],[3,"value",4,"ngFor","ngForOf"],["formControlName","tagControl"],["chipList",""],[3,"selectable","removable","removed",4,"ngFor","ngForOf"],["placeholder","New tag...",3,"matChipInputFor","matChipInputSeparatorKeyCodes","matChipInputAddOnBlur","matChipInputTokenEnd"],["fxLayout","row","class","control-full-width",4,"ngIf"],[4,"ngIf"],["fxLayout","row",1,"control-full-width",2,"height","500px"],["fxFlex","50",4,"ngIf"],["fxFlex","",2,"height","100%","overflow-y","scroll"],["katex","",3,"data","katexOptions"],["mat-button","",3,"disabled","click"],["mat-button","",3,"click"],[3,"value"],[3,"selectable","removable","removed"],["matChipRemove","",4,"ngIf"],["matChipRemove",""],["fxLayout","row",1,"control-full-width"],["fxFlex","50"],["matInput","","type","text","disabled","",3,"placeholder","ngModel"],[1,"toolbar-spacer"],["mat-raised-button","",3,"click"],[2,"height","100%",3,"options","ngModel","ngModelChange"]],template:function(e,t){if(1&e&&(m.Vb(0,"mat-card"),m.Vb(1,"mat-card-header"),m.Vb(2,"mat-card-title"),m.Ec(3),m.ic(4,"transloco"),m.Ub(),m.Vb(5,"mat-card-subtitle"),m.Ec(6),m.ic(7,"transloco"),m.Ub(),m.Ub(),m.Vb(8,"mat-card-content"),m.Vb(9,"form",0),m.Vb(10,"mat-form-field",1),m.Vb(11,"mat-label"),m.Ec(12,"#"),m.Ub(),m.Qb(13,"input",2),m.Ub(),m.Vb(14,"mat-form-field",1),m.Qb(15,"input",3,4),m.ic(17,"transloco"),m.Vb(18,"mat-hint",5),m.Ec(19),m.Ub(),m.Ub(),m.Vb(20,"mat-form-field",6),m.Vb(21,"mat-label"),m.Ec(22),m.ic(23,"transloco"),m.Ub(),m.Vb(24,"mat-select",7),m.Dc(25,Y,3,4,"mat-option",8),m.Ub(),m.Ub(),m.Vb(26,"mat-form-field",6),m.Vb(27,"mat-label"),m.Ec(28),m.ic(29,"transloco"),m.Ub(),m.Vb(30,"mat-chip-list",9,10),m.Dc(32,ee,3,4,"mat-chip",11),m.Vb(33,"input",12),m.dc("matChipInputTokenEnd",function(e){return t.addTag(e)}),m.Ub(),m.Ub(),m.Ub(),m.Ub(),m.Dc(34,te,17,20,"div",13),m.Dc(35,ne,8,3,"mat-toolbar",14),m.Vb(36,"div",15),m.Dc(37,oe,2,2,"div",16),m.Vb(38,"div",17),m.Qb(39,"markdown",18),m.Ub(),m.Ub(),m.Ub(),m.Vb(40,"mat-card-actions"),m.Vb(41,"button",19),m.dc("click",function(){return t.onOK()}),m.Ec(42),m.ic(43,"transloco"),m.Ub(),m.Vb(44,"button",20),m.dc("click",function(){return t.onReturnToList()}),m.Ec(45),m.ic(46,"transloco"),m.Ub(),m.Vb(47,"button",19),m.dc("click",function(){return t.onCreateNewOne()}),m.Ec(48),m.ic(49,"transloco"),m.Ub(),m.Ub(),m.Ub()),2&e){var n=m.uc(16),o=m.uc(31);m.Eb(3),m.Fc(m.jc(4,22,"KnowledgeItem")),m.Eb(3),m.Fc(m.jc(7,24,t.currentMode)),m.Eb(3),m.nc("formGroup",t.itemFormGroup),m.Eb(6),m.oc("placeholder",m.jc(17,26,"Title")),m.Eb(4),m.Gc("",n.value.length," / 30"),m.Eb(3),m.Fc(m.jc(23,28,"Category")),m.Eb(3),m.nc("ngForOf",t.arKnowledgeCtgies),m.Eb(3),m.Fc(m.jc(29,30,"Tags")),m.Eb(4),m.nc("ngForOf",t.tags),m.Eb(1),m.nc("matChipInputFor",o)("matChipInputSeparatorKeyCodes",t.separatorKeysCodes)("matChipInputAddOnBlur",t.addOnBlur),m.Eb(1),m.nc("ngIf",!t.isCreateMode&&t.currentItem),m.Eb(1),m.nc("ngIf",t.isCreateMode),m.Eb(2),m.nc("ngIf",!t.isDisplayMode),m.Eb(2),m.nc("data",t.content)("katexOptions",t.mathOptions),m.Eb(2),m.nc("disabled",!(t.isEditable&&t.itemFormGroup.valid)),m.Eb(1),m.Fc(m.jc(43,32,"Save")),m.Eb(3),m.Fc(m.jc(46,34,"Common.ReturnToList")),m.Eb(2),m.nc("disabled",!t.isDisplayMode),m.Eb(1),m.Fc(m.jc(49,36,"Common.CreateAnotherOne"))}},directives:[_.a,_.d,_.g,_.f,_.c,c.u,c.n,c.g,H.c,H.g,z.b,c.c,c.m,c.e,c.s,c.i,H.f,W.a,a.l,J.c,J.b,a.m,q.c,q.a,l.a,_.b,k.b,B.n,J.a,X.a,J.d,c.p,U.a,r.a],pipes:[d.d,a.e],styles:[".example-form[_ngcontent-%COMP%]{margin:8px;min-width:150px;max-width:500px;width:100%}.mat-card-actions[_ngcontent-%COMP%]{margin-top:50px}"]}),ie),ce=i("2Vo4"),re=i("nYR2"),le=i("f0Cb"),de=i("iadO"),ue=i("bSwM"),be=i("pFkP");function se(e,t){if(1&e&&(m.Vb(0,"mat-option",25),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e){var n=t.$implicit;m.nc("value",n.value),m.Eb(1),m.Gc(" ",m.jc(2,2,n.displayas)," ")}}function me(e,t){if(1&e&&(m.Vb(0,"mat-option",25),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e){var n=t.$implicit;m.nc("value",n.value),m.Eb(1),m.Gc(" ",m.jc(2,2,n.i18nterm)," ")}}function pe(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-form-field"),m.Vb(1,"input",26),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[0]=e}),m.ic(2,"transloco"),m.Ub(),m.Ub()}if(2&e){var o=m.hc().$implicit;m.Eb(1),m.oc("placeholder",m.jc(2,2,"Value")),m.nc("ngModel",o.value[0])}}function fe(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-form-field"),m.Vb(1,"input",27),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[1]=e}),m.ic(2,"transloco"),m.Ub(),m.Ub()}if(2&e){var o=m.hc().$implicit;m.Eb(1),m.oc("placeholder",m.jc(2,2,"Value")),m.nc("ngModel",o.value[1])}}function he(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-form-field"),m.Vb(1,"input",28),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[0]=e}),m.ic(2,"transloco"),m.Ub(),m.Ub()}if(2&e){var o=m.hc().$implicit;m.Eb(1),m.oc("placeholder",m.jc(2,2,"Value")),m.nc("ngModel",o.value[0])}}function ge(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-form-field"),m.Vb(1,"input",29),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[0]=e}),m.ic(2,"transloco"),m.Ub(),m.Qb(3,"mat-datepicker-toggle",30),m.Qb(4,"mat-datepicker",null,31),m.Ub()}if(2&e){var o=m.uc(5),i=m.hc().$implicit;m.Eb(1),m.oc("placeholder",m.jc(2,4,"Value")),m.nc("ngModel",i.value[0])("matDatepicker",o),m.Eb(2),m.nc("for",o)}}function ve(e,t){if(1&e){var n=m.Wb();m.Vb(0,"mat-form-field"),m.Vb(1,"input",29),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[1]=e}),m.ic(2,"transloco"),m.Ub(),m.Qb(3,"mat-datepicker-toggle",30),m.Qb(4,"mat-datepicker",null,32),m.Ub()}if(2&e){var o=m.uc(5),i=m.hc().$implicit;m.Eb(1),m.oc("placeholder",m.jc(2,4,"Value")),m.nc("ngModel",i.value[1])("matDatepicker",o),m.Eb(2),m.nc("for",o)}}function Ce(e,t){if(1&e){var n=m.Wb();m.Vb(0,"div",33),m.Vb(1,"mat-checkbox",34),m.dc("ngModelChange",function(e){return m.wc(n),m.hc().$implicit.value[0]=e}),m.Ub(),m.Ub()}if(2&e){var o=m.hc().$implicit;m.Eb(1),m.nc("ngModel",o.value[0])}}function Ee(e,t){if(1&e){var n=m.Wb();m.Vb(0,"div",17),m.Vb(1,"mat-form-field"),m.Vb(2,"mat-select",18),m.dc("ngModelChange",function(e){return t.$implicit.fieldName=e})("selectionChange",function(){m.wc(n);var e=t.$implicit;return m.hc().onFieldSelectionChanged(e)}),m.ic(3,"transloco"),m.Dc(4,se,3,4,"mat-option",19),m.Ub(),m.Ub(),m.Vb(5,"mat-form-field"),m.Vb(6,"mat-select",20),m.dc("ngModelChange",function(e){return t.$implicit.operator=e}),m.ic(7,"transloco"),m.Dc(8,me,3,4,"mat-option",19),m.ic(9,"operatorFilter"),m.Ub(),m.Ub(),m.Dc(10,pe,3,4,"mat-form-field",21),m.Dc(11,fe,3,4,"mat-form-field",21),m.Dc(12,he,3,4,"mat-form-field",21),m.Dc(13,ge,6,6,"mat-form-field",21),m.Dc(14,ve,6,6,"mat-form-field",21),m.Dc(15,Ce,2,1,"div",22),m.Vb(16,"button",23),m.dc("click",function(){return m.wc(n),m.hc().onAddFilter()}),m.Vb(17,"mat-icon"),m.Ec(18,"add"),m.Ub(),m.Ub(),m.Vb(19,"button",24),m.dc("click",function(){m.wc(n);var e=t.index;return m.hc().onRemoveFilter(e)}),m.Vb(20,"mat-icon"),m.Ec(21,"close"),m.Ub(),m.Ub(),m.Ub()}if(2&e){var o=t.$implicit,i=m.hc();m.Eb(2),m.oc("placeholder",m.jc(3,12,"Field")),m.nc("ngModel",o.fieldName),m.Eb(2),m.nc("ngForOf",i.allFields),m.Eb(2),m.oc("placeholder",m.jc(7,14,"Operator")),m.nc("ngModel",o.operator),m.Eb(2),m.nc("ngForOf",m.kc(9,16,i.allOperators,o.valueType)),m.Eb(2),m.nc("ngIf",1===o.valueType),m.Eb(1),m.nc("ngIf",1===o.valueType),m.Eb(1),m.nc("ngIf",2===o.valueType),m.Eb(1),m.nc("ngIf",3===o.valueType),m.Eb(1),m.nc("ngIf",3===o.valueType),m.Eb(1),m.nc("ngIf",4===o.valueType)}}function ye(e,t){1&e&&(m.Vb(0,"th",35),m.Ec(1,"#"),m.Ub())}function we(e,t){if(1&e){var n=m.Wb();m.Vb(0,"td",36),m.Vb(1,"div"),m.Ec(2),m.Vb(3,"a",37),m.dc("click",function(){m.wc(n);var e=t.$implicit;return m.hc().onDisplayItem(e.ID)}),m.Ec(4),m.ic(5,"transloco"),m.Ub(),m.Ub(),m.Ub()}if(2&e){var o=t.$implicit;m.Eb(2),m.Gc(" ",o.ID," "),m.Eb(2),m.Fc(m.jc(5,2,"Common.Display"))}}function Ve(e,t){1&e&&(m.Vb(0,"th",35),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"Category")))}function Ue(e,t){if(1&e&&(m.Vb(0,"td",36),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e){var n=t.$implicit,o=m.hc();m.Eb(1),m.Fc(m.jc(2,1,o.getKnowledgeItemCategoryName(n.ItemCategory)))}}function ke(e,t){1&e&&(m.Vb(0,"th",35),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"Title")))}function Fe(e,t){if(1&e&&(m.Vb(0,"td",36),m.Ec(1),m.Ub()),2&e){var n=t.$implicit;m.Eb(1),m.Fc(n.Title)}}function Ie(e,t){1&e&&(m.Vb(0,"th",35),m.Ec(1),m.ic(2,"transloco"),m.Ub()),2&e&&(m.Eb(1),m.Fc(m.jc(2,1,"CreatedAt")))}function Me(e,t){if(1&e&&(m.Vb(0,"td",36),m.Ec(1),m.ic(2,"date"),m.Ub()),2&e){var n=t.$implicit;m.Eb(1),m.Fc(m.kc(2,1,n.CreatedAt,"yyyy-M-d HH:mm:ss"))}}function De(e,t){1&e&&m.Qb(0,"tr",38)}function xe(e,t){1&e&&m.Qb(0,"tr",39)}var je,Oe,Se,Te=[{path:"",component:$},{path:"create",component:ae},{path:"display/:id",component:ae},{path:"edit/:id",component:ae},{path:"search",component:(je=function(){function t(n,o){e(this,t),this.odataService=n,this.router=o,this.filters=[],this.allOperators=[],this.allFields=[],this.filterEditable=!0,this.pageSize=20,this.pageSizeOptions=[20,40,60,100],this.isLoadingResults=!1,this.subjFilters=new ce.a([]),this.displayedColumns=["id","category","title","createdat"],this.dataSource=[],this.resultsLength=0,this.allOperators=w.z.getGeneralFilterOperatorDisplayStrings(),this.allFields=[{displayas:"Content",value:"Content",valueType:2}]}return n(t,[{key:"ngOnInit",value:function(){this.onAddFilter()}},{key:"ngAfterViewInit",value:function(){var e=this;this.subjFilters.subscribe(function(){return e.paginator.pageIndex=0}),Object(h.a)(this.subjFilters,this.paginator.page).pipe(Object(v.a)({}),Object(C.a)(function(){if(e.subjFilters.value.length<=0)return Object(g.a)([]);e.isLoadingResults=!0;var t=e.prepareFilters(e.subjFilters.value),n=e.paginator.pageSize;return e.odataService.getKnowledgeItems(n,n*e.paginator.pageIndex,void 0,void 0,t)}),Object(re.a)(function(){return e.isLoadingResults=!1}),Object(E.a)(function(t){return e.resultsLength=t.totalCount,t.items}),Object(y.a)(function(){return Object(g.a)(void 0)})).subscribe({next:function(t){return e.dataSource=t},error:function(e){return console.log(e)}})}},{key:"getKnowledgeItemCategoryName",value:function(e){return Object(w.C)(e)}},{key:"onAddFilter",value:function(){this.filters.push(new w.j)}},{key:"onRemoveFilter",value:function(e){this.filters.splice(e,1),0===this.filters.length&&this.onAddFilter()}},{key:"onFieldSelectionChanged",value:function(e){this.allFields.forEach(function(t){t.value===e.fieldName&&(e.valueType=t.valueType)})}},{key:"prepareFilters",value:function(e){var t="";return e.sort(function(e,t){return e.fieldName.localeCompare(t.fieldName)}),e.forEach(function(e){"Content"===e.fieldName&&(e.operator===w.k.Equal?t=t?"".concat(t," and ").concat(e.fieldName," eq '").concat(e.lowValue,"'"):"".concat(e.fieldName," eq '").concat(e.lowValue,"'"):e.operator===w.k.Like&&(t=t?"".concat(t," and contains(").concat(e.fieldName,",'").concat(e.lowValue,"')"):"contains(".concat(e.fieldName,",'").concat(e.lowValue,"')")))}),t}},{key:"onSearch",value:function(){var e=[];this.filters.forEach(function(t){var n={};switch(n.valueType=+t.valueType,t.valueType){case w.l.boolean:case w.l.date:case w.l.number:break;case w.l.string:n.fieldName=t.fieldName,n.operator=+t.operator,n.lowValue=t.value[0],n.highValue=t.operator===w.k.Between?t.value[1]:""}e.push(n)}),this.subjFilters.next(e)}},{key:"onDisplayItem",value:function(e){this.router.navigate(["knowledge-item","display",e.toString()])}},{key:"onGoToPreview",value:function(){var e=[];this.dataSource.forEach(function(t){e.push({refType:w.y.KnowledgeItem,refId:t.ID})}),this.odataService.previewObjList=e,this.router.navigate(["preview"])}}]),t}(),je.\u0275fac=function(e){return new(e||je)(m.Pb(V.b),m.Pb(s.b))},je.\u0275cmp=m.Jb({type:je,selectors:[["app-knowledge-item-search"]],viewQuery:function(e,t){var n;1&e&&m.Jc(p.a,3),2&e&&m.tc(n=m.ec())&&(t.paginator=n.first)},decls:41,vars:18,consts:[["class","demo-full-width",4,"ngFor","ngForOf"],[1,"control-full-width"],["mat-button","","aria-label","Search",3,"click"],[1,"table-container","mat-elevation-z8"],["color","primary"],["mat-flat-button","","color","primary",3,"click"],[1,"table-container"],["mat-table","",1,"mat-elevation-z8",3,"dataSource"],["matColumnDef","id"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","category"],["matColumnDef","title"],["matColumnDef","createdat"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"demo-full-width"],[3,"placeholder","ngModel","ngModelChange","selectionChange"],[3,"value",4,"ngFor","ngForOf"],[3,"placeholder","ngModel","ngModelChange"],[4,"ngIf"],["class","typechkbox",4,"ngIf"],["mat-button","","mat-icon-button","","aria-label","Add",3,"click"],["mat-button","","mat-icon-button","","aria-label","Clear",3,"click"],[3,"value"],["matInput","","type","number","name","lvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","number","name","hvalue_1",3,"placeholder","ngModel","ngModelChange"],["matInput","","type","text","name","lvalue_2",3,"placeholder","ngModel","ngModelChange"],["matInput","",3,"ngModel","matDatepicker","placeholder","ngModelChange"],["matSuffix","",3,"for"],["lvpicker",""],["hvpicker",""],[1,"typechkbox"],[3,"ngModel","ngModelChange"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(e,t){1&e&&(m.Vb(0,"mat-card"),m.Vb(1,"mat-card-header"),m.Vb(2,"mat-card-title"),m.Ec(3),m.ic(4,"transloco"),m.Ub(),m.Vb(5,"mat-card-subtitle"),m.Ec(6),m.ic(7,"transloco"),m.Ub(),m.Ub(),m.Vb(8,"mat-card-content"),m.Vb(9,"div"),m.Dc(10,Ee,22,19,"div",0),m.Vb(11,"div",1),m.Vb(12,"button",2),m.dc("click",function(){return t.onSearch()}),m.Vb(13,"mat-icon"),m.Ec(14,"search"),m.Ub(),m.Ec(15),m.ic(16,"transloco"),m.Ub(),m.Ub(),m.Ub(),m.Qb(17,"mat-divider"),m.Vb(18,"div",3),m.Vb(19,"mat-toolbar",4),m.Vb(20,"mat-toolbar-row"),m.Vb(21,"button",5),m.dc("click",function(){return t.onGoToPreview()}),m.Ec(22),m.ic(23,"transloco"),m.Ub(),m.Ub(),m.Ub(),m.Vb(24,"div",6),m.Vb(25,"table",7),m.Tb(26,8),m.Dc(27,ye,2,0,"th",9),m.Dc(28,we,6,4,"td",10),m.Sb(),m.Tb(29,11),m.Dc(30,Ve,3,3,"th",9),m.Dc(31,Ue,3,3,"td",10),m.Sb(),m.Tb(32,12),m.Dc(33,ke,3,3,"th",9),m.Dc(34,Fe,2,1,"td",10),m.Sb(),m.Tb(35,13),m.Dc(36,Ie,3,3,"th",9),m.Dc(37,Me,3,4,"td",10),m.Sb(),m.Dc(38,De,1,0,"tr",14),m.Dc(39,xe,1,0,"tr",15),m.Ub(),m.Ub(),m.Qb(40,"mat-paginator",16),m.Ub(),m.Ub(),m.Ub()),2&e&&(m.Eb(3),m.Fc(m.jc(4,10,"KnowledgeItem")),m.Eb(3),m.Fc(m.jc(7,12,"Common.Search")),m.Eb(4),m.nc("ngForOf",t.filters),m.Eb(5),m.Gc(" ",m.jc(16,14,"Common.Search")," "),m.Eb(7),m.Fc(m.jc(23,16,"Common.Preview")),m.Eb(3),m.nc("dataSource",t.dataSource),m.Eb(13),m.nc("matHeaderRowDef",t.displayedColumns),m.Eb(1),m.nc("matRowDefColumns",t.displayedColumns),m.Eb(1),m.nc("length",t.resultsLength)("pageSize",20))},directives:[_.a,_.d,_.g,_.f,_.c,a.l,k.b,X.a,le.a,U.a,U.c,F.j,F.c,F.e,F.b,F.g,F.i,p.a,H.c,W.a,c.m,c.p,a.m,B.n,z.b,c.q,c.c,de.d,de.f,H.i,de.c,ue.a,F.d,F.a,k.a,F.f,F.h],pipes:[d.d,be.a,a.e],styles:[".table-container[_ngcontent-%COMP%]{position:relative;min-height:400px;margin-top:16px;overflow:auto}table[_ngcontent-%COMP%]{width:100%;height:100%}.data-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}.mat-column-id[_ngcontent-%COMP%]{max-width:300px;width:250px}.mat-column-itemtype[_ngcontent-%COMP%]{max-width:120px;width:120px}.mat-column-tags[_ngcontent-%COMP%]{max-width:250px;width:150px}.mat-column-created[_ngcontent-%COMP%]{max-width:120px;width:120px}"]}),je)}],Ge=((Oe=function t(){e(this,t)}).\u0275fac=function(e){return new(e||Oe)},Oe.\u0275mod=m.Nb({type:Oe}),Oe.\u0275inj=m.Mb({imports:[[s.d.forChild(Te)],s.d]}),Oe),Pe=i("iasb"),Re=((Se=function t(){e(this,t)}).\u0275fac=function(e){return new(e||Se)},Se.\u0275mod=m.Nb({type:Se}),Se.\u0275inj=m.Mb({providers:[],imports:[[a.c,c.h,c.r,u.a,b.a,r.b,l.b.forChild(),Ge,d.c,Pe.a]]}),Se)}}])}();