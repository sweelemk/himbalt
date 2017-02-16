var gulp = require('gulp');
var config = require('../config');
var critical = require('critical').stream;


// gulp.task("critical", function(){
// 	critical.generate({
// 		inline: true,
// 		base: config.dest.html,
// 		src: "index.html",
// 		dest: "index-critical.html",
// 		minify: true
// 	})
// });

gulp.task("critical", function(){
	return gulp.src([config.dest.html + "*.html"])
			.pipe(critical({
				base: config.dest.html, 
				inline: true,
				minify: true,
				css: [config.dest.css + "screen.css"]
			}))
			.pipe(gulp.dest(config.dest.html));
});


gulp.task('critical:watch', function() {
	gulp.watch(config.dest.html + '*.html', ['critical']);
});

// copy static files
// gulp.task('copy', function() {
//    gulp.src([config.src.img+'**/*.*', '!'+imgSvg])
//    .pipe(gulp.dest(config.dest.img));
//    gulp.src(config.src.root+'fonts/*.*')
//    .pipe(gulp.dest(config.dest.root+'fonts/'));
//    gulp.src(config.src.root+'video/*.*')
//    .pipe(gulp.dest(config.dest.root+'video/'));
// });

// gulp.task('copy:watch', function() {
//     gulp.watch(config.src.img + '**/*.*', ['copy']);
//     gulp.watch(config.src.root+'fonts/*', ['copy']);
// });

