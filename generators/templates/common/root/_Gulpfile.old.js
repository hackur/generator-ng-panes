'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var openURL = require('open');
var lazypipe = require('lazypipe');
var rimraf = require('rimraf');
var wiredep = require('wiredep').stream;
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
<% if (sass) { %>var sass = require('gulp-ruby-sass');<% } %>
<% if (less) { %>var less = require('gulp-less');<% } %>
<% if (typescript) { %>var typescript = require('gulp-typescript');<% } %>

var yeoman = {
  app: require('./bower.json').appPath || 'app',
  dist: 'dist'
};

var paths = {
  scripts: [yeoman.app + '/scripts/**/*.<% if (coffee) { %>coffee<% } else { %>js<% } %>'],
  styles: [yeoman.app + '/styles/**/*.<% if (sass) { %>scss<% } else if (less) { %>less<% } else { %>css<% } %>'],
  test: ['test/spec/**/*.<% if (coffee) { %>coffee<% } else { %>js<% } %>'],
  testRequire: [
    yeoman.app + '/bower_components/angular/angular.js',
    yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
    yeoman.app + '/bower_components/angular-resource/angular-resource.js',
    yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
    yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
    yeoman.app + '/bower_components/angular-route/angular-route.js',<% if (coffee) { %>
    'test/mock/**/*.coffee',
    'test/spec/**/*.coffee'<% } else { %>
    'test/mock/**/*.js',
    'test/spec/**/*.js'<% } %>
  ],
  karma: 'karma.conf.js',
  views: {
    main: yeoman.app + '/index.html',
    files: [yeoman.app + '/views/**/*.html']
  }
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()<% if (coffee) { %>
  .pipe($.coffeelint)
  .pipe($.coffeelint.reporter);<% } else { %>
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');<% } %>

var styles = lazypipe()<% if (sass) { %>
  .pipe($.rubySass, {
    style: 'expanded',
    precision: 10
  })<% } if (less) { %>
  .pipe(less)<% } %>
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

///////////
// Tasks //
///////////

gulp.task('wiredep' , function()
{
    return gulp.src('./app/index.html')
    .pipe(wiredep({
        ignorePath: '../'
    }))
    .pipe(gulp.dest('./app'));
});

gulp.task('styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});<% if (coffee) { %>

gulp.task('coffee', function() {
  return gulp.src(paths.scripts)
    .pipe(lintScripts())
    .pipe($.coffee({bare: true}).on('error', $.util.log))
    .pipe(gulp.dest('.tmp/scripts'));
});<% } %>
<% if (typescript) { %>
gulp.task('typescript' , function() {
    var tsResult = gulp.src(path.scripts)
        .pipe(ts({
            noImplicitAny: true
        }));
      return tsResult.js.pipe(gulp.dest('.tmp/scripts'));
})<% } %>

gulp.task('lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(lintScripts());
});

gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});

gulp.task('start:client', ['start:server', <% if (coffee) { %>'coffee', <% } %><% if (typescript) { %>'typescript', <% } %>'styles'], function () {
  openURL('http://localhost:9000');
});

gulp.task('start:server', function() {
  connect.server({
    root: [yeoman.app ,'bower_components' , '.tmp'],
    livereload: true,
    // Change this to '0.0.0.0' to access the server from outside.
    port: 9000
  });
});

gulp.task('start:server:test', function() {
  connect.server({
    root: ['test', yeoman.app , 'bower_components' , '.tmp' ],
    livereload: true,
    port: 9001
  });
});

gulp.task('watch', function () {

  watch(paths.styles)
    .pipe($.plumber())
    .pipe(styles())
    .pipe(connect.reload());

  watch(paths.views.files)
    .pipe($.plumber())
    .pipe(connect.reload());

  watch(paths.scripts)
    .pipe($.plumber())
    .pipe(lintScripts())<% if (coffee) { %>
    .pipe($.coffee({bare: true}).on('error', $.util.log))
    .pipe(gulp.dest('.tmp/scripts'))<% } %>
    .pipe(connect.reload());

  watch(paths.test)
    .pipe($.plumber())
    .pipe(lintScripts());

  watch('bower.json', ['wiredep']);
});

gulp.task('serve', function (callback) {
  runSequence('clean:tmp',
    ['lint:scripts'],
    ['start:client'],
    'watch', callback);
});

// special to get call during the first run
gulp.task('firstrun' , function(callback)
{
    runSequence('clean:tmp' ,
        ['wiredep'],<% if (less) { %>['less'],<% } %><% if (sass) { %>['sass'],<% } %>
        ['start:client'],
        'watch',
        callback);
});

gulp.task('serve:prod', function() {
  connect.server({
    root: [yeoman.dist],
    livereload: true,
    port: 9000
  });
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    .pipe($.karma({
      configFile: paths.karma,
      action: 'watch'
    }));
});

///////////
// Build //
///////////

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['images', 'copy:extras', 'copy:fonts', 'client:build'],
    callback);
});

gulp.task('clean:dist', function () {
  rimraf('./dist', cb);
});

gulp.task('client:build', ['html', 'styles'], function () {
  var jsFilter = $.filter('**/*.js');
  var cssFilter = $.filter('**/*.css');

  return gulp.src(paths.views.main)
    .pipe($.useref.assets({searchPath: [yeoman.app, '.tmp']}))
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.minifyCss({cache: true}))
    .pipe(cssFilter.restore())
    .pipe($.rev())
    .pipe($.useref.restore())
    .pipe($.revReplace())
    .pipe($.useref())
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('html', function () {
  return gulp.src(yeoman.app + '/views/**/*')
    .pipe(gulp.dest(yeoman.dist + '/views'));
});

gulp.task('images', function () {
  return gulp.src(yeoman.app + '/images/**/*')
    .pipe($.cache($.imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })))
    .pipe(gulp.dest(yeoman.dist + '/images'));
});

<% if (less) { %>
gulp.task('less' , function()
{
    return gulp.src(yeoman.app + '/styles/main.less')
           .pipe(less())
           .pipe(gulp.dest(yeoman.app + '/styles/main.css'));
});
<% } %>
<% if (sass) { %>
gulp.task('sass' , function()
{
    return gulp.src(yeoman.app + '/styles/main.scss')
           .pipe($.rubySass(), {
             style: 'expanded',
             precision: 10
           })
           .pipe(gulp.dest(yeoman.app + '/styles/main.css'));
});
<% } %>

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});