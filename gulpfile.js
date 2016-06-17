(function () {

  var gulp = require('gulp');
  var argv = require('yargs').argv;
  var module_name = argv.module;
  var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del']
  });

  gulp.task('clean', function () {
    return $.del('dist-module-packages', '.tmp');
  });

  //provide package script:
  //test: gulp copy-html --module=pay-select
  gulp.task('copy-html', ['clean'], function () {
    return gulp.src(module_name + '/index.html')
      .pipe(gulp.dest('.tmp'));
  });

  //test: gulp copy-dist-files --module=pay-select
  gulp.task('copy-dist-files', ['clean'], function () {
    return gulp.src([
        module_name + '/dist/**'
      ])
      .pipe(gulp.dest('.tmp/dist'));
  });

  //test: gulp tgz --module=pay-select
  gulp.task('tgz', [
    'copy-html',
    'copy-dist-files'
  ], function () {
    gulp.src('.tmp/**')
      .pipe($.debug())
      .pipe($.tar(module_name + '.tar'))
      .pipe($.gzip())
      .pipe(gulp.dest('dist-module-packages'));
  });


}());
