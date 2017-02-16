var gulp = require('gulp');
var svgstore = require('gulp-svgstore');
var config = require('../config');
var inject = require('gulp-inject');
var svgmin = require('gulp-svgmin');
var rename = require('gulp-rename');

gulp.task('svg', function() {
    var target = gulp.src(config.src.pug + "/includes/_svg-template.pug");
    var source = gulp.src(config.src.svg + '*.svg')
        .pipe(svgmin())
        .pipe(svgstore({ inlineSvg: true }));


    function fileContents (filePath, file) {
        return file.contents.toString();
    }
    return target
        .pipe(inject(source, { transform: fileContents }))
        .pipe(gulp.dest(config.src.pug + "/includes"));
});
gulp.task('svgmin', function(){
    return gulp
        .src(config.src.svg + "*.svg")
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.dest.svg))
})

gulp.task('svg:watch', function() {
    gulp.watch(config.src.svg + '*', ['svg']);
});
gulp.task('svgmin:watch', function() {
    gulp.watch(config.src.svg + '*', ['svgmin']);
})