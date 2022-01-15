"use strict";(self.webpackChunkknowledgebuilder=self.webpackChunkknowledgebuilder||[]).push([[652],{1652:(et,C,i)=>{i.r(C),i.d(C,{TagModule:()=>V});var x=i(8583),Z=i(3679),d=i(4043),O=i(6721),c=i(3423),m=i(9692),g=i(1494),y=i(6682),v=i(5917),D=i(9761),R=i(3190),A=i(8002),w=i(5304),l=i(3186),t=i(7716),u=i(984),p=i(3738),s=i(2091),f=i(1095);function U(a,n){1&a&&(t.TgZ(0,"th",11),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Tag")))}function S(a,n){if(1&a&&(t.TgZ(0,"td",12),t._uU(1),t.qZA()),2&a){const e=n.$implicit;t.xp6(1),t.hij(" ",e.TagTerm," ")}}function N(a,n){1&a&&(t.TgZ(0,"th",11),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Type")))}function L(a,n){if(1&a&&(t.TgZ(0,"td",12),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a){const e=n.$implicit,o=t.oxw();t.xp6(1),t.Oqu(t.lcZ(2,1,o.getTagReferenceTypeName(e.RefType)))}}function M(a,n){1&a&&(t.TgZ(0,"th",11),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Count")))}function Y(a,n){if(1&a){const e=t.EpF();t.TgZ(0,"td",12),t.TgZ(1,"a",13),t.NdJ("click",function(){const T=t.CHM(e).$implicit;return t.oxw().onCountClicked(T)}),t._uU(2),t.qZA(),t.qZA()}if(2&a){const e=n.$implicit;t.xp6(2),t.Oqu(e.Count)}}function b(a,n){1&a&&t._UZ(0,"tr",14)}function I(a,n){1&a&&t._UZ(0,"tr",15)}let _=(()=>{class a{constructor(e,o){this.odataService=e,this.router=o,this.displayedColumns=["tag","reftype","count"],this.data=[],this.resultsLength=0,this.isLoadingResults=!1}getTagReferenceTypeName(e){return(0,l.GE)(e)}get isExpertMode(){return this.odataService.isLoggedin}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,y.T)(this.sort.sortChange,this.paginator.page).pipe((0,D.O)({}),(0,R.w)(()=>(this.isLoadingResults=!0,this.odataService.getTagCounts())),(0,A.U)(e=>(this.isLoadingResults=!1,this.resultsLength=e.totalCount,e.items)),(0,w.K)(()=>(this.isLoadingResults=!1,(0,v.of)([])))).subscribe(e=>this.data=e)}onCountClicked(e){this.router.navigate(e.RefType===l.ik.KnowledgeItem?["/tag/displayki",e.TagTerm]:e.RefType===l.ik.ExerciseItem?["/tag/displayei",e.TagTerm]:["/tag/display",e.TagTerm])}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(u.CB),t.Y36(c.F0))},a.\u0275cmp=t.Xpm({type:a,selectors:[["app-tag"]],viewQuery:function(e,o){if(1&e&&(t.Gf(m.NW,5),t.Gf(g.YE,5)),2&e){let r;t.iGM(r=t.CRH())&&(o.paginator=r.first),t.iGM(r=t.CRH())&&(o.sort=r.first)}},decls:21,vars:8,consts:[[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","count"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(e,o){1&e&&(t.TgZ(0,"mat-card"),t.TgZ(1,"mat-card-header"),t.TgZ(2,"mat-card-title"),t._uU(3),t.ALo(4,"transloco"),t.qZA(),t.qZA(),t.TgZ(5,"mat-card-content"),t.TgZ(6,"div",0),t.TgZ(7,"div",1),t.TgZ(8,"table",2),t.ynx(9,3),t.YNc(10,U,3,3,"th",4),t.YNc(11,S,2,1,"td",5),t.BQk(),t.ynx(12,6),t.YNc(13,N,3,3,"th",4),t.YNc(14,L,3,3,"td",5),t.BQk(),t.ynx(15,7),t.YNc(16,M,3,3,"th",4),t.YNc(17,Y,3,1,"td",5),t.BQk(),t.YNc(18,b,1,0,"tr",8),t.YNc(19,I,1,0,"tr",9),t.qZA(),t.qZA(),t._UZ(20,"mat-paginator",10),t.qZA(),t.qZA(),t.qZA()),2&e&&(t.xp6(3),t.Oqu(t.lcZ(4,6,"Tags")),t.xp6(5),t.Q6J("dataSource",o.data),t.xp6(10),t.Q6J("matHeaderRowDef",o.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",o.displayedColumns),t.xp6(1),t.Q6J("length",o.resultsLength)("pageSize",30))},directives:[p.a8,p.dk,p.n5,p.dn,s.BZ,g.YE,s.w1,s.fO,s.Dz,s.as,s.nj,m.NW,s.ge,s.ev,f.zs,s.XQ,s.Gk],pipes:[d.Ot],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),a})();var Q=i(2522),P=i(1769),q=i(4885);function k(a,n){1&a&&t._UZ(0,"mat-progress-spinner")}function z(a,n){if(1&a&&(t.TgZ(0,"div",15),t.YNc(1,k,1,0,"mat-progress-spinner",16),t.qZA()),2&a){const e=t.oxw();t.xp6(1),t.Q6J("ngIf",e.isLoadingResults)}}function E(a,n){1&a&&(t.TgZ(0,"th",17),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Tag")))}function J(a,n){if(1&a&&(t.TgZ(0,"td",18),t._uU(1),t.qZA()),2&a){const e=n.$implicit;t.xp6(1),t.Oqu(e.TagTerm)}}function B(a,n){1&a&&(t.TgZ(0,"th",17),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Type")))}function G(a,n){if(1&a&&(t.TgZ(0,"td",18),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a){const e=n.$implicit,o=t.oxw();t.xp6(1),t.Oqu(t.lcZ(2,1,o.getTagReferenceTypeName(e.RefType)))}}function H(a,n){1&a&&(t.TgZ(0,"th",17),t._uU(1,"Ref. ID"),t.qZA())}function j(a,n){if(1&a){const e=t.EpF();t.TgZ(0,"td",18),t.TgZ(1,"a",19),t.NdJ("click",function(){const T=t.CHM(e).$implicit;return t.oxw().onRefIDClicked(T)}),t._uU(2),t.qZA(),t.qZA()}if(2&a){const e=n.$implicit;t.xp6(2),t.Oqu(e.RefID)}}function $(a,n){1&a&&t._UZ(0,"tr",20)}function F(a,n){1&a&&t._UZ(0,"tr",21)}let h=(()=>{class a{constructor(e,o,r){this.odataService=e,this.activateRoute=o,this.uiUtilSrv=r,this.displayedColumns=["tag","reftype","refid"],this.dataSource=[],this.currenttag="",this.resultsLength=0,this.isLoadingResults=!0,this.refType=void 0,this.getTagReferenceTypeName=l.GE}ngOnInit(){this.activateRoute.url.subscribe({next:e=>{e instanceof Array&&e.length>0&&("display"===e[0].path?(this.currenttag=e[1].path,this.refType=void 0):"displayki"===e[0].path?(this.currenttag=e[1].path,this.refType=l.ik.KnowledgeItem):"displayei"===e[0].path&&(this.currenttag=e[1].path,this.refType=l.ik.ExerciseItem))},error:e=>{console.error(e)}})}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,y.T)(this.sort.sortChange,this.paginator.page).pipe((0,D.O)({}),(0,R.w)(()=>(this.isLoadingResults=!0,this.odataService.getTags(this.currenttag,this.refType))),(0,A.U)(e=>(this.isLoadingResults=!1,this.resultsLength=e.totalCount,e.items)),(0,w.K)(()=>(this.isLoadingResults=!1,(0,v.of)([])))).subscribe(e=>this.dataSource=e)}onRefIDClicked(e){e.RefType===l.ik.ExerciseItem?this.uiUtilSrv.navigateExerciseItemDisplayPage(e.RefID):e.RefType===l.ik.KnowledgeItem&&this.uiUtilSrv.navigateKnowledgeItemDisplayPage(e.RefID)}onGoToPreview(){const e=[];this.dataSource.forEach(o=>{o.RefType&&o.RefID&&e.push({refType:o.RefType,refId:o.RefID})}),this.uiUtilSrv.navigatePreviewPage(e)}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(u.CB),t.Y36(c.gz),t.Y36(u.dM))},a.\u0275cmp=t.Xpm({type:a,selectors:[["app-tag-detail"]],viewQuery:function(e,o){if(1&e&&(t.Gf(m.NW,5),t.Gf(g.YE,5)),2&e){let r;t.iGM(r=t.CRH())&&(o.paginator=r.first),t.iGM(r=t.CRH())&&(o.sort=r.first)}},decls:27,vars:13,consts:[[1,"toolbar-spacer"],[1,"example-button-row"],["mat-raised-button","",3,"click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","refid"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(e,o){1&e&&(t.TgZ(0,"mat-toolbar-row"),t.TgZ(1,"span"),t._uU(2),t.ALo(3,"transloco"),t.qZA(),t._UZ(4,"span",0),t.TgZ(5,"section"),t.TgZ(6,"div",1),t.TgZ(7,"button",2),t.NdJ("click",function(){return o.onGoToPreview()}),t._uU(8),t.ALo(9,"transloco"),t.qZA(),t.qZA(),t.qZA(),t.qZA(),t._UZ(10,"mat-divider"),t.TgZ(11,"div",3),t.YNc(12,z,2,1,"div",4),t.TgZ(13,"div",5),t.TgZ(14,"table",6),t.ynx(15,7),t.YNc(16,E,3,3,"th",8),t.YNc(17,J,2,1,"td",9),t.BQk(),t.ynx(18,10),t.YNc(19,B,3,3,"th",8),t.YNc(20,G,3,3,"td",9),t.BQk(),t.ynx(21,11),t.YNc(22,H,2,0,"th",8),t.YNc(23,j,3,1,"td",9),t.BQk(),t.YNc(24,$,1,0,"tr",12),t.YNc(25,F,1,0,"tr",13),t.qZA(),t.qZA(),t._UZ(26,"mat-paginator",14),t.qZA()),2&e&&(t.xp6(2),t.AsE("",t.lcZ(3,9,"Tag"),": ",o.currenttag,""),t.xp6(6),t.Oqu(t.lcZ(9,11,"Common.Preview")),t.xp6(4),t.Q6J("ngIf",o.isLoadingResults),t.xp6(2),t.Q6J("dataSource",o.dataSource),t.xp6(10),t.Q6J("matHeaderRowDef",o.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",o.displayedColumns),t.xp6(1),t.Q6J("length",o.resultsLength)("pageSize",20))},directives:[Q.rD,f.lW,P.d,x.O5,s.BZ,g.YE,s.w1,s.fO,s.Dz,s.as,s.nj,m.NW,q.Ou,s.ge,s.ev,f.zs,s.XQ,s.Gk],pipes:[d.Ot],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-button-row[_ngcontent-%COMP%]{display:table-cell}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;top:0;left:0;bottom:56px;right:0;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]}),a})();const K=[{path:"",component:_},{path:"display/:content",component:h},{path:"displayki/:content",component:h},{path:"displayei/:content",component:h}];let W=(()=>{class a{}return a.\u0275fac=function(e){return new(e||a)},a.\u0275mod=t.oAB({type:a}),a.\u0275inj=t.cJS({imports:[[c.Bz.forChild(K)],c.Bz]}),a})();var X=i(6715);let V=(()=>{class a{}return a.\u0275fac=function(e){return new(e||a)},a.\u0275mod=t.oAB({type:a}),a.\u0275inj=t.cJS({imports:[[x.ez,Z.u5,Z.UX,O.U,W,X.JP.forChild(),d.y4]]}),a})()}}]);