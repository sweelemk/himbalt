// "use strict"
function extend( a, b ) {
	for( var key in b ) { 
		if( b.hasOwnProperty( key ) ) {
			a[key] = b[key];
		}
	}
	return a;
}

var scrolls, groupscroll, newsscroll, formscroll;
var modalsProject;

window.onload = function(){
	var scrollsMain = document.getElementById('my-scrollbar');
	scrolls = new Scroller(scrollsMain, true);

	var groupscrollMain = document.getElementById('groups-scroll');
	groupscroll = new Scroller(groupscrollMain, false);

	var newsscrollMain = document.getElementById('news-scroll');
	newsscroll = new Scroller(newsscrollMain, false);

	var formscrollMain = document.getElementById('forms-scroll');
	formscroll = new Scroller(formscrollMain, false);
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
				$(_this.options.breadcumbs).removeClass("show");
				modalsProject.removeEventHandler();

			},
			success: function(content){
				if(to_popstate !== false) {
					_this.history(link)
				}
				var fragment = $(content).find(".js-ajx");
				var bredcrumbs = $(content).find(".breadcumbs-inner").html();
				var fragmentContent = fragment.parent().html();
				var menu = $(content).find(".menu-elements").html();
				if(!fragment.data("pages")) {
					$(_this.options.breadcumbs).removeClass("show");
				}
				setTimeout(function(){
					$(".js-ajx").parent().html(fragmentContent).promise().done(function(){
						console.log("Congratulations! AJAX success!");
						
						$(_this.options.menu).html(menu);
						$(_this.options.breadcumbs).find(".breadcumbs-inner").html(bredcrumbs);
						_this.initHandler();
						_this.options.isAnimation = false;
						if(fragment.data("pages")) {
							$(_this.options.pages).addClass("inner-page");
							$(_this.options.constantSection).addClass("inactive");
						} else {
							$(_this.options.pages).removeClass("inner-page");
							$(_this.options.constantSection).removeClass("inactive");
						}
						setTimeout(function(){
							if(fragment.data("pages")) {
								$(_this.options.breadcumbs).addClass("show");
							} else {
								$(_this.options.breadcumbs).removeClass("show");
							}
							$(_this.options.pages).removeClass("pages-out").addClass("pages-in");

							_this.checkTransition();
							$(".js-slider-one-slide").slick("setPosition");
						}, 500);
						scrolls.scrollUpdate(true);
						modalsProject.updateModal();
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
			$(this).removeClass("inactive").addClass("open-side");
		}
	});
	constant.on("mouseleave", function(){
		if(container.hasClass("transition")) {
			container.removeClass("transition");
			$(this).addClass("inactive").removeClass("open-side");
		}
	});
};

function Scroller(el, bool){

	this.el = el;
	this.bool = bool;
	this.timer;

	this.param = {
		constant: ".js-constant",
		aninElements: ".js-section",
		window: "window",
		logo: ".logo-container"
	}

	this.Scrollbar = window.Scrollbar;

	this.init();
};

Scroller.prototype = {
	init: function(){
		var self = this;

		this.fixedElement = document.querySelector(this.param.constant);
		this.fixedElementLogo = document.querySelector(this.param.logo);
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
			if($(".section_map").length){
				self.mapDetected();
			}
		});

		this.updateElements();

		window.onresize = function(){
			self.windowHeight = self.windowValue();
			clearTimeout(self.timer);
			self.timer = setTimeout(function () {
				self.scrollUpdate();
			},300);
		}
	},
	mapDetected: function(){
		this.mapPosTop = document.querySelector(".section_map").getBoundingClientRect().top;
		this.mapPosBottom = document.querySelector(".section_map").getBoundingClientRect().bottom;
		this.height = this.windowValue() / 2;		
		this.content = document.querySelector(".container-content");

		if(this.mapPosTop < this.height  && this.mapPosBottom > this.height) {
			this.content.classList.add("bg-color");
			console.log(this.content)
		} else if(this.mapPosTop < this.height && this.mapPosBottom < this.height) {
			this.content.classList.remove("bg-color");
		} else if(this.mapPosTop > this.height && this.mapPosBottom > this.height) {
			this.content.classList.remove("bg-color");
		}
	},
	windowValue: function(){
		return window.innerHeight;
	},
	fixedPositionSidebar: function(state){
		var t_pos = state.offset.y;
		this.fixedElement.style.top = t_pos + "px";
		this.fixedElementLogo.style.top = t_pos + "px";
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
			if(getElementTop <= self.windowHeight/1.15) {
				self.setScrollClass(node);
			}
		});
	},
	setScrollClass: function(element){
		var getAttr = element.getAttribute("data-inview-class");
		element.classList.add(getAttr);
	},
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
		close: ".cross-modal",
		closeOverlay: "[data-modals] .scroll-content"
	}

	this.init();
}

