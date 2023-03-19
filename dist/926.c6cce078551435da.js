"use strict";(self.webpackChunkknowledgebuilder=self.webpackChunkknowledgebuilder||[]).push([[926],{6926:(et,v,o)=>{o.r(v),o.d(v,{TagModule:()=>m});var Z=o(6895),D=o(4006),h=o(1525),N=o(6127),g=o(9132),d=o(8739),u=o(6308),R=o(6451),A=o(9646),w=o(8675),O=o(3900),U=o(4004),S=o(262),r=o(2701),t=o(4650),T=o(410),C=o(4859),f=o(3546),i=o(3626);function Y(a,e){1&a&&(t.TgZ(0,"th",12),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Tag")))}function I(a,e){if(1&a&&(t.TgZ(0,"td",13),t._uU(1),t.qZA()),2&a){const n=e.$implicit;t.xp6(1),t.hij(" ",n.TagTerm," ")}}function L(a,e){1&a&&(t.TgZ(0,"th",12),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Type")))}function b(a,e){if(1&a&&(t.TgZ(0,"td",13),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a){const n=e.$implicit,s=t.oxw();t.xp6(1),t.Oqu(t.lcZ(2,1,s.getTagReferenceTypeName(n.RefType)))}}function M(a,e){1&a&&(t.TgZ(0,"th",12),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Count")))}function Q(a,e){if(1&a){const n=t.EpF();t.TgZ(0,"td",13)(1,"a",14),t.NdJ("click",function(){const x=t.CHM(n).$implicit,y=t.oxw();return t.KtG(y.onCountClicked(x))}),t._uU(2),t.qZA()()}if(2&a){const n=e.$implicit;t.xp6(2),t.Oqu(n.Count)}}function _(a,e){1&a&&t._UZ(0,"tr",15)}function P(a,e){1&a&&t._UZ(0,"tr",16)}class p{constructor(e,n){this.odataService=e,this.router=n,this.displayedColumns=["tag","reftype","count"],this.data=[],this.resultsLength=0,this.isLoadingResults=!1}getTagReferenceTypeName(e){return(0,r.GE)(e)}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,R.T)(this.sort.sortChange,this.paginator.page).pipe((0,w.O)({}),(0,O.w)(()=>(this.isLoadingResults=!0,this.odataService.getTagCounts())),(0,U.U)(e=>(this.isLoadingResults=!1,this.resultsLength=e.totalCount,e.items)),(0,S.K)(()=>(this.isLoadingResults=!1,(0,A.of)([])))).subscribe(e=>this.data=e)}onCountClicked(e){this.router.navigate(e.RefType===r.ik.KnowledgeItem?["/tag/displayki",e.TagTerm]:e.RefType===r.ik.ExerciseItem?["/tag/displayei",e.TagTerm]:["/tag/display",e.TagTerm])}}p.\u0275fac=function(e){return new(e||p)(t.Y36(T.CB),t.Y36(g.F0))},p.\u0275cmp=t.Xpm({type:p,selectors:[["app-tag"]],viewQuery:function(e,n){if(1&e&&(t.Gf(d.NW,5),t.Gf(u.YE,5)),2&e){let s;t.iGM(s=t.CRH())&&(n.paginator=s.first),t.iGM(s=t.CRH())&&(n.sort=s.first)}},decls:21,vars:8,consts:[["appearance","outlined"],[1,"example-container","mat-elevation-z8"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","count"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(e,n){1&e&&(t.TgZ(0,"mat-card",0)(1,"mat-card-header")(2,"mat-card-title"),t._uU(3),t.ALo(4,"transloco"),t.qZA()(),t.TgZ(5,"mat-card-content")(6,"div",1)(7,"div",2)(8,"table",3),t.ynx(9,4),t.YNc(10,Y,3,3,"th",5),t.YNc(11,I,2,1,"td",6),t.BQk(),t.ynx(12,7),t.YNc(13,L,3,3,"th",5),t.YNc(14,b,3,3,"td",6),t.BQk(),t.ynx(15,8),t.YNc(16,M,3,3,"th",5),t.YNc(17,Q,3,1,"td",6),t.BQk(),t.YNc(18,_,1,0,"tr",9),t.YNc(19,P,1,0,"tr",10),t.qZA()(),t._UZ(20,"mat-paginator",11),t.qZA()()()),2&e&&(t.xp6(3),t.Oqu(t.lcZ(4,6,"Tags")),t.xp6(5),t.Q6J("dataSource",n.data),t.xp6(10),t.Q6J("matHeaderRowDef",n.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",n.displayedColumns),t.xp6(1),t.Q6J("length",n.resultsLength)("pageSize",30))},dependencies:[C.zs,f.a8,f.dn,f.dk,f.n5,d.NW,u.YE,i.BZ,i.fO,i.as,i.w1,i.Dz,i.nj,i.ge,i.ev,i.XQ,i.Gk,h.Ot],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;inset:0 0 56px;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]});var k=o(4850),z=o(1572),G=o(3683);function J(a,e){1&a&&t._UZ(0,"mat-progress-spinner")}function E(a,e){if(1&a&&(t.TgZ(0,"div",15),t.YNc(1,J,1,0,"mat-progress-spinner",16),t.qZA()),2&a){const n=t.oxw();t.xp6(1),t.Q6J("ngIf",n.isLoadingResults)}}function B(a,e){1&a&&(t.TgZ(0,"th",17),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Tag")))}function H(a,e){if(1&a&&(t.TgZ(0,"td",18),t._uU(1),t.qZA()),2&a){const n=e.$implicit;t.xp6(1),t.Oqu(n.TagTerm)}}function j(a,e){1&a&&(t.TgZ(0,"th",17),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a&&(t.xp6(1),t.Oqu(t.lcZ(2,1,"Type")))}function q(a,e){if(1&a&&(t.TgZ(0,"td",18),t._uU(1),t.ALo(2,"transloco"),t.qZA()),2&a){const n=e.$implicit,s=t.oxw();t.xp6(1),t.Oqu(t.lcZ(2,1,s.getTagReferenceTypeName(n.RefType)))}}function K(a,e){1&a&&(t.TgZ(0,"th",17),t._uU(1,"Ref. ID"),t.qZA())}function $(a,e){if(1&a){const n=t.EpF();t.TgZ(0,"td",18)(1,"a",19),t.NdJ("click",function(){const x=t.CHM(n).$implicit,y=t.oxw();return t.KtG(y.onRefIDClicked(x))}),t._uU(2),t.qZA()()}if(2&a){const n=e.$implicit;t.xp6(2),t.Oqu(n.RefID)}}function F(a,e){1&a&&t._UZ(0,"tr",20)}function W(a,e){1&a&&t._UZ(0,"tr",21)}class l{constructor(e,n,s){this.odataService=e,this.activateRoute=n,this.uiUtilSrv=s,this.displayedColumns=["tag","reftype","refid"],this.dataSource=[],this.currenttag="",this.resultsLength=0,this.isLoadingResults=!0,this.refType=void 0,this.getTagReferenceTypeName=r.GE}ngOnInit(){this.activateRoute.url.subscribe({next:e=>{e instanceof Array&&e.length>0&&("display"===e[0].path?(this.currenttag=e[1].path,this.refType=void 0):"displayki"===e[0].path?(this.currenttag=e[1].path,this.refType=r.ik.KnowledgeItem):"displayei"===e[0].path&&(this.currenttag=e[1].path,this.refType=r.ik.ExerciseItem))},error:e=>{console.error(e)}})}ngAfterViewInit(){this.sort.sortChange.subscribe(()=>this.paginator.pageIndex=0),(0,R.T)(this.sort.sortChange,this.paginator.page).pipe((0,w.O)({}),(0,O.w)(()=>(this.isLoadingResults=!0,this.odataService.getTags(this.currenttag,this.refType))),(0,U.U)(e=>(this.isLoadingResults=!1,this.resultsLength=e.totalCount,e.items)),(0,S.K)(()=>(this.isLoadingResults=!1,(0,A.of)([])))).subscribe(e=>this.dataSource=e)}onRefIDClicked(e){e.RefType===r.ik.ExerciseItem?this.uiUtilSrv.navigateExerciseItemDisplayPage(e.RefID):e.RefType===r.ik.KnowledgeItem&&this.uiUtilSrv.navigateKnowledgeItemDisplayPage(e.RefID)}onGoToPreview(){const e=[];this.dataSource.forEach(n=>{n.RefType&&n.RefID&&e.push({refType:n.RefType,refId:n.RefID})}),this.uiUtilSrv.navigatePreviewPage(e)}}l.\u0275fac=function(e){return new(e||l)(t.Y36(T.CB),t.Y36(g.gz),t.Y36(T.dM))},l.\u0275cmp=t.Xpm({type:l,selectors:[["app-tag-detail"]],viewQuery:function(e,n){if(1&e&&(t.Gf(d.NW,5),t.Gf(u.YE,5)),2&e){let s;t.iGM(s=t.CRH())&&(n.paginator=s.first),t.iGM(s=t.CRH())&&(n.sort=s.first)}},decls:27,vars:13,consts:[[1,"toolbar-spacer"],[1,"example-button-row"],["mat-raised-button","",3,"click"],[1,"example-container","mat-elevation-z8"],["class","example-loading-shade",4,"ngIf"],[1,"example-table-container"],["mat-table","","matSort","","matSortActive","created","matSortDisableClear","","matSortDirection","desc",1,"example-table",3,"dataSource"],["matColumnDef","tag"],["mat-header-cell","",4,"matHeaderCellDef"],["mat-cell","",4,"matCellDef"],["matColumnDef","reftype"],["matColumnDef","refid"],["mat-header-row","",4,"matHeaderRowDef"],["mat-row","",4,"matRowDef","matRowDefColumns"],[3,"length","pageSize"],[1,"example-loading-shade"],[4,"ngIf"],["mat-header-cell",""],["mat-cell",""],["mat-button","",3,"click"],["mat-header-row",""],["mat-row",""]],template:function(e,n){1&e&&(t.TgZ(0,"mat-toolbar-row")(1,"span"),t._uU(2),t.ALo(3,"transloco"),t.qZA(),t._UZ(4,"span",0),t.TgZ(5,"section")(6,"div",1)(7,"button",2),t.NdJ("click",function(){return n.onGoToPreview()}),t._uU(8),t.ALo(9,"transloco"),t.qZA()()()(),t._UZ(10,"mat-divider"),t.TgZ(11,"div",3),t.YNc(12,E,2,1,"div",4),t.TgZ(13,"div",5)(14,"table",6),t.ynx(15,7),t.YNc(16,B,3,3,"th",8),t.YNc(17,H,2,1,"td",9),t.BQk(),t.ynx(18,10),t.YNc(19,j,3,3,"th",8),t.YNc(20,q,3,3,"td",9),t.BQk(),t.ynx(21,11),t.YNc(22,K,2,0,"th",8),t.YNc(23,$,3,1,"td",9),t.BQk(),t.YNc(24,F,1,0,"tr",12),t.YNc(25,W,1,0,"tr",13),t.qZA()(),t._UZ(26,"mat-paginator",14),t.qZA()),2&e&&(t.xp6(2),t.AsE("",t.lcZ(3,9,"Tag"),": ",n.currenttag,""),t.xp6(6),t.Oqu(t.lcZ(9,11,"Common.Preview")),t.xp6(4),t.Q6J("ngIf",n.isLoadingResults),t.xp6(2),t.Q6J("dataSource",n.dataSource),t.xp6(10),t.Q6J("matHeaderRowDef",n.displayedColumns),t.xp6(1),t.Q6J("matRowDefColumns",n.displayedColumns),t.xp6(1),t.Q6J("length",n.resultsLength)("pageSize",20))},dependencies:[Z.O5,C.zs,C.lW,k.d,d.NW,z.Ou,u.YE,i.BZ,i.fO,i.as,i.w1,i.Dz,i.nj,i.ge,i.ev,i.XQ,i.Gk,G.rD,h.Ot],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}.example-button-row[_ngcontent-%COMP%]{display:table-cell}.example-container[_ngcontent-%COMP%]{position:relative;min-height:200px}.example-table-container[_ngcontent-%COMP%]{position:relative;max-height:400px;overflow:auto}table[_ngcontent-%COMP%]{width:100%}.example-loading-shade[_ngcontent-%COMP%]{position:absolute;inset:0 0 56px;background:rgba(0,0,0,.15);z-index:1;display:flex;align-items:center;justify-content:center}"]});const X=[{path:"",component:p},{path:"display/:content",component:l},{path:"displayki/:content",component:l},{path:"displayei/:content",component:l}];class c{}c.\u0275fac=function(e){return new(e||c)},c.\u0275mod=t.oAB({type:c}),c.\u0275inj=t.cJS({imports:[g.Bz.forChild(X),g.Bz]});var V=o(5471);class m{}m.\u0275fac=function(e){return new(e||m)},m.\u0275mod=t.oAB({type:m}),m.\u0275inj=t.cJS({imports:[Z.ez,D.u5,D.UX,N.U,c,V.JP.forChild(),h.y4]})}}]);