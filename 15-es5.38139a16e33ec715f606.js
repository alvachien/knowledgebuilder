!function(){function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var c=0;c<t.length;c++){var i=t[c];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}function c(e,c,i){return c&&t(e.prototype,c),i&&t(e,i),e}(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{caho:function(t,i,n){"use strict";n.r(i),n.d(i,"PreviewModule",function(){return _});var o,r=n("ofXK"),s=n("3Pt+"),a=n("QPBi"),b=n("jIBr"),l=n("tyNb"),d=n("VHTt"),u=n("2ChS"),f=n("fXoL"),h=n("o0su"),v=n("MutI"),m=n("FKr1"),p=((o=function(){function t(c,i,n){e(this,t),this._bottomSheetRef=c,this.odataSrv=i,this.data=n}return c(t,[{key:"createNewScore",value:function(e,t){var c=this;t.preventDefault();var i=new d.m;i.RefID=this.data.excitemid,i.Score=e,i.User=this.odataSrv.currentUser.getUserId(),this.odataSrv.createExerciseItemUserScore(i).subscribe({next:function(e){c.data.resultFlag=!0,c.data.newScore=e,c._bottomSheetRef.dismiss(c.data)},error:function(e){c.data.resultFlag=!1,c.data.newScore=null,c.data.errorInfo=e,c._bottomSheetRef.dismiss(c.data)}})}}]),t}()).\u0275fac=function(e){return new(e||o)(f.Qb(u.d),f.Qb(h.d),f.Qb(u.a))},o.\u0275cmp=f.Kb({type:o,selectors:[["app-preview-newscore-sheet"]],decls:19,vars:9,consts:[["mat-list-item","",3,"click"],["mat-line",""]],template:function(e,t){1&e&&(f.Wb(0,"mat-nav-list"),f.Wb(1,"a",0),f.ec("click",function(e){return t.createNewScore(0,e)}),f.Wb(2,"span",1),f.Fc(3),f.jc(4,"transloco"),f.Vb(),f.Wb(5,"span",1),f.Fc(6,"Add a new score of 0"),f.Vb(),f.Vb(),f.Wb(7,"a",0),f.ec("click",function(e){return t.createNewScore(60,e)}),f.Wb(8,"span",1),f.Fc(9),f.jc(10,"transloco"),f.Vb(),f.Wb(11,"span",1),f.Fc(12,"Add a new score of 60"),f.Vb(),f.Vb(),f.Wb(13,"a",0),f.ec("click",function(e){return t.createNewScore(100,e)}),f.Wb(14,"span",1),f.Fc(15),f.jc(16,"transloco"),f.Vb(),f.Wb(17,"span",1),f.Fc(18,"Add a new score of 100"),f.Vb(),f.Vb(),f.Vb()),2&e&&(f.Eb(3),f.Hc("",f.kc(4,3,"NewPractice"),": 0"),f.Eb(6),f.Hc("",f.kc(10,5,"NewPractice"),": 60"),f.Eb(6),f.Hc("",f.kc(16,7,"NewPractice"),": 100"))},directives:[v.e,v.b,m.k],pipes:[a.d],encapsulation:2}),o),w=n("0MNC"),g=n("bTqV"),x=n("f0Cb"),E=n("lR5k"),I=n("bSwM"),k=n("Qu3c"),S=n("5RNC"),y=n("kmnG");function j(e,t){if(1&e&&(f.Wb(0,"div",3),f.Wb(1,"h3"),f.Fc(2),f.Vb(),f.Rb(3,"mat-divider"),f.Wb(4,"h3"),f.Fc(5),f.jc(6,"transloco"),f.Vb(),f.Rb(7,"mat-divider"),f.Wb(8,"div",4),f.Rb(9,"markdown",5),f.Vb(),f.Vb()),2&e){var c=f.ic();f.Eb(2),f.Hc("ID: ",c.selectedKnowledge.ID,""),f.Eb(3),f.Ic("",f.kc(6,5,"Title"),": ",c.selectedKnowledge.Title,""),f.Eb(4),f.oc("data",c.selectedKnowledge.Content)("katexOptions",c.mathOptions)}}function P(e,t){1&e&&(f.Wb(0,"mat-label",15),f.Fc(1),f.jc(2,"transloco"),f.Vb()),2&e&&(f.Eb(1),f.Gc(f.kc(2,1,"FontSize")))}function O(e,t){if(1&e&&(f.Wb(0,"mat-label"),f.Wb(1,"span"),f.Fc(2),f.Vb(),f.Fc(3),f.jc(4,"date"),f.Vb()),2&e){var c=f.ic(2);f.Eb(1),f.Gb(c.isSuccessScore?"success-score":"fail-score"),f.Eb(1),f.Gc(c.selectedExerciseUserScore.Score),f.Eb(1),f.Hc(" (",f.lc(4,4,c.selectedExerciseUserScore.TakenDate,"yyyy-M-d"),")")}}function V(e,t){if(1&e&&(f.Wb(0,"h3"),f.Fc(1),f.Vb()),2&e){var c=f.ic(2);f.Eb(1),f.Hc("ID: ",c.selectedExercise.ID,"")}}function W(e,t){if(1&e&&(f.Wb(0,"h3"),f.Fc(1),f.jc(2,"transloco"),f.jc(3,"transloco"),f.Vb()),2&e){var c=f.ic(2);f.Eb(1),f.Ic("",f.kc(2,2,"Type"),": ",f.kc(3,4,c.getExerciseItemTypeName(c.selectedExercise.ItemType)),"")}}function M(e,t){if(1&e&&(f.Wb(0,"h3"),f.Fc(1),f.jc(2,"transloco"),f.Vb()),2&e){var c=f.ic(2);f.Eb(1),f.Ic("",f.kc(2,2,"Tags"),": ",c.selectedExercise.Tags.toString(),"")}}function F(e,t){1&e&&f.Rb(0,"mat-divider")}function C(e,t){if(1&e&&(f.Wb(0,"div",13),f.Rb(1,"mat-divider"),f.Wb(2,"h3"),f.Fc(3),f.jc(4,"transloco"),f.Vb(),f.Rb(5,"markdown",5),f.Vb()),2&e){var c=f.ic(2);f.Bc("font-size",c.fontSize,"px"),f.Eb(3),f.Gc(f.kc(4,5,"Answer")),f.Eb(2),f.oc("data",c.selectedExercise.Answer)("katexOptions",c.mathOptions)}}function N(e,t){if(1&e){var c=f.Xb();f.Wb(0,"div",3),f.Wb(1,"div",6),f.Wb(2,"mat-checkbox",7),f.ec("ngModelChange",function(e){return f.xc(c),f.ic().focusMode=e}),f.jc(3,"transloco"),f.Fc(4),f.jc(5,"transloco"),f.Vb(),f.Wb(6,"mat-checkbox",8),f.ec("ngModelChange",function(e){return f.xc(c),f.ic().hideAnswer=e}),f.jc(7,"transloco"),f.Fc(8),f.jc(9,"transloco"),f.Vb(),f.Ec(10,P,3,3,"mat-label",9),f.Wb(11,"mat-slider",10),f.ec("ngModelChange",function(e){return f.xc(c),f.ic().fontSize=e}),f.jc(12,"transloco"),f.Vb(),f.Vb(),f.Wb(13,"div",6),f.Ec(14,O,5,7,"mat-label",11),f.Wb(15,"button",12),f.ec("click",function(){return f.xc(c),f.ic().onNewScore()}),f.Fc(16),f.jc(17,"transloco"),f.Vb(),f.Vb(),f.Rb(18,"mat-divider"),f.Ec(19,V,2,1,"h3",11),f.Ec(20,W,4,6,"h3",11),f.Ec(21,M,3,4,"h3",11),f.Ec(22,F,1,0,"mat-divider",11),f.Wb(23,"div",13),f.Wb(24,"h3"),f.Fc(25),f.jc(26,"transloco"),f.Vb(),f.Rb(27,"markdown",5),f.Vb(),f.Ec(28,C,6,7,"div",14),f.Vb()}if(2&e){var i=f.ic();f.Eb(2),f.pc("matTooltip",f.kc(3,21,"FocusMode")),f.oc("ngModel",i.focusMode),f.Eb(2),f.Gc(f.kc(5,23,"FocusMode")),f.Eb(2),f.pc("matTooltip",f.kc(7,25,"QuizMode")),f.oc("ngModel",i.hideAnswer),f.Eb(2),f.Gc(f.kc(9,27,"QuizMode")),f.Eb(2),f.oc("ngIf",!i.mobileQuery.matches),f.Eb(1),f.pc("matTooltip",f.kc(12,29,"FontSize")),f.oc("ngModel",i.fontSize),f.Eb(3),f.oc("ngIf",i.selectedExerciseUserScore),f.Eb(2),f.Gc(f.kc(17,31,"NewPractice")),f.Eb(3),f.oc("ngIf",!i.focusMode),f.Eb(1),f.oc("ngIf",!i.focusMode),f.Eb(1),f.oc("ngIf",!i.focusMode),f.Eb(1),f.oc("ngIf",!i.focusMode),f.Eb(1),f.Bc("font-size",i.fontSize,"px"),f.Eb(2),f.Gc(f.kc(26,33,"Content")),f.Eb(2),f.oc("data",i.selectedExercise.Content)("katexOptions",i.mathOptions),f.Eb(1),f.oc("ngIf",!i.hideAnswer)}}var T,U,Q,z=[{path:"",component:(T=function(){function t(c,i,n,o,r){e(this,t),this.odataSvc=c,this._bottomSheet=o,this.uiUtilSrv=r,this.selectedExerciseUserScore=null,this.listPreviewObjects=[],this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.focusMode=!1,this.hideAnswer=!1,this.fontSize=20,this.mobileQuery=n.matchMedia("(max-width: 600px)"),this._mobileQueryListener=function(){return i.detectChanges()},this.previewIdx=-1}return c(t,[{key:"getExerciseItemTypeName",value:function(e){return Object(d.K)(e)}},{key:"isSuccessScore",get:function(){return null!==this.selectedExerciseUserScore&&this.selectedExerciseUserScore.Score>=60}},{key:"ngOnInit",value:function(){this.mobileQuery.addEventListener("change",this._mobileQueryListener),this.listPreviewObjects=this.uiUtilSrv.previewObjList.slice(),this.uiUtilSrv.previewObjList=[],this.listPreviewObjects.length>0&&(this.previewIdx=-1,this.onNextPreviewItem())}},{key:"ngOnDestroy",value:function(){this.mobileQuery.removeEventListener("change",this._mobileQueryListener)}},{key:"onPreviousPreviewItem",value:function(){this.previewIdx>0&&(this.previewIdx--,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"onNextPreviewItem",value:function(){this.previewIdx<this.listPreviewObjects.length&&(this.previewIdx++,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}},{key:"isNextPreviewButtonEnabled",get:function(){return this.previewIdx<this.listPreviewObjects.length-1}},{key:"isPreviousButtonEnabled",get:function(){return this.previewIdx>0}},{key:"fetchPreviewItem",value:function(){var e,t,c=this;this.previewIdx>-1&&this.previewIdx<this.listPreviewObjects.length&&((null===(e=this.selectedObj)||void 0===e?void 0:e.refType)===d.D.KnowledgeItem?this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){c.selectedKnowledge=e},error:function(e){c.uiUtilSrv.showSnackInfo(e)}}):(null===(t=this.selectedObj)||void 0===t?void 0:t.refType)===d.D.ExerciseItem&&(this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){c.selectedExercise=e},error:function(e){c.uiUtilSrv.showSnackInfo(e)}}),this.odataSvc.getLastestExerciseItemUserScore(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:function(e){c.selectedExerciseUserScore=e},error:function(e){c.uiUtilSrv.showSnackInfo(e)}})))}},{key:"onNewScore",value:function(){var e,t=this;this._bottomSheet.open(p,{data:{excitemid:null===(e=this.selectedExercise)||void 0===e?void 0:e.ID}}).afterDismissed().subscribe(function(e){e.resultFlag?e.newScore&&(t.selectedExerciseUserScore=e.newScore):t.uiUtilSrv.showSnackInfo(e.errorInfo)})}}]),t}(),T.\u0275fac=function(e){return new(e||T)(f.Qb(h.d),f.Qb(f.h),f.Qb(w.c),f.Qb(u.b),f.Qb(h.f))},T.\u0275cmp=f.Kb({type:T,selectors:[["app-preview"]],decls:22,vars:22,consts:[[1,"button-row"],["mat-raised-button","",3,"disabled","click"],["class","mat-typography","style","margin: 8px;",4,"ngIf"],[1,"mat-typography",2,"margin","8px"],[1,"control-full-width",2,"margin-top","16px","font-size","large"],["katex","",3,"data","katexOptions"],[1,"button-row",2,"margin","8px"],["color","primary","name","focusmode",2,"margin-left","4px",3,"ngModel","matTooltip","ngModelChange"],["color","primary","name","quizmode",2,"margin-left","4px",3,"ngModel","matTooltip","ngModelChange"],["style","margin-left: 4px;",4,"ngIf"],["thumbLabel","","step","2","min","10","max","40",3,"ngModel","matTooltip","ngModelChange"],[4,"ngIf"],["mat-raised-button","",3,"click"],[1,"control-full-width",2,"margin-top","16px"],["class","control-full-width","style","margin-top: 16px;",3,"font-size",4,"ngIf"],[2,"margin-left","4px"]],template:function(e,t){1&e&&(f.Wb(0,"div",0),f.Wb(1,"div"),f.Fc(2),f.Vb(),f.Wb(3,"button",1),f.ec("click",function(){return t.onPreviousPreviewItem()}),f.Fc(4),f.jc(5,"transloco"),f.Vb(),f.Wb(6,"button",1),f.ec("click",function(){return t.onNextPreviewItem()}),f.Fc(7),f.jc(8,"transloco"),f.Vb(),f.Vb(),f.Rb(9,"mat-divider"),f.Ec(10,j,10,7,"div",2),f.Ec(11,N,29,35,"div",2),f.Rb(12,"mat-divider"),f.Wb(13,"div",0),f.Wb(14,"div"),f.Fc(15),f.Vb(),f.Wb(16,"button",1),f.ec("click",function(){return t.onPreviousPreviewItem()}),f.Fc(17),f.jc(18,"transloco"),f.Vb(),f.Wb(19,"button",1),f.ec("click",function(){return t.onNextPreviewItem()}),f.Fc(20),f.jc(21,"transloco"),f.Vb(),f.Vb()),2&e&&(f.Eb(2),f.Ic(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),f.Eb(1),f.oc("disabled",!t.isPreviousButtonEnabled),f.Eb(1),f.Gc(f.kc(5,14,"Common.Previous")),f.Eb(2),f.oc("disabled",!t.isNextPreviewButtonEnabled),f.Eb(1),f.Gc(f.kc(8,16,"Common.Next")),f.Eb(3),f.oc("ngIf",t.selectedObj&&1===t.selectedObj.refType&&t.selectedKnowledge),f.Eb(1),f.oc("ngIf",t.selectedObj&&2===t.selectedObj.refType&&t.selectedExercise),f.Eb(4),f.Ic(" ",t.previewIdx+1," / ",t.listPreviewObjects.length,""),f.Eb(1),f.oc("disabled",!t.isPreviousButtonEnabled),f.Eb(1),f.Gc(f.kc(18,18,"Common.Previous")),f.Eb(2),f.oc("disabled",!t.isNextPreviewButtonEnabled),f.Eb(1),f.Gc(f.kc(21,20,"Common.Next")))},directives:[g.b,x.a,r.m,E.a,I.a,s.n,s.q,k.a,S.a,y.g],pipes:[a.d,r.e],styles:[".button-row[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center}.button-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin:16px}.input-fontsize[_ngcontent-%COMP%]{margin-left:24px;width:100px}mat-slide-toggle[_ngcontent-%COMP%]{width:80px}mat-slider[_ngcontent-%COMP%]{margin-left:8px;width:80px}.success-score[_ngcontent-%COMP%]{color:green;font-size:16px}.fail-score[_ngcontent-%COMP%]{color:red;font-size:16px}"]}),T)}],R=((Q=function t(){e(this,t)}).\u0275fac=function(e){return new(e||Q)},Q.\u0275mod=f.Ob({type:Q}),Q.\u0275inj=f.Nb({imports:[[l.e.forChild(z)],l.e]}),Q),_=((U=function t(){e(this,t)}).\u0275fac=function(e){return new(e||U)},U.\u0275mod=f.Ob({type:U}),U.\u0275inj=f.Nb({imports:[[r.c,s.i,s.s,a.c,b.a,E.b,R]]}),U)}}])}();