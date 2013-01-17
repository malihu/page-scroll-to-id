//Page scroll to id by malihu (http://manos.malihu.gr)
//plugin home http://manos.malihu.gr/animate-page-to-id-with-jquery
(function($){ 
	var methods={
		init:function(options){
			var defaults={  
				scrollSpeed:1300, //scroll animation speed in milliseconds
				autoScrollSpeed:true, //auto-adjust animation speed (according to element position)
				scrollEasing:"easeInOutExpo", //scroll animation easing when page is idle
				scrollingEasing:"easeInOutCirc", //scroll animation easing while page is animated
				callback:function(){}, //user custom callback function
				pageEndSmoothScroll:true, //end of page smooth scrolling (if bottom elements are too short)
				layout:"vertical" //page layout defines scrolling direction (vertical, horizontal, auto)
			};
			var options=$.extend(defaults,options);
			$().mPageScroll2id("checkTouchDevice");
			var ua=navigator.userAgent,
				scrollElem="html";
			if(ua.indexOf(' AppleWebKit/')!==-1){ //animate body for webkit browsers that don't support html animation
				scrollElem="body";
			}
			//store options, global animation state
			$(document).data("mPageScroll2id-scrollElem",scrollElem).data("mPageScroll2id-layout",options.layout).data("mPageScroll2id-pageEndSmoothScroll",options.pageEndSmoothScroll).data("mPageScroll2id-speed",options.scrollSpeed).data("mPageScroll2id-easing",options.scrollEasing).data("mPageScroll2id-animation","idle"); 
			return this["live"]("click",function(e){
				e.preventDefault();
				var $this=$(this);
				var scrollTarget=$this.attr("href").split("#");
				var scrollToPos=$("#"+scrollTarget[1]).offset().top;
				var docHeight=$(document).height();
				if(options.layout==="horizontal"){ //x-axis
					scrollToPos=$("#"+scrollTarget[1]).offset().left; 
					var docWidth=$(document).width(); 
				}else if(options.layout==="auto"){ //xy-axis
					var scrollToPosX=$("#"+scrollTarget[1]).offset().left; 
					var docWidth=$(document).width(); 
					var scrollToX=scrollToPosX;
				}
				var scrollTo=scrollToPos;
				if(options.pageEndSmoothScroll){ 
					scrollTo=$().mPageScroll2id("pageEndSmoothScroll",{
						scrollTo:scrollToPos,
						scrollToX:scrollToPosX
					});
					if(options.layout==="auto"){ //xy-axis
						var getScrollTo=scrollTo[0];
						var getScrollToX=scrollTo[1];
						scrollTo=getScrollTo;
						scrollToX=getScrollToX;
					}
				}
				var easing=options.scrollEasing;
				$(document).data("mPageScroll2id-easing",easing); //store easing for history
				if($(scrollElem).is(":animated")){ //if page is animated change easing type
					easing=options.scrollingEasing;
				} 
				var speed=options.scrollSpeed;
				$(document).data("mPageScroll2id-speed",speed); //store speed for history
				if(options.autoScrollSpeed){ //auto-adjust scroll speed
					var autoSpeedPercentage=Math.floor((Math.abs(scrollTo-$(window).scrollTop())/docHeight)*100);
					if(options.layout==="horizontal"){ //x-axis
						autoSpeedPercentage=Math.floor((Math.abs(scrollTo-$(window).scrollLeft())/docWidth)*100);
					}else if(options.layout==="auto"){ //xy-axis
						var autoSpeedPercentageX=Math.floor((Math.abs(scrollToX-$(window).scrollLeft())/docWidth)*100);
						if(autoSpeedPercentageX>autoSpeedPercentage){
							autoSpeedPercentage=autoSpeedPercentageX;
						}
					}
					var autoSpeed=speed+((speed*autoSpeedPercentage)/100);
					speed=autoSpeed;
				}
				$(scrollElem).mPageScroll2id("animate",{
					scrollTo:scrollTo,
					speed:speed,
					easing:easing,
					callback:options.callback,
					layout:options.layout,
					scrollToX:scrollToX //xy-axis
				});
			});
		},
		pageEndSmoothScroll:function(options){
			var scrollTo;
			var scrollToX; //xy-axis
			var docLength=$(document).height();
			var winLength=$(window).height();
			if($(document).data("mPageScroll2id-layout")==="horizontal"){ //x-axis
				docLength=$(document).width();
				winLength=$(window).width();
			}else if($(document).data("mPageScroll2id-layout")==="auto"){ //xy-axis
				var docLengthX=$(document).width();
				var winLengthX=$(window).width();
				scrollToX=options.scrollToX;
				if((docLengthX-options.scrollToX)<winLengthX){ //page end smooth scrolling
					scrollToX=docLengthX-winLengthX;
				}
			}
			scrollTo=options.scrollTo;
			if((docLength-options.scrollTo)<winLength){ //page end smooth scrolling
				scrollTo=docLength-winLength;
			}
			if($(document).data("mPageScroll2id-layout")==="auto"){
				return [scrollTo,scrollToX];
			}else{
				return scrollTo;
			}
		},
		animate:function(options){
			var $this=$(this);
			$(document).data("mPageScroll2id-animation","underway"); //global animation state
			if(options.layout==="horizontal"){ //x-axis
				$this.stop().animate({scrollLeft:options.scrollTo},options.speed,options.easing,function(){
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
					options.callback.call(); //user custom callback function
				});
			}else if(options.layout==="auto"){ //xy-axis
				if($(document).data("mPageScroll2id-is_touch_device")==="iOS"){ //iOS fix
					$(window).scrollTop(options.scrollTo).scrollLeft(options.scrollToX); 
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
					options.callback.call(); //user custom callback function
				}else{
					$this.stop().animate({scrollTop:options.scrollTo,scrollLeft:options.scrollToX},options.speed,options.easing,function(){
						$(document).data("mPageScroll2id-animation","idle"); //global animation state
						options.callback.call(); //user custom callback function
					});
				}
			}else{
				$this.stop().animate({scrollTop:options.scrollTo},options.speed,options.easing,function(){
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
					options.callback.call(); //user custom callback function
				});
			}
		},
		history:function(options){ //history
			var hScrollTo=$("#"+options.scrollTo).offset().top;
			if($(document).data("mPageScroll2id-layout")==="horizontal"){ //x-axis
				hScrollTo=$("#"+options.scrollTo).offset().left;
			}else if($(document).data("mPageScroll2id-layout")==="auto"){ //xy-axis
				var hScrollToX=$("#"+options.scrollTo).offset().left;
			}
			if($(document).data("mPageScroll2id-pageEndSmoothScroll")===true){
				hScrollTo=$().mPageScroll2id("pageEndSmoothScroll",{
					scrollTo:hScrollTo,
					scrollToX:hScrollToX
				});
				if($(document).data("mPageScroll2id-layout")==="auto"){ //xy-axis
					var gethScrollTo=hScrollTo[0];
					var gethScrollToX=hScrollTo[1];
					hScrollTo=gethScrollTo;
					hScrollToX=gethScrollToX;
				}
			}
			$(document).data("mPageScroll2id-animation","underway"); //global animation state
			if($(document).data("mPageScroll2id-layout")==="horizontal"){ //x-axis
				$($(document).data("mPageScroll2id-scrollElem")).stop().animate({scrollLeft:hScrollTo},$(document).data("mPageScroll2id-speed"),$(document).data("mPageScroll2id-easing"),function(){
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
				});
			}else if($(document).data("mPageScroll2id-layout")==="auto"){ //xy-axis
				if($(document).data("mPageScroll2id-is_touch_device")==="iOS"){ //iOS fix
					$(window).scrollTop(hScrollTo).scrollLeft(hScrollToX); 
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
				}else{
					$($(document).data("mPageScroll2id-scrollElem")).stop().animate({scrollTop:hScrollTo,scrollLeft:hScrollToX},$(document).data("mPageScroll2id-speed"),$(document).data("mPageScroll2id-easing"),function(){
						$(document).data("mPageScroll2id-animation","idle"); //global animation state
					});
				}
			}else{
				$($(document).data("mPageScroll2id-scrollElem")).stop().animate({scrollTop:hScrollTo},$(document).data("mPageScroll2id-speed"),$(document).data("mPageScroll2id-easing"),function(){
					$(document).data("mPageScroll2id-animation","idle"); //global animation state
				});
			}
		},
		checkTouchDevice:function(){
			if(is_touch_device()){
				$("html").addClass("is-touch-device");
				$(document).data("mPageScroll2id-is_touch_device","true");
				//check iOS
				var deviceAgent=navigator.userAgent.toLowerCase();
				var $iOS=deviceAgent.match(/(iphone|ipod|ipad)/);
				if($iOS){
					$(document).data("mPageScroll2id-is_touch_device","iOS");
				}
			}
			function is_touch_device(){
				return !!("ontouchstart" in window) ? 1 : 0;
			}
		}
	}
	$.fn.mPageScroll2id=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
})(jQuery);  