(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{caho:function(e,t,i){"use strict";i.r(t),i.d(t,"PreviewModule",function(){return x});var s=i("ofXK"),c=i("3Pt+"),r=i("QPBi"),n=i("jIBr"),o=i("tyNb"),b=i("VHTt"),d=i("fXoL"),l=i("o0su"),a=i("bTqV"),v=i("f0Cb"),w=i("lR5k");function h(e,t){if(1&e&&(d.Tb(0,"div",3),d.Tb(1,"div",4),d.Tb(2,"span"),d.Ec(3,"ID: "),d.Sb(),d.Ec(4),d.Sb(),d.Ob(5,"mat-divider"),d.Tb(6,"div",4),d.Tb(7,"span"),d.Ec(8),d.gc(9,"transloco"),d.Sb(),d.Ec(10),d.Sb(),d.Ob(11,"mat-divider"),d.Tb(12,"div",4),d.Ob(13,"markdown",5),d.Sb(),d.Sb()),2&e){const e=d.fc();d.Cb(4),d.Fc(e.selectedKnowledge.ID),d.Cb(4),d.Gc("",d.hc(9,5,"Title"),": "),d.Cb(2),d.Fc(e.selectedKnowledge.Title),d.Cb(3),d.lc("data",e.selectedKnowledge.Content)("katexOptions",e.mathOptions)}}function u(e,t){if(1&e&&(d.Tb(0,"div",3),d.Tb(1,"div",4),d.Tb(2,"span"),d.Ec(3,"ID: "),d.Sb(),d.Ec(4),d.Sb(),d.Ob(5,"mat-divider"),d.Tb(6,"div",4),d.Tb(7,"span"),d.Ec(8),d.gc(9,"transloco"),d.Sb(),d.Ec(10),d.Sb(),d.Ob(11,"mat-divider"),d.Tb(12,"div",4),d.Ob(13,"markdown",5),d.Sb(),d.Sb()),2&e){const e=d.fc();d.Cb(4),d.Fc(e.selectedExercise.ID),d.Cb(4),d.Gc("",d.hc(9,5,"Tags"),": "),d.Cb(2),d.Fc(e.selectedExercise.Tags.toString()),d.Cb(3),d.lc("data",e.selectedExercise.Content)("katexOptions",e.mathOptions)}}const p=[{path:"",component:(()=>{class e{constructor(e){this.odataSvc=e,this.listPreviewObjects=[],this.mathOptions={displayMode:!0,throwOnError:!1,errorColor:"#cc0000"},this.previewIdx=-1}ngOnInit(){this.listPreviewObjects=this.odataSvc.previewObjList.slice(),this.odataSvc.previewObjList=[],this.listPreviewObjects.length>0&&(this.previewIdx=-1,this.onNextPreviewItem())}onPreviousPreviewItem(){this.previewIdx>0&&(this.previewIdx--,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}onNextPreviewItem(){this.previewIdx<this.listPreviewObjects.length&&(this.previewIdx++,this.selectedObj=this.listPreviewObjects[this.previewIdx],this.fetchPreviewItem())}get isNextPreviewButtonEnabled(){return this.previewIdx<this.listPreviewObjects.length-1}get isPreviousButtonEnabled(){return this.previewIdx>0}fetchPreviewItem(){var e,t;this.previewIdx>-1&&this.previewIdx<this.listPreviewObjects.length&&((null===(e=this.selectedObj)||void 0===e?void 0:e.refType)===b.q.KnowledgeItem?this.odataSvc.readKnowledgeItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:e=>{this.selectedKnowledge=e},error:e=>{console.error(e)}}):(null===(t=this.selectedObj)||void 0===t?void 0:t.refType)===b.q.ExerciseItem&&this.odataSvc.readExerciseItem(this.listPreviewObjects[this.previewIdx].refId).subscribe({next:e=>{this.selectedExercise=e},error:e=>{console.error(e)}}))}}return e.\u0275fac=function(t){return new(t||e)(d.Nb(l.b))},e.\u0275cmp=d.Hb({type:e,selectors:[["app-preview"]],decls:18,vars:18,consts:[[1,"button-row"],["mat-raised-button","",3,"disabled","click"],["style","margin: 8px;",4,"ngIf"],[2,"margin","8px"],[1,"control-full-width"],["emoji","","katex","",3,"data","katexOptions"]],template:function(e,t){1&e&&(d.Tb(0,"div",0),d.Tb(1,"button",1),d.bc("click",function(){return t.onPreviousPreviewItem()}),d.Ec(2),d.gc(3,"transloco"),d.Sb(),d.Tb(4,"button",1),d.bc("click",function(){return t.onNextPreviewItem()}),d.Ec(5),d.gc(6,"transloco"),d.Sb(),d.Sb(),d.Ob(7,"mat-divider"),d.Dc(8,h,14,7,"div",2),d.Dc(9,u,14,7,"div",2),d.Ob(10,"mat-divider"),d.Tb(11,"div",0),d.Tb(12,"button",1),d.bc("click",function(){return t.onPreviousPreviewItem()}),d.Ec(13),d.gc(14,"transloco"),d.Sb(),d.Tb(15,"button",1),d.bc("click",function(){return t.onNextPreviewItem()}),d.Ec(16),d.gc(17,"transloco"),d.Sb(),d.Sb()),2&e&&(d.Cb(1),d.lc("disabled",!t.isPreviousButtonEnabled),d.Cb(1),d.Fc(d.hc(3,10,"Common.Previous")),d.Cb(2),d.lc("disabled",!t.isNextPreviewButtonEnabled),d.Cb(1),d.Fc(d.hc(6,12,"Common.Next")),d.Cb(3),d.lc("ngIf",t.selectedObj&&1===t.selectedObj.refType&&t.selectedKnowledge),d.Cb(1),d.lc("ngIf",t.selectedObj&&2===t.selectedObj.refType&&t.selectedExercise),d.Cb(3),d.lc("disabled",!t.isPreviousButtonEnabled),d.Cb(1),d.Fc(d.hc(14,14,"Common.Previous")),d.Cb(2),d.lc("disabled",!t.isNextPreviewButtonEnabled),d.Cb(1),d.Fc(d.hc(17,16,"Common.Next")))},directives:[a.b,v.a,s.m,w.a],pipes:[r.d],styles:[".button-row[_ngcontent-%COMP%]{margin:auto;width:80%}.button-row[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{margin:8px}"]}),e})()}];let m=(()=>{class e{}return e.\u0275mod=d.Lb({type:e}),e.\u0275inj=d.Kb({factory:function(t){return new(t||e)},imports:[[o.d.forChild(p)],o.d]}),e})(),x=(()=>{class e{}return e.\u0275mod=d.Lb({type:e}),e.\u0275inj=d.Kb({factory:function(t){return new(t||e)},imports:[[s.c,c.h,c.r,r.c,n.a,w.b,m]]}),e})()}}]);