(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{Bbvb:function(t,e,a){"use strict";a.r(e),a.d(e,"TagModule",function(){return G});var i=a("ofXK"),n=a("3Pt+"),c=a("QPBi"),o=a("jIBr"),r=a("tyNb"),s=a("M9IT"),l=a("Dh3D"),b=a("VRyK"),d=a("LRne"),p=a("JX91"),m=a("eIep"),u=a("lJxs"),h=a("JIr8"),g=a("VHTt"),f=a("fXoL"),y=a("o0su"),w=a("Wp6s"),D=a("+0xr"),C=a("Xa2L"),T=a("bTqV");function v(t,e){1&t&&f.Qb(0,"mat-progress-spinner")}function E(t,e){1&t&&(f.Vb(0,"th",13),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t&&(f.Eb(1),f.Fc(f.jc(2,1,"Tag")))}function R(t,e){if(1&t&&(f.Vb(0,"td",14),f.Ec(1),f.Ub()),2&t){const t=e.$implicit;f.Eb(1),f.Gc(" ",t.TagTerm," ")}}function x(t,e){1&t&&(f.Vb(0,"th",13),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t&&(f.Eb(1),f.Fc(f.jc(2,1,"Type")))}function V(t,e){if(1&t&&(f.Vb(0,"td",14),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t){const t=e.$implicit,a=f.hc();f.Eb(1),f.Fc(f.jc(2,1,a.getTagReferenceTypeName(t.RefType)))}}function S(t,e){1&t&&(f.Vb(0,"th",13),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t&&(f.Eb(1),f.Fc(f.jc(2,1,"Count")))}function j(t,e){if(1&t){const t=f.Wb();f.Vb(0,"td",14),f.Vb(1,"a",15),f.dc("click",function(){f.wc(t);const a=e.$implicit;return f.hc().onCountClicked(a)}),f.Ec(2),f.Ub(),f.Ub()}if(2&t){const t=e.$implicit;f.Eb(2),f.Fc(t.Count)}}function U(t,e){1&t&&f.Qb(0,"tr",16)}function I(t,e){1&t&&f.Qb(0,"tr",17)}let O=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["tag","reftype","count"],this.data=[],this.resultsLength=0,this.isLoadingResults=!1}getTagReferenceTypeName(t){return Object(g.E)(t)}get isExpertMode(){return this.odataService.expertMode}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(b.a)(this.sort.sortChange,this.paginator.page).pipe(Object(p.a)({}),Object(m.a)(()=>(this.isLoadingResults=!0,this.odataService.getTagCounts())),Object(u.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(h.a)(()=>(this.isLoadingResults=!1,Object(d.a)([])))).subscribe(t=>this.data=t)}onCountClicked(t){this.router.navigate(t.RefType===g.y.KnowledgeItem?["/tag/displayki",t.TagTerm]:t.RefType===g.y.ExerciseItem?["/tag/displayei",t.TagTerm]:["/tag/display",t.TagTerm])}}return t.\u0275fac=function(e){return new(e||t)(f.Pb(y.b),f.Pb(r.b))},t.\u0275cmp=f.Jb({type:t,selectors:[["app-tag"]],viewQuery:function(t,e){if(1&t&&(f.Jc(s.a,1),f.Jc(l.a,1)),2&t){let t;f.tc(t=f.ec())&&(e.paginator=t.first),f.tc(t=f.ec())&&(e.sort=t.first)}},decls:23,vars:9,consts:[[1,"example-container","mat-elevation-z8"],[1,"example-loading-shade"],[4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","count"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(f.Vb(0,"mat-card"),f.Vb(1,"mat-card-header"),f.Vb(2,"mat-card-title"),f.Ec(3),f.ic(4,"transloco"),f.Ub(),f.Ub(),f.Vb(5,"mat-card-content"),f.Vb(6,"div",0),f.Vb(7,"div",1),f.Dc(8,v,1,0,"mat-progress-spinner",2),f.Ub(),f.Vb(9,"div",3),f.Vb(10,"table",4),f.Tb(11,5),f.Dc(12,E,3,3,"th",6),f.Dc(13,R,2,1,"td",7),f.Sb(),f.Tb(14,8),f.Dc(15,x,3,3,"th",6),f.Dc(16,V,3,3,"td",7),f.Sb(),f.Tb(17,9),f.Dc(18,S,3,3,"th",6),f.Dc(19,j,3,1,"td",7),f.Sb(),f.Dc(20,U,1,0,"tr",10),f.Dc(21,I,1,0,"tr",11),f.Ub(),f.Ub(),f.Qb(22,"mat-paginator",12),f.Ub(),f.Ub(),f.Ub()),2&t&&(f.Eb(3),f.Fc(f.jc(4,7,"Tags")),f.Eb(5),f.nc("ngIf",e.isLoadingResults),f.Eb(2),f.nc("dataSource",e.data),f.Eb(10),f.nc("matHeaderRowDef",e.displayedColumns),f.Eb(1),f.nc("matRowDefColumns",e.displayedColumns),f.Eb(1),f.nc("length",e.resultsLength)("pageSize",30))},directives:[w.a,w.d,w.g,w.c,i.m,D.j,l.a,D.c,D.e,D.b,D.g,D.i,s.a,C.a,D.d,D.a,T.a,D.f,D.h],pipes:[c.d],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),t})();var L=a("/t3+"),P=a("f0Cb");function k(t,e){1&t&&f.Qb(0,"mat-progress-spinner")}function M(t,e){if(1&t&&(f.Vb(0,"div",15),f.Dc(1,k,1,0,"mat-progress-spinner",16),f.Ub()),2&t){const t=f.hc();f.Eb(1),f.nc("ngIf",t.isLoadingResults)}}function Q(t,e){1&t&&(f.Vb(0,"th",17),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t&&(f.Eb(1),f.Fc(f.jc(2,1,"Tag")))}function F(t,e){if(1&t&&(f.Vb(0,"td",18),f.Ec(1),f.Ub()),2&t){const t=e.$implicit;f.Eb(1),f.Fc(t.TagTerm)}}function J(t,e){1&t&&(f.Vb(0,"th",17),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t&&(f.Eb(1),f.Fc(f.jc(2,1,"Type")))}function _(t,e){if(1&t&&(f.Vb(0,"td",18),f.Ec(1),f.ic(2,"transloco"),f.Ub()),2&t){const t=e.$implicit,a=f.hc();f.Eb(1),f.Fc(f.jc(2,1,a.getTagReferenceTypeName(t.RefType)))}}function z(t,e){1&t&&(f.Vb(0,"th",17),f.Ec(1,"Ref. ID"),f.Ub())}function H(t,e){if(1&t){const t=f.Wb();f.Vb(0,"td",18),f.Vb(1,"a",19),f.dc("click",function(){f.wc(t);const a=e.$implicit;return f.hc().onRefIDClicked(a)}),f.Ec(2),f.Ub(),f.Ub()}if(2&t){const t=e.$implicit;f.Eb(2),f.Fc(t.RefID)}}function $(t,e){1&t&&f.Qb(0,"tr",20)}function N(t,e){1&t&&f.Qb(0,"tr",21)}let A=(()=>{class t{constructor(t,e,a){this.odataService=t,this.activateRoute=e,this.router=a,this.displayedColumns=["tag","reftype","refid"],this.dataSource=[],this.currenttag="",this.resultsLength=0,this.isLoadingResults=!0,this.refType=void 0,this.getTagReferenceTypeName=g.E}ngOnInit(){this.activateRoute.url.subscribe({next:t=>{t instanceof Array&&t.length>0&&("display"===t[0].path?(this.currenttag=t[1].path,this.refType=void 0):"displayki"===t[0].path?(this.currenttag=t[1].path,this.refType=g.y.KnowledgeItem):"displayei"===t[0].path&&(this.currenttag=t[1].path,this.refType=g.y.ExerciseItem))},error:t=>{console.error(t)}})}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(b.a)(this.sort.sortChange,this.paginator.page).pipe(Object(p.a)({}),Object(m.a)(()=>(this.isLoadingResults=!0,this.odataService.getTags(this.currenttag,this.refType))),Object(u.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(h.a)(()=>(this.isLoadingResults=!1,Object(d.a)([])))).subscribe(t=>this.dataSource=t)}onRefIDClicked(t){t.RefType===g.y.ExerciseItem?this.router.navigate(["exercise-item/display",t.RefID]):t.RefType===g.y.KnowledgeItem&&this.router.navigate(["knowledge-item/display",t.RefID])}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{e.RefType&&e.RefID&&t.push({refType:e.RefType,refId:e.RefID})}),this.odataService.previewObjList=t,this.router.navigate(["preview"])}}return t.\u0275fac=function(e){return new(e||t)(f.Pb(y.b),f.Pb(r.a),f.Pb(r.b))},t.\u0275cmp=f.Jb({type:t,selectors:[["app-tag-detail"]],viewQuery:function(t,e){if(1&t&&(f.Jc(s.a,1),f.Jc(l.a,1)),2&t){let t;f.tc(t=f.ec())&&(e.paginator=t.first),f.tc(t=f.ec())&&(e.sort=t.first)}},decls:27,vars:13,consts:[[1,"toolbar-spacer"],[1,"example-button-row"],["mat-raised-button","",3,"click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","refid"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(f.Vb(0,"mat-toolbar-row"),f.Vb(1,"span"),f.Ec(2),f.ic(3,"transloco"),f.Ub(),f.Qb(4,"span",0),f.Vb(5,"section"),f.Vb(6,"div",1),f.Vb(7,"button",2),f.dc("click",function(){return e.onGoToPreview()}),f.Ec(8),f.ic(9,"transloco"),f.Ub(),f.Ub(),f.Ub(),f.Ub(),f.Qb(10,"mat-divider"),f.Vb(11,"div",3),f.Dc(12,M,2,1,"div",4),f.Vb(13,"div",5),f.Vb(14,"table",6),f.Tb(15,7),f.Dc(16,Q,3,3,"th",8),f.Dc(17,F,2,1,"td",9),f.Sb(),f.Tb(18,10),f.Dc(19,J,3,3,"th",8),f.Dc(20,_,3,3,"td",9),f.Sb(),f.Tb(21,11),f.Dc(22,z,2,0,"th",8),f.Dc(23,H,3,1,"td",9),f.Sb(),f.Dc(24,$,1,0,"tr",12),f.Dc(25,N,1,0,"tr",13),f.Ub(),f.Ub(),f.Qb(26,"mat-paginator",14),f.Ub()),2&t&&(f.Eb(2),f.Hc("",f.jc(3,9,"Tag"),": ",e.currenttag,""),f.Eb(6),f.Fc(f.jc(9,11,"Common.Preview")),f.Eb(4),f.nc("ngIf",e.isLoadingResults),f.Eb(2),f.nc("dataSource",e.dataSource),f.Eb(10),f.nc("matHeaderRowDef",e.displayedColumns),f.Eb(1),f.nc("matRowDefColumns",e.displayedColumns),f.Eb(1),f.nc("length",e.resultsLength)("pageSize",20))},directives:[L.c,T.b,P.a,i.m,D.j,l.a,D.c,D.e,D.b,D.g,D.i,s.a,C.a,D.d,D.a,T.a,D.f,D.h],pipes:[c.d],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-button-row[_ngcontent-%COMP%]{display:table-cell}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),t})();const K=[{path:"",component:O},{path:"display/:content",component:A},{path:"displayki/:content",component:A},{path:"displayei/:content",component:A}];let X=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=f.Nb({type:t}),t.\u0275inj=f.Mb({imports:[[r.d.forChild(K)],r.d]}),t})();var B=a("lR5k");let G=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=f.Nb({type:t}),t.\u0275inj=f.Mb({imports:[[i.c,n.h,n.r,o.a,X,B.b.forChild(),c.c]]}),t})()}}]);