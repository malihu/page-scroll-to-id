/*
== Page scroll to id == 
Version: 1.5.1 
Plugin URI: http://manos.malihu.gr/page-scroll-to-id/
Author: malihu
Author URI: http://manos.malihu.gr
License: MIT License (MIT)
*/

/*
Copyright 2013  malihu  (email: manos@malihu.gr)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

;(function($,window,document,undefined){
	
	/* plugin namespace, prefix, default selector(s) */
	
	var pluginNS="mPageScroll2id",
		pluginPfx="mPS2id",
		defaultSelector=".m_PageScroll2id,a[rel~='m_PageScroll2id'],.page-scroll-to-id,a[rel~='page-scroll-to-id']",
	
	/* default options */
	
		defaults={
			/* scroll animation speed in milliseconds: Integer */
			scrollSpeed:1300,
			/* auto-adjust animation speed (according to target element position and window scroll): Boolean */
			autoScrollSpeed:true,
			/* scroll animation easing when page is idle: String */
			scrollEasing:"easeInOutExpo",
			/* scroll animation easing while page is scrolling: String */
			scrollingEasing:"easeInOutCirc",
			/* end of page "smooth scrolling" (auto-adjust the scroll-to position when bottom elements are too short): Boolean */
			pageEndSmoothScroll:true,
			/* 
			page layout defines scrolling direction: String 
			values: "vertical", "horizontal", "auto" 
			*/
			layout:"vertical",
			/* extra space in pixels for the target element position: Integer */
			offset:0,
			/* highlight the main/default selectors or insert a different set: Boolean, String */
			highlightSelector:false,
			/* class of the clicked element: String */
			clickedClass:pluginPfx+"-clicked",
			/* class of the current target element: String */
			targetClass:pluginPfx+"-target",
			/* class of the highlighted element: String */
			highlightClass:pluginPfx+"-highlight",
			/* force a single highlighted element each time: Boolean */
			forceSingleHighlight:false,
			/* enable/disable click events for all selectors */
			clickEvents:true,
			/* user callback functions: fn */
			onStart:function(){},
			onComplete:function(){},
			/* enable/disable the default selector: Boolean */
			defaultSelector:false
		},
	
	/* vars, constants */
	
		selector,opt,_init,_trigger,_clicked,_target,_to,_axis,_offset,_dataOffset,
	
	/* 
	---------------
	methods 
	---------------
	*/
	
		methods={
			
			/* plugin initialization method */
			
			init:function(options){
				
				/* extend options, store each option in jquery data */
				
				var options=$.extend(true,{},defaults,options);
				
				$(document).data(pluginPfx,options);
				opt=$(document).data(pluginPfx);
				
				/* set default selector */
						
				selector=(!selector) ? this.selector : selector+","+this.selector;
				
				if(opt.defaultSelector){
					if(typeof $(selector)!=="object" || $(selector).length===0){
						selector=defaultSelector;
					}
				}
				
				/* plugin events */
				
				if(opt.clickEvents){
					$(document)
					
					.undelegate("."+pluginPfx)
					
					.delegate(selector,"click."+pluginPfx,function(e){
						var $this=$(this),
							href=$this.attr("href"),
							hrefProp=$this.prop("href");
						if(href && href.indexOf("#/")!==-1){
							return;
						}
						functions._reset.call(null);
						_dataOffset=$this.data("ps2id-offset") || 0;
						if(functions._isValid.call(null,href,hrefProp) && functions._findTarget.call(null,href)){
							e.preventDefault();
							_trigger="selector";
							_clicked=$this;
							functions._setClasses.call(null,true);
							functions._scrollTo.call(null);
						}
					});
				}
				
				$(window)
				
				.unbind("."+pluginPfx)
				
				.bind("scroll."+pluginPfx+" resize."+pluginPfx,function(){
					var targets=$("._"+pluginPfx+"-t");
					targets.each(function(){
						var t=$(this),id=t.attr("id"),
							h=functions._findHighlight.call(null,id);
						functions._setClasses.call(null,false,t,h);
					});
				});
				
				/* plugin has initialized */
				
				_init=true;
				
				/* setup selectors, target elements, basic plugin classes etc. */
				
				functions._setup.call(null);
			},
			
			/* scrollTo method */
			
			scrollTo:function(id,options){
				if(id && typeof id!=="undefined"){
					functions._isInit.call(null);
					var defaults={
							layout:opt.layout,
							offset:opt.offset,
							clicked:false
						},
						options=$.extend(true,{},defaults,options);
					functions._reset.call(null);
					_axis=options.layout;
					_offset=options.offset;
					id=(id.indexOf("#")!==-1) ? id : "#"+id;
					if(functions._isValid.call(null,id) && functions._findTarget.call(null,id)){
						_trigger="scrollTo";
						_clicked=options.clicked;
						if(_clicked){
							functions._setClasses.call(null,true);
						}
						functions._scrollTo.call(null);
					}
				}
			},
			
			/* destroy method */
			
			destroy:function(){
				$(window).unbind("."+pluginPfx);
				$(document).undelegate("."+pluginPfx).removeData(pluginPfx);
				$("."+opt.clickedClass).removeClass(opt.clickedClass);
				$("."+opt.targetClass).removeClass(opt.targetClass);
				$("."+opt.highlightClass).removeClass(opt.highlightClass);
				$("._"+pluginPfx+"-t").removeData(pluginPfx).removeClass("_"+pluginPfx+"-t");
				$("._"+pluginPfx+"-h").removeClass("_"+pluginPfx+"-h");
			}
		},
	
	/* 
	---------------
	functions
	---------------
	*/
	
		functions={
			
			/* checks if href attribute is valid */
			
			_isValid:function(href,hrefProp){
				if(!href){
					return;
				}
				hrefProp=(!hrefProp) ? href : hrefProp;
				var str=(hrefProp.indexOf("#/")!==-1) ? hrefProp.split("#/")[0] : hrefProp.split("#")[0],
					loc=window.location.toString().split("#")[0];
				return href!=="#" && href.indexOf("#")!==-1 && (str==="" || str===loc);
			},
			
			/* setup selectors, target elements, basic plugin classes etc. */
			
			_setup:function(){
				var el=(opt.highlightSelector && opt.highlightSelector!=="") ? opt.highlightSelector : selector,i=1;
				return $(el).each(function(){
					var $this=$(this),href=$this.attr("href"),hrefProp=$this.prop("href");
					if(functions._isValid.call(null,href,hrefProp)){
						var id=(href.indexOf("#/")!==-1) ? href.split("#/")[1] : href.split("#")[1],t=$("#"+id); 
						if(t.length>0){
							if(!t.hasClass("_"+pluginPfx+"-t")){
								t.addClass("_"+pluginPfx+"-t").data(pluginPfx,{i:i});
							}
							if(!$this.hasClass("_"+pluginPfx+"-h")){
								$this.addClass("_"+pluginPfx+"-h");
							}
							var h=functions._findHighlight.call(null,id);
							functions._setClasses.call(null,false,t,h);
							i++
						}
					}
				});
			},
			
			/* finds the target element */
			
			_findTarget:function(str){
				var val=(str.indexOf("#/")!==-1) ? str.split("#/")[1] : str.split("#")[1], 
					el=$("#"+val);
				if(el.length<1 || el.css("position")==="fixed"){
					if(val==="top"){
						el=$("body");
					}else{
						return;
					}
				}
				_target=el;
				if(!_axis){
					_axis=opt.layout;
				}
				_offset=functions._setOffset.call(null);
				_to=[(el.offset().top-_offset[0]).toString(),(el.offset().left-_offset[1]).toString()]; 
				_to[0]=(_to[0]<0) ? 0 : _to[0];
				_to[1]=(_to[1]<0) ? 0 : _to[1];
				return _to;
			},
			
			/* sets the offset value (pixels, objects etc.) */
			
			_setOffset:function(){
				if(!_offset){
					_offset=(opt.offset) ? opt.offset : 0;
				}
				if(_dataOffset){
					_offset=_dataOffset;
				}
				var val,obj,y,x;
				switch(typeof _offset){
					case "object":
					case "string":
						val=[(_offset["y"]) ? _offset["y"] : _offset,(_offset["x"]) ? _offset["x"] : _offset];
						obj=[(val[0] instanceof jQuery) ? val[0] : $(val[0]),(val[1] instanceof jQuery) ? val[1] : $(val[1])];
						if(obj[0].length>0){ // js/jquery object
							y=obj[0].height();
							if(obj[0].css("position")==="fixed"){ // include position for fixed elements
								y+=obj[0][0].offsetTop;
							}
						}else if(!isNaN(parseFloat(val[0])) && isFinite(val[0])){ // numeric string
							y=parseInt(val[0]);
						}else{
							y=0; // non-existing value
						}
						if(obj[1].length>0){ // js/jquery object
							x=obj[1].width();
							if(obj[1].css("position")==="fixed"){ // include position for fixed elements
								x+=obj[1][0].offsetLeft;
							}
						}else if(!isNaN(parseFloat(val[1])) && isFinite(val[1])){ // numeric string
							x=parseInt(val[1]);
						}else{
							x=0; // non-existing value
						}
						break;
					case "function":
						val=_offset.call(null); // function (single value or array)
						if(val instanceof Array){
							y=val[0];
							x=val[1];
						}else{
							y=x=val;
						}
						break;
					default:
						y=x=parseInt(_offset); // number
				}
				return [y,x];
			},
			
			/* finds the element that should be highlighted */
			
			_findHighlight:function(id){
				var loc=window.location.toString().split("#")[0],
					hHash=$("._"+pluginPfx+"-h[href='#"+id+"']"),
					lhHash=$("._"+pluginPfx+"-h[href='"+loc+"#"+id+"']"),
					hHashSlash=$("._"+pluginPfx+"-h[href='#/"+id+"']"),
					lhHashSlash=$("._"+pluginPfx+"-h[href='"+loc+"#/"+id+"']");
				hHash=(hHash.length>0) ? hHash : lhHash;
				hHashSlash=(hHashSlash.length>0) ? hHashSlash : lhHashSlash;
				return (hHashSlash.length>0) ? hHashSlash : hHash;
			},
			
			/* sets plugin classes */
			
			_setClasses:function(c,t,h){
				var cc=opt.clickedClass,tc=opt.targetClass,hc=opt.highlightClass;
				if(c && cc && cc!==""){
					$("."+cc).removeClass(cc);
					_clicked.addClass(cc);
				}else if(t && tc && tc!=="" && h && hc && hc!==""){
					if(functions._currentTarget.call(null,t)){
						if(opt.forceSingleHighlight){
							$("."+hc).removeClass(hc);
						}
						t.addClass(tc);
						h.addClass(hc);
					}else{
						t.removeClass(tc);
						h.removeClass(hc);
					}
				}
			},
			
			/* checks if target element is in viewport */
			
			_currentTarget:function(t){
				var o=opt["target_"+t.data(pluginPfx).i],
					rect=t[0].getBoundingClientRect();
				if(typeof o!=="undefined"){
					var y=t.offset().top,x=t.offset().left,
						from=(o.from) ? o.from+y : y,to=(o.to) ? o.to+y : y,
						fromX=(o.fromX) ? o.fromX+x : x,toX=(o.toX) ? o.toX+x : x;
					return(
						rect.top >= to && rect.top <= from && 
						rect.left >= toX && rect.left <= fromX
					);
				}else{
					var wh=$(window).height(),ww=$(window).width(),
						th=t.height(),tw=t.width(),
						base=1+(th/wh),
						top=base,bottom=(th<wh) ? base*(wh/th) : base,
						baseX=1+(tw/ww),
						left=baseX,right=(tw<ww) ? baseX*(ww/tw) : baseX;
					return(
						rect.top <= wh/top && rect.bottom >= wh/bottom && 
						rect.left <= ww/left && rect.right >= ww/right
					);
				}
			},
			
			/* scrolls the page */
			
			_scrollTo:function(){
				opt.scrollSpeed=parseInt(opt.scrollSpeed);
				_to=(opt.pageEndSmoothScroll) ? functions._pageEndSmoothScroll.call(null) : _to;
				var el=$("html,body"),
					speed=(opt.autoScrollSpeed) ? functions._autoScrollSpeed.call(null) : opt.scrollSpeed,
					easing=(el.is(":animated")) ? opt.scrollingEasing : opt.scrollEasing,
					_t=$(window).scrollTop(),_l=$(window).scrollLeft();
				switch(_axis){
					case "horizontal":
						if(_l!=_to[1]){
							functions._callbacks.call(null,"onStart");
							el.stop().animate({scrollLeft:_to[1]},speed,easing).promise().then(function(){
								functions._callbacks.call(null,"onComplete");
							});
						}
						break;
					case "auto":
						if(_t!=_to[0] || _l!=_to[1]){
							functions._callbacks.call(null,"onStart");
							if(navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)){ // mobile fix
								var left;
								el.stop().animate({pageYOffset:_to[0],pageXOffset:_to[1]},{
								    duration:speed,
								    easing:easing,
								    step:function(now,fx){
								        if(fx.prop=='pageXOffset'){
								            left=now;
								        }else if(fx.prop=='pageYOffset'){
								            window.scrollTo(left,now);
								        }
								    }
								}).promise().then(function(){
									functions._callbacks.call(null,"onComplete");
								});
							}else{
								el.stop().animate({scrollTop:_to[0],scrollLeft:_to[1]},speed,easing).promise().then(function(){
									functions._callbacks.call(null,"onComplete");
								});
							}
						}
						break;
					default:
						if(_t!=_to[0]){
							functions._callbacks.call(null,"onStart");
							el.stop().animate({scrollTop:_to[0]},speed,easing).promise().then(function(){
								functions._callbacks.call(null,"onComplete");
							});
						}
				}
			},
			
			/* sets end of page "smooth scrolling" position */
			
			_pageEndSmoothScroll:function(){
				var _dh=$(document).height(),_dw=$(document).width(),
					_wh=$(window).height(),_ww=$(window).width();
				return [((_dh-_to[0])<_wh) ? _dh-_wh : _to[0],((_dw-_to[1])<_ww) ? _dw-_ww : _to[1]];
			},
			
			/* sets the auto-adjusted animation speed */
			
			_autoScrollSpeed:function(){
				var _t=$(window).scrollTop(),_l=$(window).scrollLeft(),
					_h=$(document).height(),_w=$(document).width(),
					val=[
						opt.scrollSpeed+((opt.scrollSpeed*(Math.floor((Math.abs(_to[0]-_t)/_h)*100)))/100),
						opt.scrollSpeed+((opt.scrollSpeed*(Math.floor((Math.abs(_to[1]-_l)/_w)*100)))/100)
					];
				return Math.max.apply(Math,val);
			},
			
			/* user callback functions */
			
			_callbacks:function(c){
				if(!opt){
					return;
				}
				this[pluginPfx]={
					trigger:_trigger,clicked:_clicked,target:_target,scrollTo:{y:_to[0],x:_to[1]}
				};
				switch(c){
					case "onStart":
						opt.onStart.call(null,this[pluginPfx]);
						break;
					case "onComplete":
						opt.onComplete.call(null,this[pluginPfx]);
						break;
				}
			},
			
			/* resets/clears vars and constants */
			
			_reset:function(){
				_axis=_offset=_dataOffset=false;
			},
			
			/* checks if plugin has initialized */
			
			_isInit:function(){
				if(!_init){
					methods.init.apply(this);
				}
			},
			
			/* extends jquery with custom easings (as jquery ui) */
			
			_easing:function(){
				$.easing.easeInQuad=$.easing.easeInQuad || 
					function(x,t,b,c,d){return c*(t/=d)*t + b;};	
				$.easing.easeOutQuad=$.easing.easeOutQuad || 
					function(x,t,b,c,d){return -c *(t/=d)*(t-2) + b;};
				$.easing.easeInOutQuad=$.easing.easeInOutQuad || 
					function(x,t,b,c,d){
						if ((t/=d/2) < 1) return c/2*t*t + b;
						return -c/2 * ((--t)*(t-2) - 1) + b;
					};
				$.easing.easeInCubic=$.easing.easeInCubic || 
					function(x,t,b,c,d){return c*(t/=d)*t*t + b;};
				$.easing.easeOutCubic=$.easing.easeOutCubic || 
					function(x,t,b,c,d){return c*((t=t/d-1)*t*t + 1) + b;};
				$.easing.easeInOutCubic=$.easing.easeInOutCubic || 
					function(x,t,b,c,d){
						if ((t/=d/2) < 1) return c/2*t*t*t + b;
						return c/2*((t-=2)*t*t + 2) + b;
					};
				$.easing.easeInQuart=$.easing.easeInQuart || 
					function(x,t,b,c,d){return c*(t/=d)*t*t*t + b;};
				$.easing.easeOutQuart=$.easing.easeOutQuart || 
					function(x,t,b,c,d){return -c * ((t=t/d-1)*t*t*t - 1) + b;};
				$.easing.easeInOutQuart=$.easing.easeInOutQuart || 
					function(x,t,b,c,d){
						if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
						return -c/2 * ((t-=2)*t*t*t - 2) + b;
					};
				$.easing.easeInQuint=$.easing.easeInQuint || 
					function(x,t,b,c,d){return c*(t/=d)*t*t*t*t + b;};
				$.easing.easeOutQuint=$.easing.easeOutQuint || 
					function(x,t,b,c,d){return c*((t=t/d-1)*t*t*t*t + 1) + b;};
				$.easing.easeInOutQuint=$.easing.easeInOutQuint || 
					function(x,t,b,c,d){
						if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
						return c/2*((t-=2)*t*t*t*t + 2) + b;
					};
				$.easing.easeInExpo=$.easing.easeInExpo || 
					function(x,t,b,c,d){return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;};
				$.easing.easeOutExpo=$.easing.easeOutExpo || 
					function(x,t,b,c,d){return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;};
				$.easing.easeInOutExpo=$.easing.easeInOutExpo || 
					function(x,t,b,c,d){
						if (t==0) return b;
						if (t==d) return b+c;
						if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
						return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
					};
				$.easing.easeInSine=$.easing.easeInSine || 
					function(x,t,b,c,d){return -c * Math.cos(t/d * (Math.PI/2)) + c + b;};
				$.easing.easeOutSine=$.easing.easeOutSine || 
					function(x,t,b,c,d){return c * Math.sin(t/d * (Math.PI/2)) + b;};
				$.easing.easeInOutSine=$.easing.easeInOutSine || 
					function(x,t,b,c,d){return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;};
				$.easing.easeInCirc=$.easing.easeInCirc || 
					function(x,t,b,c,d){return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;};
				$.easing.easeOutCirc=$.easing.easeOutCirc || 
					function(x,t,b,c,d){return c * Math.sqrt(1 - (t=t/d-1)*t) + b;};
				$.easing.easeInOutCirc=$.easing.easeInOutCirc || 
					function(x,t,b,c,d){
						if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
						return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
					};
				$.easing.easeInElastic=$.easing.easeInElastic || 
					function(x,t,b,c,d){
						var s=1.70158;var p=0;var a=c;
						if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
						if (a < Math.abs(c)) { a=c; var s=p/4; }
						else var s = p/(2*Math.PI) * Math.asin (c/a);
						return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
					};
				$.easing.easeOutElastic=$.easing.easeOutElastic || 
					function(x,t,b,c,d){
						var s=1.70158;var p=0;var a=c;
						if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
						if (a < Math.abs(c)) { a=c; var s=p/4; }
						else var s = p/(2*Math.PI) * Math.asin (c/a);
						return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
					};
				$.easing.easeInOutElastic=$.easing.easeInOutElastic || 
					function(x,t,b,c,d){
						var s=1.70158;var p=0;var a=c;
						if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
						if (a < Math.abs(c)) { a=c; var s=p/4; }
						else var s = p/(2*Math.PI) * Math.asin (c/a);
						if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
						return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
					};
				$.easing.easeInBack=$.easing.easeInBack || 
					function(x,t,b,c,d,s){
						if (s == undefined) s = 1.70158;
						return c*(t/=d)*t*((s+1)*t - s) + b;
					};
				$.easing.easeOutBack=$.easing.easeOutBack || 
					function(x,t,b,c,d,s){
						if (s == undefined) s = 1.70158;
						return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
					};
				$.easing.easeInOutBack=$.easing.easeInOutBack || 
					function(x,t,b,c,d,s){
						if (s == undefined) s = 1.70158;
						if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
						return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
					};
				$.easing.easeInBounce=$.easing.easeInBounce || 
					function(x,t,b,c,d){return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;};
				$.easing.easeOutBounce=$.easing.easeOutBounce || 
					function(x,t,b,c,d){
						if ((t/=d) < (1/2.75)) {return c*(7.5625*t*t) + b;} 
						else if (t < (2/2.75)) {return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;} 
						else if (t < (2.5/2.75)) {return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;} 
						else {return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;}
					};
				$.easing.easeInOutBounce=$.easing.easeInOutBounce || 
					function(x,t,b,c,d){
						if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
						return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
					};
			}
		}
		
	/* 
	---------------
	plugin setup 
	---------------
	*/
	
	/* extend jquery with custom easings */
	
	functions._easing.call();
	
	/* plugin constructor functions */
	
	$.fn[pluginNS]=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	$[pluginNS]=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
	
	/* 
	allow setting plugin default options. 
	example: $.plugin_name.defaults.option_name="option_value"; 
	*/
	
	$[pluginNS].defaults=defaults;
	
})(jQuery,window,document);