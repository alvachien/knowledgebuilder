(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{Bbvb:function(t,e,a){"use strict";a.r(e),a.d(e,"TagModule",function(){return A});var i=a("ofXK"),n=a("3Pt+"),c=a("QPBi"),o=a("jIBr"),r=a("tyNb"),s=a("M9IT"),l=a("Dh3D"),b=a("VRyK"),p=a("LRne"),d=a("JX91"),m=a("eIep"),u=a("lJxs"),f=a("JIr8"),g=a("VHTt"),h=a("fXoL"),y=a("o0su"),R=a("Wp6s"),C=a("+0xr"),T=a("bTqV");function w(t,e){1&t&&(h.Wb(0,"th",11),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t&&(h.Eb(1),h.Gc(h.kc(2,1,"Tag")))}function v(t,e){if(1&t&&(h.Wb(0,"td",12),h.Fc(1),h.Vb()),2&t){const t=e.$implicit;h.Eb(1),h.Hc(" ",t.TagTerm," ")}}function E(t,e){1&t&&(h.Wb(0,"th",11),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t&&(h.Eb(1),h.Gc(h.kc(2,1,"Type")))}function D(t,e){if(1&t&&(h.Wb(0,"td",12),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t){const t=e.$implicit,a=h.ic();h.Eb(1),h.Gc(h.kc(2,1,a.getTagReferenceTypeName(t.RefType)))}}function x(t,e){1&t&&(h.Wb(0,"th",11),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t&&(h.Eb(1),h.Gc(h.kc(2,1,"Count")))}function V(t,e){if(1&t){const t=h.Xb();h.Wb(0,"td",12),h.Wb(1,"a",13),h.ec("click",function(){h.xc(t);const a=e.$implicit;return h.ic().onCountClicked(a)}),h.Fc(2),h.Vb(),h.Vb()}if(2&t){const t=e.$implicit;h.Eb(2),h.Gc(t.Count)}}function I(t,e){1&t&&h.Rb(0,"tr",14)}function W(t,e){1&t&&h.Rb(0,"tr",15)}let j=(()=>{class t{constructor(t,e){this.odataService=t,this.router=e,this.displayedColumns=["tag","reftype","count"],this.data=[],this.resultsLength=0,this.isLoadingResults=!1}getTagReferenceTypeName(t){return Object(g.M)(t)}get isExpertMode(){return this.odataService.expertMode}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(b.a)(this.sort.sortChange,this.paginator.page).pipe(Object(d.a)({}),Object(m.a)(()=>(this.isLoadingResults=!0,this.odataService.getTagCounts())),Object(u.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(f.a)(()=>(this.isLoadingResults=!1,Object(p.a)([])))).subscribe(t=>this.data=t)}onCountClicked(t){this.router.navigate(t.RefType===g.D.KnowledgeItem?["/tag/displayki",t.TagTerm]:t.RefType===g.D.ExerciseItem?["/tag/displayei",t.TagTerm]:["/tag/display",t.TagTerm])}}return t.\u0275fac=function(e){return new(e||t)(h.Qb(y.b),h.Qb(r.b))},t.\u0275cmp=h.Kb({type:t,selectors:[["app-tag"]],viewQuery:function(t,e){if(1&t&&(h.Kc(s.a,1),h.Kc(l.a,1)),2&t){let t;h.uc(t=h.fc())&&(e.paginator=t.first),h.uc(t=h.fc())&&(e.sort=t.first)}},decls:21,vars:8,consts:[[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","count"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(h.Wb(0,"mat-card"),h.Wb(1,"mat-card-header"),h.Wb(2,"mat-card-title"),h.Fc(3),h.jc(4,"transloco"),h.Vb(),h.Vb(),h.Wb(5,"mat-card-content"),h.Wb(6,"div",0),h.Wb(7,"div",1),h.Wb(8,"table",2),h.Ub(9,3),h.Ec(10,w,3,3,"th",4),h.Ec(11,v,2,1,"td",5),h.Tb(),h.Ub(12,6),h.Ec(13,E,3,3,"th",4),h.Ec(14,D,3,3,"td",5),h.Tb(),h.Ub(15,7),h.Ec(16,x,3,3,"th",4),h.Ec(17,V,3,1,"td",5),h.Tb(),h.Ec(18,I,1,0,"tr",8),h.Ec(19,W,1,0,"tr",9),h.Vb(),h.Vb(),h.Rb(20,"mat-paginator",10),h.Vb(),h.Vb(),h.Vb()),2&t&&(h.Eb(3),h.Gc(h.kc(4,6,"Tags")),h.Eb(5),h.oc("dataSource",e.data),h.Eb(10),h.oc("matHeaderRowDef",e.displayedColumns),h.Eb(1),h.oc("matRowDefColumns",e.displayedColumns),h.Eb(1),h.oc("length",e.resultsLength)("pageSize",30))},directives:[R.a,R.d,R.g,R.c,C.j,l.a,C.c,C.e,C.b,C.g,C.i,s.a,C.d,C.a,T.a,C.f,C.h],pipes:[c.d],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),t})();var S=a("/t3+"),k=a("f0Cb"),O=a("Xa2L");function P(t,e){1&t&&h.Rb(0,"mat-progress-spinner")}function L(t,e){if(1&t&&(h.Wb(0,"div",15),h.Ec(1,P,1,0,"mat-progress-spinner",16),h.Vb()),2&t){const t=h.ic();h.Eb(1),h.oc("ngIf",t.isLoadingResults)}}function M(t,e){1&t&&(h.Wb(0,"th",17),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t&&(h.Eb(1),h.Gc(h.kc(2,1,"Tag")))}function F(t,e){if(1&t&&(h.Wb(0,"td",18),h.Fc(1),h.Vb()),2&t){const t=e.$implicit;h.Eb(1),h.Gc(t.TagTerm)}}function G(t,e){1&t&&(h.Wb(0,"th",17),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t&&(h.Eb(1),h.Gc(h.kc(2,1,"Type")))}function K(t,e){if(1&t&&(h.Wb(0,"td",18),h.Fc(1),h.jc(2,"transloco"),h.Vb()),2&t){const t=e.$implicit,a=h.ic();h.Eb(1),h.Gc(h.kc(2,1,a.getTagReferenceTypeName(t.RefType)))}}function _(t,e){1&t&&(h.Wb(0,"th",17),h.Fc(1,"Ref. ID"),h.Vb())}function U(t,e){if(1&t){const t=h.Xb();h.Wb(0,"td",18),h.Wb(1,"a",19),h.ec("click",function(){h.xc(t);const a=e.$implicit;return h.ic().onRefIDClicked(a)}),h.Fc(2),h.Vb(),h.Vb()}if(2&t){const t=e.$implicit;h.Eb(2),h.Gc(t.RefID)}}function z(t,e){1&t&&h.Rb(0,"tr",20)}function H(t,e){1&t&&h.Rb(0,"tr",21)}let Q=(()=>{class t{constructor(t,e,a){this.odataService=t,this.activateRoute=e,this.uiUtilSrv=a,this.displayedColumns=["tag","reftype","refid"],this.dataSource=[],this.currenttag="",this.resultsLength=0,this.isLoadingResults=!0,this.refType=void 0,this.getTagReferenceTypeName=g.M}ngOnInit(){this.activateRoute.url.subscribe({next:t=>{t instanceof Array&&t.length>0&&("display"===t[0].path?(this.currenttag=t[1].path,this.refType=void 0):"displayki"===t[0].path?(this.currenttag=t[1].path,this.refType=g.D.KnowledgeItem):"displayei"===t[0].path&&(this.currenttag=t[1].path,this.refType=g.D.ExerciseItem))},error:t=>{console.error(t)}})}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),Object(b.a)(this.sort.sortChange,this.paginator.page).pipe(Object(d.a)({}),Object(m.a)(()=>(this.isLoadingResults=!0,this.odataService.getTags(this.currenttag,this.refType))),Object(u.a)(t=>(this.isLoadingResults=!1,this.resultsLength=t.totalCount,t.items)),Object(f.a)(()=>(this.isLoadingResults=!1,Object(p.a)([])))).subscribe(t=>this.dataSource=t)}onRefIDClicked(t){t.RefType===g.D.ExerciseItem?this.uiUtilSrv.navigateExerciseItemDisplayPage(t.RefID):t.RefType===g.D.KnowledgeItem&&this.uiUtilSrv.navigateKnowledgeItemDisplayPage(t.RefID)}onGoToPreview(){const t=[];this.dataSource.forEach(e=>{e.RefType&&e.RefID&&t.push({refType:e.RefType,refId:e.RefID})}),this.uiUtilSrv.navigatePreviewPage(t)}}return t.\u0275fac=function(e){return new(e||t)(h.Qb(y.b),h.Qb(r.a),h.Qb(y.d))},t.\u0275cmp=h.Kb({type:t,selectors:[["app-tag-detail"]],viewQuery:function(t,e){if(1&t&&(h.Kc(s.a,1),h.Kc(l.a,1)),2&t){let t;h.uc(t=h.fc())&&(e.paginator=t.first),h.uc(t=h.fc())&&(e.sort=t.first)}},decls:27,vars:13,consts:[[1,"toolbar-spacer"],[1,"example-button-row"],["mat-raised-button","",3,"click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","refid"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(t,e){1&t&&(h.Wb(0,"mat-toolbar-row"),h.Wb(1,"span"),h.Fc(2),h.jc(3,"transloco"),h.Vb(),h.Rb(4,"span",0),h.Wb(5,"section"),h.Wb(6,"div",1),h.Wb(7,"button",2),h.ec("click",function(){return e.onGoToPreview()}),h.Fc(8),h.jc(9,"transloco"),h.Vb(),h.Vb(),h.Vb(),h.Vb(),h.Rb(10,"mat-divider"),h.Wb(11,"div",3),h.Ec(12,L,2,1,"div",4),h.Wb(13,"div",5),h.Wb(14,"table",6),h.Ub(15,7),h.Ec(16,M,3,3,"th",8),h.Ec(17,F,2,1,"td",9),h.Tb(),h.Ub(18,10),h.Ec(19,G,3,3,"th",8),h.Ec(20,K,3,3,"td",9),h.Tb(),h.Ub(21,11),h.Ec(22,_,2,0,"th",8),h.Ec(23,U,3,1,"td",9),h.Tb(),h.Ec(24,z,1,0,"tr",12),h.Ec(25,H,1,0,"tr",13),h.Vb(),h.Vb(),h.Rb(26,"mat-paginator",14),h.Vb()),2&t&&(h.Eb(2),h.Ic("",h.kc(3,9,"Tag"),": ",e.currenttag,""),h.Eb(6),h.Gc(h.kc(9,11,"Common.Preview")),h.Eb(4),h.oc("ngIf",e.isLoadingResults),h.Eb(2),h.oc("dataSource",e.dataSource),h.Eb(10),h.oc("matHeaderRowDef",e.displayedColumns),h.Eb(1),h.oc("matRowDefColumns",e.displayedColumns),h.Eb(1),h.oc("length",e.resultsLength)("pageSize",20))},directives:[S.c,T.b,k.a,i.m,C.j,l.a,C.c,C.e,C.b,C.g,C.i,s.a,O.a,C.d,C.a,T.a,C.f,C.h],pipes:[c.d],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-button-row[_ngcontent-%COMP%]{display:table-cell}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),t})();const $=[{path:"",component:j},{path:"display/:content",component:Q},{path:"displayki/:content",component:Q},{path:"displayei/:content",component:Q}];let N=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=h.Ob({type:t}),t.\u0275inj=h.Nb({imports:[[r.e.forChild($)],r.e]}),t})();var X=a("lR5k");let A=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275mod=h.Ob({type:t}),t.\u0275inj=h.Nb({imports:[[i.c,n.i,n.s,o.a,N,X.b.forChild(),c.c]]}),t})()}}]);