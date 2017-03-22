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
				}

				$(_this.options.pages).addClass("transfer-pages pages-out");
				if($(".variable-section").hasClass("transition")){
					setTimeout(function(){
						$(".variable-section").removeClass("transition");
					}, 400);
					
				}
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
					});
				},600);
			}
		});
	};

	_this.checkTransition = function(){
		$(_this.options.pages).on("animationend", function(e){
			$(this).removeClass("pages-in");
			setTimeout(function(){
				$(this).removeClass("transfer-pages");
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

function customScroller(){
	var Scrollbar = window.Scrollbar;

	var scrollbar = Scrollbar.init(document.getElementById('my-scrollbar'), {
		speed: 1.5,
		damping: 0.08,
		alwaysShowTracks: true,
		thumbMinSize: 8,
		renderByPixels: true,
		syncCallbacks: true
	});

	scrollbar.addListener(function (status) {
		var t = $(".js-section");
		var posTop = scrollbar.scrollTop;
		console.log(posTop)
		t.each(function(){
			var _ = $(this);
			console.log(_.offset().top, posTop)
			if(posTop >= (_.offset().top)) {
				_.addClass(_.data("inview-class"));
			}
		})
	});

	function el() {

	}
}

$(document).ready(function(){
	// init menu
	menu();
	actionContent();
	customScroller();
});