var scrolls, groupscroll;

window.onload = function(){
	var scrollsMain = document.getElementById('my-scrollbar');
	scrolls = new Scroller(scrollsMain, true);

	var groupscrollMain = document.getElementById('groups-scroll');
	groupscroll = new Scroller(groupscrollMain, false);
};

function menu(){
	var trigger = $(".ui-menu"),
		overlay = $(".overlay"),
		body = $("body"),
		close = $(".cross-head");

	trigger.on("click", function(){
		if(body.hasClass("navigation_show")) return;
		body.addClass("navigation_show");
	});
	overlay.add(close).on("click", function(){
		body.removeClass("navigation_show");
	});
};

function Loading(){
	var _this = this;

	_this.options = {
		trigger: ".js-link",
		isAnimation: false,
		body: "body",
		openMenuClass: "navigation_show",
		pages: ".pages",
		constantSection: ".constant-section",
		breadcumbs: ".breadcumbs",
		menu: ".menu-elements"
	}

	_this.initHandler = function(){
		$(_this.options.trigger).on("click vclick", function(event){

			if($(this).hasClass("active")) {
				return false;
			}

			if(_this.options.isAnimation) {
				return false;
			}

			_this.options.isAnimation = true;

			_this.link = $(this).attr("href");

			if($(_this.options.body).hasClass(_this.options.openMenuClass)){
				$(_this.options.body).removeClass(_this.options.openMenuClass);
				setTimeout(function(){
					_this.action(_this.link, true);
				},300);
			} else {
				_this.action(_this.link, true);
			}

			event.preventDefault();
			return false;
		});
	};

	_this.action = function(link, to_popstate) {
		$.ajax({
			url: link,
			dataType: "html",
			beforeSend: function(){
				$(_this.options.trigger).off("click vclick");
				
				if(typeof viv !== "undefined"){
					viv.stop();
					setTimeout(function(){
						viv.destroy();
					}, 400);
				};

				$(_this.options.pages).addClass("transfer-pages pages-out");
				
				if($(".variable-section").hasClass("transition")){
					setTimeout(function(){
						$(".variable-section").removeClass("transition");
					}, 400);
				};

				setTimeout(function(){
					scrolls.scrollSet();
				}, 300);

			},
			success: function(content){
				if(to_popstate !== false) {
					_this.history(link)
				}
				var fragment = $(content).find(".js-ajx");
				var bredcrumbs = $(content).find(".breadcumbs-inner").html();
				var fragmentContent = fragment.parent().html();
				var menu = $(content).find(".menu-elements").html();
					
				setTimeout(function(){
					$(".js-ajx").parent().html(fragmentContent).promise().done(function(){
						console.log("Congratulations! AJAX success!");
						if(fragment.data("pages")) {
							$(_this.options.pages).addClass("inner-page");
							$(_this.options.constantSection).addClass("inactive");
							$(_this.options.breadcumbs).addClass("show");
						} else {
							$(_this.options.pages).removeClass("inner-page");
							$(_this.options.constantSection).removeClass("inactive");
							$(_this.options.breadcumbs).removeClass("show");
						}
						$(_this.options.menu).html(menu);
						$(_this.options.breadcumbs).find(".breadcumbs-inner").html(bredcrumbs);
						_this.initHandler();
						_this.options.isAnimation = false;
						setTimeout(function(){
							$(_this.options.pages).removeClass("pages-out").addClass("pages-in");

							_this.checkTransition();
						}, 500);
						scrolls.scrollUpdate(true);
					});
				},600);
			}
		});
	};

	_this.checkTransition = function(){
		$(_this.options.pages).on("animationend", function(e){
			var _ = $(this);
			_.removeClass("pages-in");
			setTimeout(function(){
				_.removeClass("transfer-pages");
				_.off("animationend");
			}, 400);
		});
	}

	_this.history = function(url) {
		window.history.replaceState("page" + url, document.title, location.href);
		window.history.pushState("page" + url, document.title, url);
	};

	_this.browserState = function(){
		$(window).bind("popstate", function(e){
			var pageState = document.location;

			_this.action(pageState, false);
		})
	};

	_this.initHandler();
	_this.browserState();

};

