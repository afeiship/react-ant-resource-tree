(function () {

  var gulp = require('gulp');
  var argv = require('yargs').argv;
  var module_name = argv.module;
  var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del']
  });
  var package_version = {
    'bower_components': '1.0.0',
    'common': '1.0.1',
    'pay-select': '1.0.0'
  };

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

  //if bower_components has new ,you need update this package:
  //gulp tgz-bower
  gulp.task('zip-bower', function () {
    return gulp.src('bower_components/**')
      .pipe($.zip('bower_components_' + package_version.bower_components + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });

  //if common has new ,you need update this package:
  //gulp tgz-common
  gulp.task('zip-common', function () {
    return gulp.src('common/**')
      .pipe($.filter(['**', '!common/src/**', '!common/gulpfile.js']))
      .pipe($.zip('common_' + package_version.common + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });

  gulp.task('publish-vendor', [
    'zip-bower',
    'zip-common'
  ]);


  //test: gulp tgz --module=pay-select
  gulp.task('zip-module', [
    'copy-html',
    'copy-dist-files'
  ], function () {
    gulp.src('.tmp/**')
      .pipe($.zip(module_name + '_' + package_version[module_name] + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });


}());