Modals.prototype = {
	init: function(){

		this.body = document.querySelector(this.options.bodyElement);
		this.elements = document.querySelectorAll(this.el);
		this.modals = document.querySelectorAll("[data-modals]");

		this.eventHandler();
		this.initValidation(".js-validation");
		this.checkInputValue("input");
		this.checkInputValue("textarea");
		this.autoSizeTextarea();
	},
	handler: function(event){
		alert();
	},
	eventHandler: function() {
		var self = this;
		// this.elements.forEach(function(element){
		// 	element.addEventListener("click", function(event){
		// 		var value = this.getAttribute("data-modal");
		// 		if(value == "modal") {
		// 			var options = this.getAttribute("data-option");
		// 			if($(".modal-items").hasClass("open")) {
		// 				self.changeForm(options);
		// 			} else {
		// 				if(this.getAttribute("data-inner")) {
		// 					self.changeFormType(options);
		// 				} else {
		// 					self.openModal(value, options);
		// 				}
		// 			}
		// 		} else {
		// 			self.openModal(value);	
		// 		}				
		// 		event.preventDefault();
		// 	});
		// });
		$(this.elements).on("click", function(event){
			var value = this.getAttribute("data-modal");
			if(value == "modal") {
				var options = this.getAttribute("data-option");
				if($(".modal-items").hasClass("open")) {
					self.changeForm(options);
				} else {
					if(this.getAttribute("data-inner")) {
						self.changeFormType(options);
					} else {
						self.openModal(value, options);
					}
				}
			} else {
				self.openModal(value);	
			}				
			event.preventDefault();
		});
	},
	removeEventHandler: function(){
		$(this.elements).off("click");
	},
	generateEventOnCloseModals: function(){
		var self = this;
		this.close = document.querySelectorAll(this.options.close);
		this.closeOverlay = document.querySelectorAll(this.options.closeOverlay);
		this.close.forEach(function(element){
			element.addEventListener("click", function(){
				self.closeModal();
				element.removeEventListener("click", arguments.callee);
			});
		});
		this.closeOverlay.forEach(function(element){
			element.addEventListener("click", function(e){
				if(e.target.classList.contains("scroll-content")){
					self.closeModal();
					element.removeEventListener("click", arguments.callee);
				}					
			});
		});
	},
	openModal: function(goal_modal, options_modal){
		this.body.classList.add(this.options.openClass);
		this.goalElement = document.querySelector("[data-modals=" + goal_modal + "]");
		
		
		if(options_modal) {
			this.optionsElement = document.getElementById(options_modal);
			this.optionsElement.classList.add("open");
			formscroll.scrollUpdate();
		}
		this.goalElement.classList.add(this.options.openClassElements);
		this.goalElement.classList.add(this.options.showModal);

		this.generateEventOnCloseModals();
	},
	closeModal: function(){
		var self = this;
		this.body.classList.remove(this.options.openClass);
		this.modals.forEach(function(el){
			console.log(el)
			el.classList.remove(self.options.openClassElements);
		});
		setTimeout(function(){
			self.modals.forEach(function(el){
				var that = self;
				el.classList.remove(that.options.showModal);
			});				
			$(".modal-items").removeClass("open in_form out_form");
		}, 300);
	},
	initValidation: function(name_form){
		var self = this;
		var form_validate = $(name_form);
		if (form_validate.length) {
			form_validate.each(function () {
				var form_this = $(this);
				$.validate({
					form : form_this,
					borderColorOnError : true,
					scrollToTopOnError : false,
					validateOnBlur : true,
					onValidate: function($form) {
						
					},
					onError: function($form) {
					},
					onSuccess: function($form){
						if($($form).attr("id") === "registration") {
							self.changeForm($($form).find("[type='submit']").data("option"));
						}
						return false;
					}
				});
			});
		};
	},
	checkInputValue: function(tags){
		var inputs = document.getElementsByTagName(tags);

		for (var i = 0; i < inputs.length; i++) {
			var input = inputs[i];
			input.value.length > 0 ? input.classList.add("not-empty") : input.classList.remove("not-empty");
			input.addEventListener('input', function() {
				this.value.length > 0 ? this.classList.add("not-empty") : this.classList.remove("not-empty");
			});
		}
	},
	autoSizeTextarea: function(){
		$('textarea.js-auto-size').textareaAutoSize();
	},
	updateModal: function(){
		this.init();
	},
	changeForm: function(next_modal){
		$("#" + next_modal).parent().find(".open").addClass("out_form");
		this.animationend($("#" + next_modal).parent().find(".open"), $("#" + next_modal));
	},
	changeFormType: function(next_modal_type){
		var self = this;
		$("#" + next_modal_type).addClass("open").parents("[data-modals]").addClass("open " + this.options.showModal);
		$("#" + next_modal_type).parents("[data-modals]").siblings().removeClass("open");
		setTimeout(function(){
			$("#" + next_modal_type).parents("[data-modals]").siblings().removeClass(self.options.showModal);
		},300);
	},
	animationend: function(current, next){
		var self = this;
		current.on("animationend", function(){
			var _ = $(this);
			if(_.hasClass("open")) {
				next.addClass("open in_form").siblings().removeClass("open out_form");
				setTimeout(function(){
					next.removeClass("in_form");
				}, 300);
				formscroll.scrollUpdate();
			}
			_.off("animationend");
		});
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

function tabsload(){
	var container = $(".tab-container"),
		item = container.find(".anchor-trigger");
		

	item.on("click", function(e){
		
		var _ = $(this),
			value = _.attr("href");
		if(_.parent().hasClass("active")) {
			return false;
		}

		_.parent().addClass("active").siblings().removeClass("active");
		
		$.ajax({
			url: value,
			dataType: "html",
			beforeSend: function(){
				$(".js-container_load").addClass("hide");
			},
			success: function(content) {
				setTimeout(function(){
					var cont = $(content).find(".js-container_load");
					$(".js-container_load").html(cont).promise().done(function(){
						$(this).removeClass("hide");
						var inputItem = $(".js-container_load").find("input");
						if(inputItem.length) {
							changeInput(inputItem);
							modalsProject.initValidation(".js-validation-personal")
						}
					});
				}, 400);
			}
		})
		return false;
		e.preventDefault();
	});
};

function country(){
	var item = $(".country-item"),
		map = $(".map-container");

	item.on("click", function(){
		var _ = $(this),
			ID = _.data("id");

		map.find("[data-id=" + ID + "]").addClass("open");
	});
	item.on("mouseleave", function(){
		map.children().removeClass("open");
	})
};

function changeInput(input) {
	input.each(function(){
		var _ = $(this);
		if(_.val().length > 0) {
			_.addClass("not-empty");
		}
		_.on("input", function(){
			var _val = $(this).val();

			_val.length > 0 ? $(this).addClass("not-empty") : $(this).removeClass("not-empty");
		});
	});
}
$(document).ready(function(){
	// init menu
	menu();
	actionContent();
	modalsProject = new Modals("[data-modal]");
});