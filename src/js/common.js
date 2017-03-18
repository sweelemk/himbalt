function menu(){
	var trigger = $(".ui-menu"),
		overlay = $(".overlay"),
		body = $("body");

	trigger.on("click", function(){
		if(body.hasClass("navigation_show")) return;
		body.addClass("navigation_show");
	});
	overlay.on("click", function(){
		body.removeClass("navigation_show");
	})
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
		breadcumbs: ".breadcumbs"
	}

	_this.initHandler = function(){
		$(_this.options.trigger).on("click vclick", function(event){
			if(_this.options.isAnimation) {
				return false;
			}

			_this.options.isAnimation = true;

			_this.link = $(this).attr("href");

			if($(_this.options.body).hasClass(_this.options.openMenuClass)){
				$(_this.options.body).removeClass(_this.options.openMenuClass);
				setTimeuot(function(){
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
			},
			success: function(content){
				if(to_popstate !== false) {
					_this.history(link)
				}
				var fragment = $(content).find(".js-ajx");
				var bredcrumbs = $(content).find(".breadcumbs-inner").html();
				var fragmentContent = fragment.html();
					
				setTimeout(function(){
					$(".js-ajx").parent().html(fragmentContent).promise().done(function(){
						console.log("Congratulations! AJAX success!");
						$(_this.options.breadcumbs).find(".breadcumbs-inner").html(bredcrumbs);
						if(fragment.data("pages")) {
							$(_this.options.pages).addClass("inner-page");
							$(_this.options.constantSection).addClass("inactive");
							$(_this.options.breadcumbs).addClass("show");
						} else {
							$(_this.options.pages).removeClass("inner-page");
							$(_this.options.constantSection).removeClass("inactive");
							$(_this.options.breadcumbs).removeClass("show");
						}

						_this.initHandler();
						_this.options.isAnimation = false;
					});
				},1000);
			}
		});
	};

	_this.history = function(url) {
		window.history.replaceState("page" + url, document.title, location.href);
		window.history.pushState("page" + url, document.title, url);
	};

	_this.browserState = function(){
		$(window).bind("popstate", function(e){
			var pageState = document.location;

			_this.action(pageState, false);
		})
	}

	_this.initHandler();
	_this.browserState();

};


$(document).ready(function(){
	// init menu
	menu();
});