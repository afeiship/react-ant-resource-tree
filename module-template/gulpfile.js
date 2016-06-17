(function () {

  'use strict';
  var gulp = require('gulp');
  var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del']
  });

  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };

  /* ================module build scripts Start====================== */
  gulp.task('images', function () {
    return gulp.src('src/images/*')
      .pipe(gulp.dest('dist/images'));
  });

  gulp.task('images-watch', function () {
    return gulp
      .watch('src/images/*', ['images']);
  });


  gulp.task('scripts', function () {
    return gulp.src('src/scripts/*')
      .pipe($.uglify())
      .pipe($.rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest('dist/scripts'));
  });

  gulp.task('scripts-watch', function () {
    return gulp
      .watch('src/scripts/*', ['scripts']);
  });


  gulp.task('styles', function () {
    return gulp
      .src('src/sass/*.scss')
      .pipe($.sourcemaps.init())
      .pipe($.sass(sassOptions).on('error', $.sass.logError))
      .pipe($.sourcemaps.write())
      .pipe($.autoprefixer())
      .pipe(gulp.dest('dist/styles'));
  });

  gulp.task('styles-watch', function () {
    return gulp
      .watch('src/styles/*.scss', ['styles']);
  });


  gulp.task('clean', function () {
    return $.del(['dist']);
  });

  /* ================module build scripts End====================== */


  /*===Default build scripts===*/
  gulp.task('default', ['clean'], function () {
    gulp.start([
      'images',
      'scripts',
      'styles',
      'images-watch',
      'scripts-watch',
      'styles-watch'
    ]);
  });

}());
