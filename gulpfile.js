(function () {

  var gulp = require('gulp');
  var argv = require('yargs').argv;
  var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*']
  });


  gulp.task('tgz', function () {
    var module_name = argv.module;
    return gulp.src([
        module_name + '/dist/**',
        module_name + '/index.html'
      ])
      .pipe($.tar(module_name + '.tar'))
      .pipe($.gzip())
      .pipe(gulp.dest('dist-module-packages'));
  });


  gulp.task('publish', function () {
    console.log('gulp tgz --module=<%= module-template %>');
  });

}());
