(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{"1Ans":function(_,e,t){"use strict";t.r(e),t.d(e,"PuzzleGameModule",function(){return R});var n=t("ofXK"),a=t("3Pt+"),i=t("QPBi"),r=t("jIBr"),l=t("tyNb"),c=t("fXoL");let o=(()=>{class _{constructor(){}ngOnInit(){}}return _.\u0275fac=function(e){return new(e||_)},_.\u0275cmp=c.Ib({type:_,selectors:[["app-puzzle-game"]],decls:2,vars:0,template:function(_,e){1&_&&(c.Ub(0,"p"),c.Dc(1,"puzzle-game works!"),c.Tb())},styles:[""]}),_})();var s=t("wSnG"),E=t("VHTt"),u=t("rCpU"),D=t("AytR"),d=t("JP0N"),O=t("0IaG");const h=["canvasgobang"];let P=(()=>{class _{constructor(_){this.dialog=_,this._cellsize=15,this._cellheight=40,this._cellwidth=40,this._userStep=!0,this._instance=new E.i}onGobangCanvasMouseDown(_){const e=Object(u.d)(_.target,_),t=Object(u.c)(e,this._cellwidth,this._cellheight);this.onProcessStep(t)}ngOnInit(){}ngAfterContentInit(){this._instance.Dimension=this._cellsize,this._instance.init(),this.canvasGobang.nativeElement.width=this._cellwidth*this._cellsize,this.canvasGobang.nativeElement.height=this._cellheight*this._cellsize,this.drawWholeRect()}drawWholeRect(){const _=this.canvasGobang.nativeElement.getContext("2d");_.clearRect(0,0,this.canvasGobang.nativeElement.width,this.canvasGobang.nativeElement.height),_.save(),_.fillStyle="rgba(0, 0, 100, 0.2)",_.fillRect(0,0,this.canvasGobang.nativeElement.width,this.canvasGobang.nativeElement.height),_.restore();for(let e=0;e<=this._cellsize;e++)_.beginPath(),_.moveTo(0,e*this._cellheight),_.lineTo(this._cellheight*this._cellsize,e*this._cellheight),_.closePath(),_.stroke(),_.beginPath(),_.moveTo(e*this._cellwidth,0),_.lineTo(e*this._cellheight,this._cellwidth*this._cellsize),_.closePath(),_.stroke()}drawChess(_){const e=this.canvasGobang.nativeElement.getContext("2d"),t=new Image;t.src=this._userStep?D.a.basehref+"assets/image/gobangresource/blackchess.png":D.a.basehref+"assets/image/gobangresource/whitechess.png",t.onload=()=>{e.drawImage(t,_.column*this._cellwidth,_.row*this._cellheight,this._cellwidth,this._cellheight)}}onProcessStep(_){if(!this._instance.Finished&&!this._instance.isCellHasValue(_.row,_.column))if(this.drawChess(_),this._instance.setCellValue(_.row,_.column,this._userStep),this._instance.Finished){let _=!1;this.dialog.open(d.a,{width:"300px",data:{youWin:!!this._userStep}}).afterClosed().subscribe(e=>{console.log(e),_=e,_?(this._userStep=!0,this._instance=new E.i,this._instance.Dimension=this._cellsize,this._instance.init(),this.canvasGobang.nativeElement.width=this._cellwidth*this._cellsize,this.canvasGobang.nativeElement.height=this._cellheight*this._cellsize,this.drawWholeRect()):this._userStep=!1})}else this._userStep=!this._userStep,!1===this._userStep&&setTimeout(()=>{const _=this._instance.workoutNextCellAIPosition();this.onProcessStep(_)},500)}}return _.\u0275fac=function(e){return new(e||_)(c.Ob(O.b))},_.\u0275cmp=c.Ib({type:_,selectors:[["app-gobang-game"]],viewQuery:function(_,e){if(1&_&&c.Hc(h,3),2&_){let _;c.sc(_=c.dc())&&(e.canvasGobang=_.first)}},hostBindings:function(_,e){1&_&&c.cc("mousedown",function(_){return e.onGobangCanvasMouseDown(_)})},decls:2,vars:0,consts:[["width","800px","height","600px"],["canvasgobang",""]],template:function(_,e){1&_&&c.Pb(0,"canvas",0,1)},styles:[""]}),_})();const M=["expword"],g=["inpword"],b=["inpword2"],C=["keyboard"];let T=(()=>{class _{constructor(){this.finishEvent=new c.o,this.expectedString="",this.inputtedString="",this.fakedContent="",this.arComparison=[],this.currHittingKeyID=""}ngOnInit(){this.inputtedString="",this.generateExpectedString(),this.updateComparison()}ngAfterViewInit(){this.inpWordER.nativeElement.addEventListener("focus",()=>{this.inpWord2ER.nativeElement.focus()}),this.inpWord2ER.nativeElement.focus()}updateComparison(_){if(_){const _=this.inputtedString.length;let e=!0;_!==this.arComparison.length&&(e=!1);for(let t=0;t<_;t++)this.arComparison[t].inputted=this.inputtedString.charAt(t),e&&this.arComparison[t].expected!==this.inputtedString.charAt(t)&&(e=!1);e&&this.finishEvent.emit(null);for(let t=_;t<this.arComparison.length;t++)this.arComparison[t].inputted="";if(null!=this.inpWordER){let _="";for(const e of this.arComparison)null!==e.inputted&&e.inputted!==e.expected?_+='<span style="color: #FF0000;">'+e.inputted+"</span>":null!==e.inputted&&(_+="<span>"+e.inputted+"</span>");this.inpWordER.nativeElement.innerHTML=_}}else if(void 0!==this.expectedString&&this.expectedString.length>0){this.arComparison=[];for(const _ of this.expectedString)this.arComparison.push({expected:_,inputted:""});if(null!=this.expWordER){let _="";for(const e of this.expectedString)_+="<span>"+e+"</span>";this.expWordER.nativeElement.innerHTML=_}}}generateExpectedString(){let _="abcdefghijklmnopqrstuvwxyz";_+="ABCDEFGHIJKLMNOPQRSTUVWXYZ",_+="0123456789",this.expectedString="";for(let e=0;e<20;e++){const e=_.charAt(Math.floor(Math.random()*_.length));this.expectedString+=e}}onPGTypingTourKeyDown(_){if(_.preventDefault&&_.preventDefault(),"Backspace"===_.key)this.inputtedString=this.inputtedString.length>=2?this.inputtedString.slice(0,length-2):"",this.updateComparison(!0);else if(-1!=="`1234567890-=~!@#$%^&*()_+[]\\{}|;':\",./<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(_.key)){if(null!=this.keyboardER){const e=this.getElementIDByKey(_.key);void 0!==e&&e.length>0&&(this.currHittingKeyID=e,this.keyboardER.nativeElement.querySelector("#"+e).classList.add("keyhitting"))}this.inputtedString=this.inputtedString+_.key,this.updateComparison(!0)}}onPGTypingTourKeyUp(_){null!=this.keyboardER&&void 0!==this.currHittingKeyID&&this.currHittingKeyID.length>0&&this.keyboardER.nativeElement.querySelector("#"+this.currHittingKeyID).classList.remove("keyhitting")}getElementIDByKey(_){return-1!=="`~".indexOf(_)?"keykeybackquote":-1!=="1!".indexOf(_)?"key1":-1!=="2@".indexOf(_)?"key2":-1!=="3#".indexOf(_)?"key3":-1!=="4$".indexOf(_)?"key4":-1!=="5%".indexOf(_)?"key5":-1!=="6^".indexOf(_)?"key6":-1!=="7&".indexOf(_)?"key7":-1!=="8*".indexOf(_)?"key8":-1!=="9(".indexOf(_)?"key9":-1!=="0)".indexOf(_)?"key0":-1!=="-_".indexOf(_)?"keyminus":-1!=="=+".indexOf(_)?"keyequal":-1!=="qQ".indexOf(_)?"keyq":-1!=="wW".indexOf(_)?"keyw":-1!=="eE".indexOf(_)?"keye":-1!=="rR".indexOf(_)?"keyr":-1!=="tT".indexOf(_)?"keyt":-1!=="Yy".indexOf(_)?"keyy":-1!=="uU".indexOf(_)?"keyu":-1!=="iI".indexOf(_)?"keyi":-1!=="oO".indexOf(_)?"keyo":-1!=="pP".indexOf(_)?"keyp":-1!=="[{".indexOf(_)?"keyleftbr":-1!=="]}".indexOf(_)?"keyrightbr":-1!=="|\\".indexOf(_)?"keybackslash":-1!=="aA".indexOf(_)?"keya":-1!=="sS".indexOf(_)?"keys":-1!=="dD".indexOf(_)?"keyd":-1!=="fF".indexOf(_)?"keyf":-1!=="gG".indexOf(_)?"keyg":-1!=="hH".indexOf(_)?"keyh":-1!=="jJ".indexOf(_)?"keyj":-1!=="kK".indexOf(_)?"keyk":-1!=="lL".indexOf(_)?"keyl":-1!==";:".indexOf(_)?"keysemicolon":-1!=="'\"".indexOf(_)?"keyquote":-1!=="zZ".indexOf(_)?"keyz":-1!=="xX".indexOf(_)?"keyx":-1!=="cC".indexOf(_)?"keyc":-1!=="vV".indexOf(_)?"keyv":-1!=="bB".indexOf(_)?"keyb":-1!=="nN".indexOf(_)?"keyn":-1!=="mM".indexOf(_)?"keym":-1!=="<,".indexOf(_)?"keycomma":-1!==">.".indexOf(_)?"keydot":-1!=="/?".indexOf(_)?"keyslash":void 0}}return _.\u0275fac=function(e){return new(e||_)},_.\u0275cmp=c.Ib({type:_,selectors:[["app-typing-game"]],viewQuery:function(_,e){if(1&_&&(c.Hc(M,3),c.Hc(g,3),c.Hc(b,3),c.Hc(C,3)),2&_){let _;c.sc(_=c.dc())&&(e.expWordER=_.first),c.sc(_=c.dc())&&(e.inpWordER=_.first),c.sc(_=c.dc())&&(e.inpWord2ER=_.first),c.sc(_=c.dc())&&(e.keyboardER=_.first)}},hostBindings:function(_,e){1&_&&c.cc("keydown",function(_){return e.onPGTypingTourKeyDown(_)})("keyup",function(_){return e.onPGTypingTourKeyUp(_)})},outputs:{finishEvent:"finishEvent"},decls:109,vars:0,consts:[[1,"demo-full-width",2,"background-color","#fffff0","color","blue"],["align","center"],["expword",""],[1,"demo-full-width",2,"background-color","#fffff0","color","black"],["align","center","contenteditable","true",2,"cursor","none"],["inpword",""],["type","number","contenteditable","true",1,"input-hidden"],["inpword2",""],[2,"border","1px dotted gray","padding","20px","width","600px","text-align","center","margin","0 auto"],["keyboard",""],[1,"m-2"],["id","keybackquote"],["id","key1"],["id","key2"],["id","key3"],["id","key4"],["id","key5"],["id","key6"],["id","key7"],["id","key8"],["id","key9"],["id","key0"],["id","keyminus"],["id","keyequal"],["id","keyq"],["id","keyw"],["id","keye"],["id","keyr"],["id","keyt"],["id","keyy"],["id","keyu"],["id","keyi"],["id","keyo"],["id","keyp"],["id","keyleftbr"],["id","keyrightbr"],["id","keybackslash"],["id","keya"],["id","keys"],["id","keyd"],["id","keyf"],["id","keyg"],["id","keyh"],["id","keyj"],["id","keyk"],["id","keyl"],["id","keysemicolon"],["id","keyquote"],["id","keyz"],["id","keyx"],["id","keyc"],["id","keyv"],["id","keyb"],["id","keyn"],["id","keym"],["id","keycomma"],["id","keydot"],["id","keyslash"]],template:function(_,e){1&_&&(c.Ub(0,"div"),c.Ub(1,"h2",0),c.Pb(2,"div",1,2),c.Tb(),c.Ub(4,"h2",3),c.Pb(5,"div",4,5),c.Pb(7,"input",6,7),c.Tb(),c.Tb(),c.Ub(9,"div",8,9),c.Ub(11,"div",10),c.Ub(12,"span",11),c.Dc(13,"`"),c.Tb(),c.Ub(14,"span",12),c.Dc(15,"1"),c.Tb(),c.Ub(16,"span",13),c.Dc(17,"2"),c.Tb(),c.Ub(18,"span",14),c.Dc(19,"3"),c.Tb(),c.Ub(20,"span",15),c.Dc(21,"4"),c.Tb(),c.Ub(22,"span",16),c.Dc(23,"5"),c.Tb(),c.Ub(24,"span",17),c.Dc(25,"6"),c.Tb(),c.Ub(26,"span",18),c.Dc(27,"7"),c.Tb(),c.Ub(28,"span",19),c.Dc(29,"8"),c.Tb(),c.Ub(30,"span",20),c.Dc(31,"9"),c.Tb(),c.Ub(32,"span",21),c.Dc(33,"0"),c.Tb(),c.Ub(34,"span",22),c.Dc(35,"-"),c.Tb(),c.Ub(36,"span",23),c.Dc(37,"="),c.Tb(),c.Tb(),c.Ub(38,"div",10),c.Ub(39,"span",24),c.Dc(40,"q"),c.Tb(),c.Ub(41,"span",25),c.Dc(42,"w"),c.Tb(),c.Ub(43,"span",26),c.Dc(44,"e"),c.Tb(),c.Ub(45,"span",27),c.Dc(46,"r"),c.Tb(),c.Ub(47,"span",28),c.Dc(48,"t"),c.Tb(),c.Ub(49,"span",29),c.Dc(50,"y"),c.Tb(),c.Ub(51,"span",30),c.Dc(52,"u"),c.Tb(),c.Ub(53,"span",31),c.Dc(54,"i"),c.Tb(),c.Ub(55,"span",32),c.Dc(56,"o"),c.Tb(),c.Ub(57,"span",33),c.Dc(58,"p"),c.Tb(),c.Ub(59,"span",34),c.Dc(60,"["),c.Tb(),c.Ub(61,"span",35),c.Dc(62,"]"),c.Tb(),c.Ub(63,"span",36),c.Dc(64,"\\"),c.Tb(),c.Tb(),c.Ub(65,"div",10),c.Ub(66,"span",37),c.Dc(67,"a"),c.Tb(),c.Ub(68,"span",38),c.Dc(69,"s"),c.Tb(),c.Ub(70,"span",39),c.Dc(71,"d"),c.Tb(),c.Ub(72,"span",40),c.Dc(73,"f"),c.Tb(),c.Ub(74,"span",41),c.Dc(75,"g"),c.Tb(),c.Ub(76,"span",42),c.Dc(77,"h"),c.Tb(),c.Ub(78,"span",43),c.Dc(79,"j"),c.Tb(),c.Ub(80,"span",44),c.Dc(81,"k"),c.Tb(),c.Ub(82,"span",45),c.Dc(83,"l"),c.Tb(),c.Ub(84,"span",46),c.Dc(85,";"),c.Tb(),c.Ub(86,"span",47),c.Dc(87,"'"),c.Tb(),c.Tb(),c.Ub(88,"div",10),c.Ub(89,"span",48),c.Dc(90,"z"),c.Tb(),c.Ub(91,"span",49),c.Dc(92,"x"),c.Tb(),c.Ub(93,"span",50),c.Dc(94,"c"),c.Tb(),c.Ub(95,"span",51),c.Dc(96,"v"),c.Tb(),c.Ub(97,"span",52),c.Dc(98,"b"),c.Tb(),c.Ub(99,"span",53),c.Dc(100,"n"),c.Tb(),c.Ub(101,"span",54),c.Dc(102,"m"),c.Tb(),c.Ub(103,"span",55),c.Dc(104,","),c.Tb(),c.Ub(105,"span",56),c.Dc(106,"."),c.Tb(),c.Ub(107,"span",57),c.Dc(108,"/"),c.Tb(),c.Tb(),c.Tb())},styles:["span[_ngcontent-%COMP%]{margin-top:5px;margin-left:5px;margin-right:5px;font-family:Courier New,monospace;font-size:20pt;padding:5px;color:#121212;background-color:ivory;border:1px solid grey;border-width:0 1px 1px 0}.m-2[_ngcontent-%COMP%]{margin:1.25rem!important}.demo-full-width[_ngcontent-%COMP%]{width:100%}.input-fail[_ngcontent-%COMP%]{color:red}input.input-hidden[_ngcontent-%COMP%]{color:#fff;opacity:0;filter:alpha(opacity=0);position:absolute;top:0}.keyhitting[_ngcontent-%COMP%]{background-color:#0dd}"]}),_})();const p=["canvassudou"];class U{constructor(){this.num=null,this.fixed=!0,this.inConflict=!1}toString(){return null==this.num?"":this.num.toString()}}function m(_,e){for(const t in e)if(e[t]===_)return!0;return!1}class I{constructor(_,e,t,n,a,i){this._nlist=[],this._x=_,this._y=e,this._itemWidth=t,this._nlist=n,this._w=3*this._itemWidth,this._h=4*this._itemWidth,this._drawX=this._x-this._w/2,this._drawY=this._y-this._h/2,this._drawX<0&&(this._drawX=0),this._drawY<0&&(this._drawY=0),this._drawX+this._w>a&&(this._drawX=a-this._w),this._drawY+this._h>i&&(this._drawY=i-this._h)}Draw(_){_.fillStyle="pink",_.fillRect(this._drawX,this._drawY,this._w,this._h),_.strokeStyle="#000000",_.lineWidth=2,_.strokeRect(this._drawX,this._drawY,this._w,this._h),_.strokeStyle="#000000",_.lineWidth=1;for(let e=1;e<=E.r;e++){const t=this._drawX+(e-1)%3*this._itemWidth,n=this._drawY+Math.floor((e-1)/3)*this._itemWidth;_.strokeStyle="#000000",_.strokeRect(t,n,this._itemWidth,this._itemWidth),m(e,this._nlist)&&(_.fillStyle="green",_.font="Bold "+this._itemWidth/2+"px Arial",_.fillText(e.toString(),t+this._itemWidth/3,n+this._itemWidth/1.5))}}GetHitNumber(_,e){const t=Math.floor((_-this._drawX)/this._itemWidth),n=Math.floor((e-this._drawY)/this._itemWidth);if(t<0||t>2||n<0||n>3)return-1;if(3===n)return null;const a=3*n+t+1;return m(a,this._nlist)?a:null}}const f=[{path:"",component:o},{path:"cal24",component:s.a},{path:"gobang",component:P},{path:"typegame",component:T},{path:"sudou",component:(()=>{class _{constructor(_){this.dialog=_,this._objSudou=null,this._width=0,this._height=0,this._editingCellIndex=null,this._editPanel=null,this._dataCells=[],this._started=!1}ngOnInit(){this._started=!0,this._objSudou=Object(E.w)()}ngAfterContentInit(){this._width=this.canvasSudou.nativeElement.width,this._height=this.canvasSudou.nativeElement.height,this._itemWidth=this._width/E.r,this._itemHeight=this._height/E.r,this.onStartCore()}ngOnDestroy(){}onStartCore(){if(this._started&&null!=this._objSudou){const _=this._objSudou.getDataCells();this._dataCells=[];for(let e=0;e<E.r;e++){const _=[];for(let e=0;e<E.r;e++)_.push(0);this._dataCells.push(_)}for(let e=0;e<E.r;e++)for(let t=0;t<E.r;t++){const n=new U;6*Math.random()<2?(n.fixed=!1,n.num=null):(n.fixed=!0,n.num=_[e][t]),n.exp_num=_[e][t],this._dataCells[e][t]=n}this.onDraw()}}onDraw(){const _=this.canvasSudou.nativeElement.getContext("2d");_.fillStyle="#ffffff",_.fillRect(0,0,this._width,this._height),_.font="Bold "+this._itemWidth/1.5+"px Roboto";for(let e=0;e<E.r;e++)for(let t=0;t<E.r;t++){const n=this._dataCells[e][t];n.fixed&&(_.fillStyle="#dddddd",_.fillRect(t*this._itemWidth,e*this._itemHeight,this._itemWidth,this._itemHeight)),_.fillStyle="#008800",null===n.num||(_.fillStyle=n.inConflict?"red":n.fixed?"#000000":"#008800",_.fillText(n.num.toString(),(t+.3)*this._itemWidth,(e+.8)*this._itemHeight))}_.lineWidth=1,_.strokeStyle="#000000";for(let e=0;e<10;e++)_.lineWidth=e%3==0?3:1,_.beginPath(),_.moveTo(e*this._itemWidth,0),_.lineTo(e*this._itemWidth,this._height),_.moveTo(0,e*this._itemHeight),_.lineTo(this._width,e*this._itemHeight),_.stroke()}onSudouCanvasMouseDown(_){}onSudouCanvasMouseUp(_){const e=Object(u.d)(_.target,_);this.ProcessMouseClick(e)}ProcessMouseClick(_){if(null===this._editingCellIndex){const e=Object(u.c)(_,this._itemWidth,this._itemHeight);if(e.row<0||e.row>8||e.column<0||e.column>8)return this._editingCellIndex=null,this._editPanel=null,void this.onDraw();if(!0===this._dataCells[e.row][e.column].fixed)return this._editingCellIndex=null,this._editPanel=null,void this.onDraw();this._editingCellIndex=e,this._editPanel=new I(_.x,_.y,this._itemWidth/1.5,[1,2,3,4,5,6,7,8,9],this._width,this._height);const t=this.canvasSudou.nativeElement.getContext("2d");this._editPanel.Draw(t)}else{const e=this._editPanel.GetHitNumber(_.x,_.y);if(null==e)this._dataCells[this._editingCellIndex.row][this._editingCellIndex.column].N=null;else{if(-1===e)return this._editingCellIndex=null,this._editPanel=null,this.onDraw(),void this.ProcessMouseClick(_);this._dataCells[this._editingCellIndex.row][this._editingCellIndex.column].num=e}if(this._editingCellIndex=null,this._editPanel=null,this.checkAllConflicts(),this.onDraw(),this.checkFinish()){let _=!1;this.dialog.open(d.a,{width:"300px",data:{youWin:!0}}).afterClosed().subscribe(e=>{console.log(e),_=e,_?(this._started=!0,this._objSudou=Object(E.w)(),this.onStartCore()):this._started=!1})}}}checkFinish(){this.checkAllConflicts();for(let _=0;_<E.r;_++)for(let e=0;e<E.r;e++)if(null===this._dataCells[_][e].num||this._dataCells[_][e].InConflict)return!1;return!0}checkAllConflicts(){for(let _=0;_<E.r;_++)for(let e=0;e<E.r;e++)this._dataCells[_][e].inConflict=this.checkConflict({row:_,column:e})}checkConflict(_){const e=this._dataCells[_.row][_.column];if(null==e.num)return!1;for(let a=0;a<E.r;a++)if(this._dataCells[_.row][a].num===e.num&&a!==_.column)return!0;for(let a=0;a<E.r;a++)if(this._dataCells[a][_.column].num===e.num&&a!==_.row)return!0;const t=3*Math.floor(_.row/3),n=3*Math.floor(_.column/3);for(let a=t;a<t+3;a++)for(let t=n;t<n+3;t++)if(this._dataCells[a][t].num===e.num&&a!==_.row&&t!==_.column)return!0;return!1}}return _.\u0275fac=function(e){return new(e||_)(c.Ob(O.b))},_.\u0275cmp=c.Ib({type:_,selectors:[["app-sudou"]],viewQuery:function(_,e){if(1&_&&c.Hc(p,3),2&_){let _;c.sc(_=c.dc())&&(e.canvasSudou=_.first)}},hostBindings:function(_,e){1&_&&c.cc("mousedown",function(_){return e.onSudouCanvasMouseDown(_)})("mouseup",function(_){return e.onSudouCanvasMouseUp(_)})},decls:3,vars:0,consts:[[2,"text-align","center","margin","0 auto","border","1px"],["width","640px","height","640px"],["canvassudou",""]],template:function(_,e){1&_&&(c.Ub(0,"div",0),c.Pb(1,"canvas",1,2),c.Tb())},styles:[""]}),_})()}];let W=(()=>{class _{}return _.\u0275fac=function(e){return new(e||_)},_.\u0275mod=c.Mb({type:_}),_.\u0275inj=c.Lb({imports:[[l.d.forChild(f)],l.d]}),_})(),R=(()=>{class _{}return _.\u0275fac=function(e){return new(e||_)},_.\u0275mod=c.Mb({type:_}),_.\u0275inj=c.Lb({imports:[[n.c,r.a,W,i.c,a.h]]}),_})()},JP0N:function(_,e,t){"use strict";t.d(e,"a",function(){return c});var n=t("0IaG"),a=t("fXoL"),i=t("bSwM"),r=t("3Pt+"),l=t("bTqV");let c=(()=>{class _{constructor(_,e){this.dialogRef=_,this.data=e}onNoClick(){this.dialogRef.close()}}return _.\u0275fac=function(e){return new(e||_)(a.Ob(n.g),a.Ob(n.a))},_.\u0275cmp=a.Ib({type:_,selectors:[["app-result-dialog"]],decls:12,vars:3,consts:[["mat-dialog-title",""],["mat-dialog-content",""],[3,"ngModel","ngModelChange"],["mat-dialog-actions",""],["mat-button","",3,"click"],["mat-button","","cdkFocusInitial","",3,"mat-dialog-close"]],template:function(_,e){1&_&&(a.Ub(0,"h1",0),a.Dc(1),a.Tb(),a.Ub(2,"div",1),a.Ub(3,"p"),a.Dc(4,"What's your next step?"),a.Tb(),a.Ub(5,"mat-checkbox",2),a.cc("ngModelChange",function(_){return e.data.haveAnotherTry=_}),a.Dc(6," Have another try? "),a.Tb(),a.Tb(),a.Ub(7,"div",3),a.Ub(8,"button",4),a.cc("click",function(){return e.onNoClick()}),a.Dc(9,"No Thanks"),a.Tb(),a.Ub(10,"button",5),a.Dc(11,"Ok"),a.Tb(),a.Tb()),2&_&&(a.Db(1),a.Fc(" ",e.data.youWin?"You Win":"You Lost","\n"),a.Db(4),a.mc("ngModel",e.data.haveAnotherTry),a.Db(5),a.mc("mat-dialog-close",e.data.haveAnotherTry))},directives:[n.h,n.e,i.a,r.m,r.p,n.c,l.b,n.d],styles:[""]}),_})()},wSnG:function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.d(__webpack_exports__,"a",function(){return Calculate24Component});var _result_dialog_result_dialog_component__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("JP0N"),_angular_core__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("fXoL"),_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("0IaG"),_angular_material_card__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("Wp6s"),_angular_material_button__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__("bTqV"),_angular_common__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__("ofXK"),_angular_material_form_field__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__("kmnG"),_angular_material_input__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__("qFsG"),_angular_forms__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__("3Pt+"),_ngneat_transloco__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__("QPBi");function Calculate24Component_div_45_span_2_span_2_Template(_,e){1&_&&(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(0,"span"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(1,","),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb())}function Calculate24Component_div_45_span_2_Template(_,e){if(1&_&&(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(0,"span"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Cc(2,Calculate24Component_div_45_span_2_span_2_Template,2,0,"span",11),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb()),2&_){const _=e.$implicit,t=e.index,n=_angular_core__WEBPACK_IMPORTED_MODULE_1__.gc(2);_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("ngIf",t!==n.Cal24items.length-1)}}function Calculate24Component_div_45_Template(_,e){if(1&_){const _=_angular_core__WEBPACK_IMPORTED_MODULE_1__.Vb();_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(0,"div",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(1,"h2",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Cc(2,Calculate24Component_div_45_span_2_Template,3,2,"span",8),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(3,"h2",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(4,"p",9),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(5),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(6,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(7,"div",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(8,"mat-form-field"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(9,"input",10),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("ngModelChange",function(e){return _angular_core__WEBPACK_IMPORTED_MODULE_1__.vc(_),_angular_core__WEBPACK_IMPORTED_MODULE_1__.gc().Cal24Input=e}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(10,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb()}if(2&_){const _=_angular_core__WEBPACK_IMPORTED_MODULE_1__.gc();_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("ngForOf",_.Cal24items),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Fc(" ",_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(6,4,"PuzzleGames.Cal24Detail")," "),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(4),_angular_core__WEBPACK_IMPORTED_MODULE_1__.nc("placeholder",_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(10,6,"PuzzleGames.Calculate24")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("ngModel",_.Cal24Input)}}function Calculate24Component_button_53_Template(_,e){if(1&_){const _=_angular_core__WEBPACK_IMPORTED_MODULE_1__.Vb();_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(0,"button",12),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return _angular_core__WEBPACK_IMPORTED_MODULE_1__.vc(_),_angular_core__WEBPACK_IMPORTED_MODULE_1__.gc().OnCal24Surrender()}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(2,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb()}2&_&&(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(2,1,"PuzzleGames.Surrender")))}let Calculate24Component=(()=>{class Calculate24Component{constructor(_){this.dialog=_,this.isStarted=!1,this.Cal24Input="",this.Cal24items=[],this.Cal24NumberRangeBgn=1,this.Cal24NumberRangeEnd=9,this.Cal24SurrendString=""}ngOnInit(){}CanCal24Start(){return!this.isStarted}IsButtonDisabled(_){return!this.isStarted||!this.Cal24items.includes(_)}OnCal24Start(){for(this.Cal24Input="",this.Cal24items=[];this.Cal24items.length<4;){const _=Math.floor(Math.random()*(this.Cal24NumberRangeEnd-this.Cal24NumberRangeBgn))+this.Cal24NumberRangeBgn;-1===this.Cal24items.findIndex(e=>e===_)&&this.Cal24items.push(_)}this.isStarted=!0}CanCal24Submit(){return!(!this.isStarted||this.Cal24Input.length<=0)}OnCal24Append(_){this.Cal24Input+=_}OnCal24Backspace(){this.Cal24Input=this.Cal24Input.length>1?this.Cal24Input.substring(0,this.Cal24Input.length-1):""}OnCal24Reset(){this.Cal24Input=""}OnCal24Submit(){let rst=0,errmsg="";try{let realstring=this.Cal24Input.replace("\xd7","*");realstring=realstring.replace("\xf7","/"),rst=eval(realstring)}catch(exp){errmsg=exp.toString()}let retry=!1,isWin=!1;24!==rst||(isWin=!0);const dialogRef=this.dialog.open(_result_dialog_result_dialog_component__WEBPACK_IMPORTED_MODULE_0__.a,{width:"300px",data:{youWin:isWin}});dialogRef.afterClosed().subscribe(_=>{console.log(_),retry=_,retry?this.OnCal24Start():this.isStarted=!1})}OnCal24Surrender(){}}return Calculate24Component.\u0275fac=function(_){return new(_||Calculate24Component)(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ob(_angular_material_dialog__WEBPACK_IMPORTED_MODULE_2__.b))},Calculate24Component.\u0275cmp=_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ib({type:Calculate24Component,selectors:[["app-calculate24"]],decls:54,vars:36,consts:[[1,"control-full-width"],["cal24btntbr",""],["mat-mini-fab","","color","primary",3,"disabled","click"],["mat-mini-fab","","color","accent",3,"disabled","click"],["mat-raised-button","","color","warn",3,"disabled","click"],["class","control-full-width",4,"ngIf"],["mat-button","",3,"disabled","click"],["mat-raised-button","",3,"click",4,"ngIf"],[4,"ngFor","ngForOf"],[1,"lead"],["matInput","","type","text","name","cal24inp","readonly","","required","",3,"placeholder","ngModel","ngModelChange"],[4,"ngIf"],["mat-raised-button","",3,"click"]],template:function(_,e){1&_&&(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(0,"mat-card",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(1,"mat-card-header"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(2,"mat-card-title"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(4,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(5,"mat-card-content"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(6,"div",0),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(7,"div",null,1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(9,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("1")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(10,"1"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(11,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("2")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(12,"2"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(13,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("3")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(14,"3"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(15,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("4")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(16,"4"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(17,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("5")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(18,"5"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(19,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("6")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(20,"6"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(21,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("7")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(22,"7"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(23,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("8")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(24,"8"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(25,"button",2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("9")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(26,"9"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(27,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("+")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(28,"+"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(29,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("-")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(30,"-"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(31,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("\xd7")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(32,"\xd7"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(33,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("\xf7")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(34,"\xf7"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(35,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append("(")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(36,"("),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(37,"button",3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Append(")")}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(38,")"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(39,"button",4),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Backspace()}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(40),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(41,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(42,"button",4),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Reset()}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(43),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(44,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Cc(45,Calculate24Component_div_45_Template,11,8,"div",5),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(46,"mat-card-actions"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(47,"button",6),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Start()}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(48),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(49,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ub(50,"button",6),_angular_core__WEBPACK_IMPORTED_MODULE_1__.cc("click",function(){return e.OnCal24Submit()}),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Dc(51),_angular_core__WEBPACK_IMPORTED_MODULE_1__.hc(52,"transloco"),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Cc(53,Calculate24Component_button_53_Template,3,3,"button",7),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb(),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Tb()),2&_&&(_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(3),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(4,26,"PuzzleGames.Calculate24")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(6),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(1)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(2)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(3)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(4)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(5)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(6)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(7)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(8)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.IsButtonDisabled(9)),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(41,28,"Common.Backspace")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(44,30,"Common.Reset")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("ngIf",e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",e.isStarted),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(49,32,"Common.Start")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("disabled",!e.CanCal24Submit()),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(1),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Ec(_angular_core__WEBPACK_IMPORTED_MODULE_1__.ic(52,34,"Common.Submit")),_angular_core__WEBPACK_IMPORTED_MODULE_1__.Db(2),_angular_core__WEBPACK_IMPORTED_MODULE_1__.mc("ngIf",e.isStarted))},directives:[_angular_material_card__WEBPACK_IMPORTED_MODULE_3__.a,_angular_material_card__WEBPACK_IMPORTED_MODULE_3__.d,_angular_material_card__WEBPACK_IMPORTED_MODULE_3__.g,_angular_material_card__WEBPACK_IMPORTED_MODULE_3__.c,_angular_material_button__WEBPACK_IMPORTED_MODULE_4__.b,_angular_common__WEBPACK_IMPORTED_MODULE_5__.m,_angular_material_card__WEBPACK_IMPORTED_MODULE_3__.b,_angular_common__WEBPACK_IMPORTED_MODULE_5__.l,_angular_material_form_field__WEBPACK_IMPORTED_MODULE_6__.c,_angular_material_input__WEBPACK_IMPORTED_MODULE_7__.b,_angular_forms__WEBPACK_IMPORTED_MODULE_8__.c,_angular_forms__WEBPACK_IMPORTED_MODULE_8__.s,_angular_forms__WEBPACK_IMPORTED_MODULE_8__.m,_angular_forms__WEBPACK_IMPORTED_MODULE_8__.p],pipes:[_ngneat_transloco__WEBPACK_IMPORTED_MODULE_9__.d],styles:[".control-full-width[_ngcontent-%COMP%]{width:100%}"]}),Calculate24Component})()}}]);