function actionContent() {
	var container = $(".variable-section");
	var constant = $(".constant-section");

	constant.on("mouseenter", function(){
		if($(".pages").hasClass("inner-page")) {
			container.addClass("transition");
			$(this).removeClass("inactive");
		}
	});
	constant.on("mouseleave", function(){
		if(container.hasClass("transition")) {
			container.removeClass("transition");
			$(this).addClass("inactive");
		}
	});
};

function Scroller(el, bool){

	this.el = el;
	this.bool = bool;

	this.param = {
		constant: ".js-constant",
		aninElements: ".js-section",
		window: "window"
	}

	this.Scrollbar = window.Scrollbar;

	this.init();
};

Scroller.prototype = {
	init: function(){
		var self = this;

		this.fixedElement = document.querySelector(this.param.constant);
		this.windowHeight = this.windowValue();

		this.scrollbar = this.Scrollbar.init(this.el, {
			speed: 1.5,
			damping: 0.08,
			alwaysShowTracks: true,
			thumbMinSize: 8,
			renderByPixels: true,
			syncCallbacks: true
		});

		this.scrollbar.addListener(function(status){
			if(!self.bool) return;
			self.fixedPositionSidebar(status);
			self.updateOnScroll();
		});

		this.updateElements();

		window.onresize = function(){
			self.windowHeight = self.windowValue();
		}
	},
	windowValue: function(){
		return window.innerHeight;
	},
	fixedPositionSidebar: function(state){
		var t_pos = state.offset.y;

		this.fixedElement.style.top = t_pos + "px";
	},
	scrollSet: function(){
		this.scrollbar.setPosition(0,0);
	},
	scrollUpdate: function(param){
		var self = this;

		this.scrollbar.update(true);
		
		if(param) {
			self.updateElements();
		}
	},
	updateElements: function(){
		var scroll_el = [];

		this.section_el = document.querySelectorAll(this.param.aninElements);

	},
	updateOnScroll: function(){
		var self = this;

		this.section_el.forEach(function(node, i){
			var getElementTop = node.getBoundingClientRect().top;
			if(getElementTop <= self.windowHeight) {
				self.setScrollClass(node);
			}
		});
	},
	setScrollClass: function(element){
		var getAttr = element.getAttribute("data-inview-class");
		element.classList.add(getAttr);
	}
};

function initSlickSlider() {
	 $(".js-slider-one-slide").slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		// asNavFor: ".js-slider-one-fade",
		infinite: false
	});
	// $('.js-slider-one-fade').slick({
	// 	slidesToShow: 1,
	// 	slidesToScroll: 1,
	// 	asNavFor: ".js-slider-one-slide",
	// 	dots: false,
	// 	arrows: false,
	// 	fade: true,
	// 	infinite: false
	// });
	$(".js-slider-prev").on("click", function(){
		$(".js-slider-one-slide").slick("slickPrev");
		if ($(".js-slider-one-slide").find(".slick-prev").hasClass("slick-disabled")) $(".js-slider-prev").addClass("disable")
		else $(".js-slider-prev").removeClass("disable")
		if ($(".js-slider-one-slide").find(".slick-next").hasClass("slick-disabled")) $(".js-slider-next").addClass("disable")
		else $(".js-slider-next").removeClass("disable")
	})
	$(".js-slider-next").on("click", function(){
		$(".js-slider-one-slide").slick("slickNext");
		if ($(".js-slider-one-slide").find(".slick-prev").hasClass("slick-disabled")) $(".js-slider-prev").addClass("disable")
		else $(".js-slider-prev").removeClass("disable")
		if ($(".js-slider-one-slide").find(".slick-next").hasClass("slick-disabled")) $(".js-slider-next").addClass("disable")
		else $(".js-slider-next").removeClass("disable")
	})
	if ($(".js-slider-one-slide").find(".slick-prev").hasClass("slick-disabled")) $(".js-slider-prev").addClass("disable")
	else $(".js-slider-prev").removeClass("disable")
	if ($(".js-slider-one-slide").find(".slick-next").hasClass("slick-disabled")) $(".js-slider-next").addClass("disable")
	else $(".js-slider-next").removeClass("disable")

}



$(document).ready(function(){
	// init menu
	menu();

	actionContent();

	initSlickSlider();
});