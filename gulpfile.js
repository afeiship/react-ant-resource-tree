(function () {

  var gulp = require('gulp');
  var argv = require('yargs').argv;
  var module_name = argv.module;
  var exec = require('child_process').exec;
  var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del']
  });
  var package_version = {
    'bower_components': '1.0.0',
    'common': '1.0.0',
    'pay-select': '1.0.0'
  };

  gulp.task('clean', function () {
    return $.del('dist-module-packages');
  });

  //if bower_components has new ,you need update this package:
  //gulp tgz-bower
  gulp.task('zip-bower', function () {
    var dir_name = 'bower_components_' + package_version.bower_components;
    return gulp.src('bower_components/**')
      .pipe($.rename(function (path) {
        path.dirname = dir_name + '/' + path.dirname;
      }))
      .pipe($.zip(dir_name + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });
  gulp.task('build-common', function () {
    exec('cd common && gulp');
  });

  //if common has new ,you need update this package:
  //gulp tgz-common
  gulp.task('zip-common', ['build-common'], function () {
    var dir_name = 'common_' + package_version.common;
    return gulp.src('common/**')
      .pipe($.filter([
        '**',
        '!common/src/**',
        '!common/gulpfile.js'
      ]))
      .pipe($.rename(function (path) {
        path.dirname = dir_name + '/' + path.dirname;
      }))
      .pipe($.zip(dir_name + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });

  gulp.task('publish-vendor', [
    'zip-bower',
    'zip-common'
  ]);


  //test: gulp zip-module --module=pay-select
  gulp.task('zip-module', function () {
    var dir_name = module_name + '_' + package_version[module_name];
    gulp.src(module_name + '/**')
      .pipe($.filter([
        '**',
        '!' + module_name + '/src/**',
        '!' + module_name + '/gulpfile.js',
        '!' + module_name + '/README.MD'
      ]))
      .pipe($.rename(function (path) {
        path.dirname = dir_name + '/' + path.dirname;
      }))
      .pipe($.zip(dir_name + '.zip'))
      .pipe(gulp.dest('dist-module-packages'));
  });


  gulp.task('publish', ['clean', 'publish-vendor'], function () {
    exec('cd pay-select && gulp publish');
  });


}());
