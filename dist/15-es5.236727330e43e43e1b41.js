!function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{caho:function(i,n,c){"use strict";c.r(n),c.d(n,"PreviewModule",function(){return O});var r=c("ofXK"),o=c("3Pt+"),s=c("QPBi"),b=c("jIBr"),d=c("tyNb"),a=c("VHTt"),l=c("fXoL"),v=c("o0su"),u=c("bTqV"),h=c("f0Cb"),w=c("lR5k"),p=c("1jcm");function f(e,t){if(1&e&&(l.Vb(0,"div",3),l.Vb(1,"h3"),l.Ec(2),l.Ub(),l.Qb(3,"mat-divider"),l.Vb(4,"h3"),l.Ec(5),l.ic(6,"transloco"),l.Ub(),l.Qb(7,"mat-divider"),l.Vb(8,"div",4),l.Qb(9,"markdown",5),l.Ub(),l.Ub()),2&e){var i=l.hc();l.Eb(2),l.Gc("ID: ",i.selectedKnowledge.ID,""),l.Eb(3),l.Hc("",l.jc(6,5,"Title"),": ",i.selectedKnowledge.Title,""),l.Eb(4),l.nc("data",i.selectedKnowledge.Content)("katexOptions",i.mathOptions)}}function m(e,t){if(1&e&&(l.Vb(0,"div",4),l.Qb(1,"mat-divider"),l.Vb(2,"h3"),l.Ec(3),l.ic(4,"transloco"),l.Ub(),l.Qb(5,"markdown",5),l.Ub()),2&e){var i=l.hc(2);l.Eb(3),l.Fc(l.jc(4,3,"Answer")),l.Eb(2),l.nc("data",i.selectedExercise.Answer)("katexOptions",i.mathOptions)}}function E(e,t){if(1&e){var i=l.Wb();l.Vb(0,"div",3),l.Vb(1,"div",6),l.Vb(2,"mat-slide-toggle",7),l.dc("ngModelChange",function(e){return l.wc(i),l.hc().hideAnswer=e}),l.Ec(3),l.ic(4,"transloco"),l.Ub(),l.Ub(),l.Qb(5,"mat-divider"),l.Vb(6,"h3"),l.Ec(7),l.Ub(),l.Vb(8,"h3"),l.Ec(9),l.ic(10,"transloco"),l.ic(11,"transloco"),l.Ub(),l.Vb(12,"h3"),l.Ec(13),l.ic(14,"transloco"),l.Ub(),l.Qb(15,"mat-divider"),l.Vb(16,"div",4),l.Vb(17,"h3"),l.Ec(18),l.ic(19,"transloco"),l.Ub(),l.Qb(20,"markdown",5),l.Ub(),l.Dc(21,m,6,5,"div",8),l.Ub()}if(2&e){var n=l.hc();l.Eb(2),l.nc("ngModel",n.hideAnswer),l.Eb(1),l.Fc(l.jc(4,11,"QuizMode")),l.Eb(4),l.Gc("ID: ",n.selectedExercise.ID,""),l.Eb(2),l.Hc("",l.jc(10,13,"Type"),": ",l.jc(11,15,n.getExerciseItemTypeName(n.selectedExercise.ItemType)),""),l.Eb(4),l.Hc("",l.jc(14,17,"Tags"),": ",n.selectedExercise.Tags.toString(),""),l.Eb(5),l.Fc(l.jc(19,19,"Content")),l.Eb(2),l.nc("data",n.selectedExercise.Content)("katexOptions",n.mathOptions),l.Eb(1),l.nc("ngIf",!n.hideAnswer)}}var g,x,I,P=[{path:"",component:(g=function(){function i(t){e(this,i),this.odataSvc=t,this.listPreviewObjects=[],this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.hideAnswer=!1,this.previewIdx=-1}var n,c,r;return n=i,(c=[{key:"getExerciseItemTypeName",value:function(e){return Object(a.B)(e)}},{key:"ngOnInit",value:function(){this.listPreviewObjects=this.odataSvc.previewObjList.slice(),this.odataSvc.previewObjList=[],this.listPreviewObjects.length>0&&(this.previewIdx=-1,this.onNextPreviewItem())}},{key:"onPreviousPreviewItem",value:function(){this.previewIdx>0&&(this.previewIdx--,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"onNextPreviewItem",value:function(){this.previewIdx<this.listPreviewObjects.length&&(this.previewIdx++,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"isNextPreviewButtonEnabled",get:function(){return this.previewIdx<this.listPreviewObjects.length-1}},{key:"isPreviousButtonEnabled",get:function(){return this.previewIdx>0}},{key:"fetchPreviewItem",value:function(){var e,t,i=this;this.previewIdx>-1&&this.previewIdx<this.listPreviewObjects.length&&((null===(e=this.selectedObj)||void 0===e?void 0:e.refType)===a.y.KnowledgeItem?this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){i.selectedKnowledge=e},error:function(e){console.error(e)}}):(null===(t=this.selectedObj)||void 0===t?void 0:t.refType)===a.y.ExerciseItem&&this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){i.selectedExercise=e},error:function(e){console.error(e)}}))}}])&&t(n.prototype,c),r&&t(n,r),i}(),g.\u0275fac=function(e){return new(e||g)(l.Pb(v.b))},g.\u0275cmp=l.Jb({type:g,selectors:[["app-preview"]],decls:22,vars:22,consts:[[1,"button-row"],["mat-raised-button","",3,"disabled","click"],["class","mat-typography","style","margin: 16px;",4,"ngIf"],[1,"mat-typography",2,"margin","16px"],[1,"control-full-width",2,"margin-top","16px","font-size","large"],["katex","",3,"data","katexOptions"],[1,"button-row",2,"margin","16px"],["color","primary",3,"ngModel","ngModelChange"],["class","control-full-width","style","margin-top: 16px; font-size: large;",4,"ngIf"]],template:function(e,t){1&e&&(l.Vb(0,"div",0),l.Vb(1,"div"),l.Ec(2),l.Ub(),l.Vb(3,"button",1),l.dc("click",function(){return t.onPreviousPreviewItem()}),l.Ec(4),l.ic(5,"transloco"),l.Ub(),l.Vb(6,"button",1),l.dc("click",function(){return t.onNextPreviewItem()}),l.Ec(7),l.ic(8,"transloco"),l.Ub(),l.Ub(),l.Qb(9,"mat-divider"),l.Dc(10,f,10,7,"div",2),l.Dc(11,E,22,21,"div",2),l.Qb(12,"mat-divider"),l.Vb(13,"div",0),l.Vb(14,"div"),l.Ec(15),l.Ub(),l.Vb(16,"button",1),l.dc("click",function(){return t.onPreviousPreviewItem()}),l.Ec(17),l.ic(18,"transloco"),l.Ub(),l.Vb(19,"button",1),l.dc("click",function(){return t.onNextPreviewItem()}),l.Ec(20),l.ic(21,"transloco"),l.Ub(),l.Ub()),2&e&&(l.Eb(2),l.Hc(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),l.Eb(1),l.nc("disabled",!t.isPreviousButtonEnabled),l.Eb(1),l.Fc(l.jc(5,14,"Common.Previous")),l.Eb(2),l.nc("disabled",!t.isNextPreviewButtonEnabled),l.Eb(1),l.Fc(l.jc(8,16,"Common.Next")),l.Eb(3),l.nc("ngIf",t.selectedObj&&1===t.selectedObj.refType&&t.selectedKnowledge),l.Eb(1),l.nc("ngIf",t.selectedObj&&2===t.selectedObj.refType&&t.selectedExercise),l.Eb(4),l.Hc(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),l.Eb(1),l.nc("disabled",!t.isPreviousButtonEnabled),l.Eb(1),l.Fc(l.jc(18,18,"Common.Previous")),l.Eb(2),l.nc("disabled",!t.isNextPreviewButtonEnabled),l.Eb(1),l.Fc(l.jc(21,20,"Common.Next")))},directives:[u.b,h.a,r.m,w.a,p.a,o.m,o.p],pipes:[s.d],styles:[".button-row[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center}.button-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin:16px}"]}),g)}],j=((I=function t(){e(this,t)}).\u0275fac=function(e){return new(e||I)},I.\u0275mod=l.Nb({type:I}),I.\u0275inj=l.Mb({imports:[[d.d.forChild(P)],d.d]}),I),O=((x=function t(){e(this,t)}).\u0275fac=function(e){return new(e||x)},x.\u0275mod=l.Nb({type:x}),x.\u0275inj=l.Mb({imports:[[r.c,o.h,o.r,s.c,b.a,w.b,j]]}),x)}}])}();