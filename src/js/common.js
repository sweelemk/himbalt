function extend( a, b ) {
	for( var key in b ) { 
		if( b.hasOwnProperty( key ) ) {
			a[key] = b[key];
		}
	}
	return a;
}

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
		close = $(".cross-menu");

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
							$(".js-slider-one-slide").slick("setPosition");
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
			if(!self.bool) {
				return;
			}
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
	scrollToPosition: function(pos){
		this.scrollbar.scrollTo(0, pos, 800);
	},
	scrollPosition: function(){
		return this.scrollbar.scrollTop;
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

	$(".js-slider-one-slide").on("init", function(){
		// $(this).slick("setPosition");

	})

	$(".js-slider-one-slide").slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		dots: false,
		arrows: true,
		infinite: false
	});

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


function goToAnchors(){
	var anchorTrigger = $(".anchor-trigger");

	anchorTrigger.on("click", function(e){
		var data = $(this).attr("href");

		var positionOfTop = $(data).offset().top - 25;
		var positionScroll = scrolls.scrollPosition();

		scrolls.scrollToPosition(positionOfTop + positionScroll);

		e.preventDefault();
	});
};

function Modals(el) {
	this.el = el;


	this.options = {
		openClass: "modals_show",
		openClassElements: "open",
		showModal: "show-modal",
		bodyElement: "body",
		modalGoal: "[data-modals]",
		close: ".cross-modal"
	}

	this.init();
}

Modals.prototype = {
	init: function(){

		this.body = document.querySelector(this.options.bodyElement);
		this.elements = document.querySelectorAll(this.el);

		this.eventHandler();
	},
	eventHandler: function() {
		var self = this;
		this.elements.forEach(function(element){
			element.addEventListener("click", function(event){
				var value = this.getAttribute("data-modal");
				self.openModal(value);
				event.preventDefault();
			});	
		});
				
	},
	generateEventOnCloseModals: function(){
		var self = this;
		this.close = document.querySelector(this.options.close);
		this.close.addEventListener("click", function(){
			self.closeModal();
			this.removeEventListener("click", arguments.callee);
		});
	},
	openModal: function(goal_modal){
		this.body.classList.add(this.options.openClass);
		this.goalElement = document.querySelector("[data-modals=" + goal_modal + "]");
		this.goalElement.classList.add(this.options.openClassElements);
		this.goalElement.classList.add(this.options.showModal);

		this.generateEventOnCloseModals();
	},
	closeModal: function(){
		var self = this;
		this.body.classList.remove(this.options.openClass);
		this.goalElement.classList.remove(this.options.openClassElements);		
		setTimeout(function(){
			self.goalElement.classList.remove(self.options.showModal);
		}, 300);
	}
};

function ShowMore(el, options) {
	this.el = el;

	this.options = {
		head: ".show_more-head",
		body: ".show_more-body",
		trigger: ".show_more-trigger",
		showText: "",
		hideText: ""
	};

	this.options = extend( {}, this.options );
	extend( this.options, options );

	this.init();
}

ShowMore.prototype = {
	init: function(){
		var self = this
		$(this.el).each(function(){
			self.head_element = $(this).find(self.options.head);
			self.body_element = $(this).find(self.options.body);
			self.trigger_element = $(this).find(self.options.trigger);
		});

		this.initHandler();
	},
	initHandler: function() {
		var self = this;
		this.trigger_element.on("click", function(){
			if(!$(this).hasClass("open")) {
				self.openContainer();
			} else {
				self.closeContainer();
			}
				
		});
	},
	openContainer: function(){
		var self = this;
		this.trigger_element.addClass("open");
		this.body_element.stop(true, true).slideDown({
			duration: 350,
			complete: function(){
				groupscroll.scrollUpdate()
				self.trigger_element.find("span").text(self.options.hideText);
			}
		});
	},
	closeContainer: function(){
		var self = this;

		var self = this;
		this.trigger_element.removeClass("open");
		this.body_element.stop(true, true).slideUp({
			duration: 350,
			complete: function(){
				groupscroll.scrollUpdate()
				self.trigger_element.find("span").text(self.options.showText);
			}
		})
	}
};


$(document).ready(function(){
	// init menu
	menu();
	actionContent();

	
});