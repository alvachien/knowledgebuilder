!function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{caho:function(i,n,c){"use strict";c.r(n),c.d(n,"PreviewModule",function(){return C});var o=c("ofXK"),r=c("3Pt+"),s=c("QPBi"),d=c("jIBr"),b=c("tyNb"),a=c("VHTt"),l=c("fXoL"),u=c("o0su"),v=c("bTqV"),f=c("f0Cb"),h=c("lR5k"),w=c("1jcm"),p=c("kmnG"),m=c("5RNC");function g(e,t){if(1&e&&(l.Vb(0,"div",3),l.Vb(1,"h3"),l.Ec(2),l.Ub(),l.Qb(3,"mat-divider"),l.Vb(4,"h3"),l.Ec(5),l.ic(6,"transloco"),l.Ub(),l.Qb(7,"mat-divider"),l.Vb(8,"div",4),l.Qb(9,"markdown",5),l.Ub(),l.Ub()),2&e){var i=l.hc();l.Eb(2),l.Gc("ID: ",i.selectedKnowledge.ID,""),l.Eb(3),l.Hc("",l.jc(6,5,"Title"),": ",i.selectedKnowledge.Title,""),l.Eb(4),l.nc("data",i.selectedKnowledge.Content)("katexOptions",i.mathOptions)}}function E(e,t){if(1&e&&(l.Vb(0,"h3"),l.Ec(1),l.Ub()),2&e){var i=l.hc(2);l.Eb(1),l.Gc("ID: ",i.selectedExercise.ID,"")}}function x(e,t){if(1&e&&(l.Vb(0,"h3"),l.Ec(1),l.ic(2,"transloco"),l.ic(3,"transloco"),l.Ub()),2&e){var i=l.hc(2);l.Eb(1),l.Hc("",l.jc(2,2,"Type"),": ",l.jc(3,4,i.getExerciseItemTypeName(i.selectedExercise.ItemType)),"")}}function I(e,t){if(1&e&&(l.Vb(0,"h3"),l.Ec(1),l.ic(2,"transloco"),l.Ub()),2&e){var i=l.hc(2);l.Eb(1),l.Hc("",l.jc(2,2,"Tags"),": ",i.selectedExercise.Tags.toString(),"")}}function P(e,t){1&e&&l.Qb(0,"mat-divider")}function j(e,t){if(1&e&&(l.Vb(0,"div",11),l.Qb(1,"mat-divider"),l.Vb(2,"h3"),l.Ec(3),l.ic(4,"transloco"),l.Ub(),l.Qb(5,"markdown",5),l.Ub()),2&e){var i=l.hc(2);l.Ac("font-size",i.fontSize,"px"),l.Eb(3),l.Fc(l.jc(4,5,"Answer")),l.Eb(2),l.nc("data",i.selectedExercise.Answer)("katexOptions",i.mathOptions)}}function O(e,t){if(1&e){var i=l.Wb();l.Vb(0,"div",3),l.Vb(1,"div",6),l.Vb(2,"mat-slide-toggle",7),l.dc("ngModelChange",function(e){return l.wc(i),l.hc().focusMode=e}),l.Ec(3),l.ic(4,"transloco"),l.Ub(),l.Vb(5,"mat-slide-toggle",8),l.dc("ngModelChange",function(e){return l.wc(i),l.hc().hideAnswer=e}),l.Ec(6),l.ic(7,"transloco"),l.Ub(),l.Vb(8,"mat-label"),l.Ec(9),l.ic(10,"transloco"),l.Ub(),l.Vb(11,"mat-slider",9),l.dc("ngModelChange",function(e){return l.wc(i),l.hc().fontSize=e}),l.Ub(),l.Ub(),l.Qb(12,"mat-divider"),l.Dc(13,E,2,1,"h3",10),l.Dc(14,x,4,6,"h3",10),l.Dc(15,I,3,4,"h3",10),l.Dc(16,P,1,0,"mat-divider",10),l.Vb(17,"div",11),l.Vb(18,"h3"),l.Ec(19),l.ic(20,"transloco"),l.Ub(),l.Qb(21,"markdown",5),l.Ub(),l.Dc(22,j,6,7,"div",12),l.Ub()}if(2&e){var n=l.hc();l.Eb(2),l.nc("ngModel",n.focusMode),l.Eb(1),l.Fc(l.jc(4,16,"FocusMode")),l.Eb(2),l.nc("ngModel",n.hideAnswer),l.Eb(1),l.Fc(l.jc(7,18,"QuizMode")),l.Eb(3),l.Fc(l.jc(10,20,"FontSize")),l.Eb(2),l.nc("ngModel",n.fontSize),l.Eb(2),l.nc("ngIf",!n.focusMode),l.Eb(1),l.nc("ngIf",!n.focusMode),l.Eb(1),l.nc("ngIf",!n.focusMode),l.Eb(1),l.nc("ngIf",!n.focusMode),l.Eb(1),l.Ac("font-size",n.fontSize,"px"),l.Eb(2),l.Fc(l.jc(20,22,"Content")),l.Eb(2),l.nc("data",n.selectedExercise.Content)("katexOptions",n.mathOptions),l.Eb(1),l.nc("ngIf",!n.hideAnswer)}}var y,M,V,k=[{path:"",component:(y=function(){function i(t){e(this,i),this.odataSvc=t,this.listPreviewObjects=[],this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.focusMode=!1,this.hideAnswer=!1,this.fontSize=20,this.previewIdx=-1}var n,c,o;return n=i,(c=[{key:"getExerciseItemTypeName",value:function(e){return Object(a.E)(e)}},{key:"ngOnInit",value:function(){this.listPreviewObjects=this.odataSvc.previewObjList.slice(),this.odataSvc.previewObjList=[],this.listPreviewObjects.length>0&&(this.previewIdx=-1,this.onNextPreviewItem())}},{key:"onPreviousPreviewItem",value:function(){this.previewIdx>0&&(this.previewIdx--,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"onNextPreviewItem",value:function(){this.previewIdx<this.listPreviewObjects.length&&(this.previewIdx++,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"isNextPreviewButtonEnabled",get:function(){return this.previewIdx<this.listPreviewObjects.length-1}},{key:"isPreviousButtonEnabled",get:function(){return this.previewIdx>0}},{key:"fetchPreviewItem",value:function(){var e,t,i=this;this.previewIdx>-1&&this.previewIdx<this.listPreviewObjects.length&&((null===(e=this.selectedObj)||void 0===e?void 0:e.refType)===a.z.KnowledgeItem?this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){i.selectedKnowledge=e},error:function(e){console.error(e)}}):(null===(t=this.selectedObj)||void 0===t?void 0:t.refType)===a.z.ExerciseItem&&this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){i.selectedExercise=e},error:function(e){console.error(e)}}))}}])&&t(n.prototype,c),o&&t(n,o),i}(),y.\u0275fac=function(e){return new(e||y)(l.Pb(u.b))},y.\u0275cmp=l.Jb({type:y,selectors:[["app-preview"]],decls:22,vars:22,consts:[[1,"button-row"],["mat-raised-button","",3,"disabled","click"],["class","mat-typography","style","margin: 16px;",4,"ngIf"],[1,"mat-typography",2,"margin","16px"],[1,"control-full-width",2,"margin-top","16px","font-size","large"],["katex","",3,"data","katexOptions"],[1,"button-row",2,"margin","16px"],["color","primary","name","focusmode",3,"ngModel","ngModelChange"],["color","primary","name","quizmode",2,"margin-left","16px",3,"ngModel","ngModelChange"],["thumbLabel","","step","2","min","10","max","40",3,"ngModel","ngModelChange"],[4,"ngIf"],[1,"control-full-width",2,"margin-top","16px"],["class","control-full-width","style","margin-top: 16px;",3,"font-size",4,"ngIf"]],template:function(e,t){1&e&&(l.Vb(0,"div",0),l.Vb(1,"div"),l.Ec(2),l.Ub(),l.Vb(3,"button",1),l.dc("click",function(){return t.onPreviousPreviewItem()}),l.Ec(4),l.ic(5,"transloco"),l.Ub(),l.Vb(6,"button",1),l.dc("click",function(){return t.onNextPreviewItem()}),l.Ec(7),l.ic(8,"transloco"),l.Ub(),l.Ub(),l.Qb(9,"mat-divider"),l.Dc(10,g,10,7,"div",2),l.Dc(11,O,23,24,"div",2),l.Qb(12,"mat-divider"),l.Vb(13,"div",0),l.Vb(14,"div"),l.Ec(15),l.Ub(),l.Vb(16,"button",1),l.dc("click",function(){return t.onPreviousPreviewItem()}),l.Ec(17),l.ic(18,"transloco"),l.Ub(),l.Vb(19,"button",1),l.dc("click",function(){return t.onNextPreviewItem()}),l.Ec(20),l.ic(21,"transloco"),l.Ub(),l.Ub()),2&e&&(l.Eb(2),l.Hc(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),l.Eb(1),l.nc("disabled",!t.isPreviousButtonEnabled),l.Eb(1),l.Fc(l.jc(5,14,"Common.Previous")),l.Eb(2),l.nc("disabled",!t.isNextPreviewButtonEnabled),l.Eb(1),l.Fc(l.jc(8,16,"Common.Next")),l.Eb(3),l.nc("ngIf",t.selectedObj&&1===t.selectedObj.refType&&t.selectedKnowledge),l.Eb(1),l.nc("ngIf",t.selectedObj&&2===t.selectedObj.refType&&t.selectedExercise),l.Eb(4),l.Hc(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),l.Eb(1),l.nc("disabled",!t.isPreviousButtonEnabled),l.Eb(1),l.Fc(l.jc(18,18,"Common.Previous")),l.Eb(2),l.nc("disabled",!t.isNextPreviewButtonEnabled),l.Eb(1),l.Fc(l.jc(21,20,"Common.Next")))},directives:[v.b,f.a,o.m,h.a,w.a,r.m,r.p,p.g,m.a],pipes:[s.d],styles:[".button-row[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center}.button-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin:16px}.input-fontsize[_ngcontent-%COMP%]{margin-left:24px;width:100px}mat-slider[_ngcontent-%COMP%]{margin-left:24px;width:200px}"]}),y)}],U=((V=function t(){e(this,t)}).\u0275fac=function(e){return new(e||V)},V.\u0275mod=l.Nb({type:V}),V.\u0275inj=l.Mb({imports:[[b.e.forChild(k)],b.e]}),V),C=((M=function t(){e(this,t)}).\u0275fac=function(e){return new(e||M)},M.\u0275mod=l.Nb({type:M}),M.\u0275inj=l.Mb({imports:[[o.c,r.h,r.r,s.c,d.a,h.b,U]]}),M)}}])}();