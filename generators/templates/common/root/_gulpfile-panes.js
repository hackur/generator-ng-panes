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
var express = require('express');
var livereload = require('connect-livereload');
var open = require('gulp-open');
var babel = require('gulp-babel');
var gutil = require('gulp-util');
var chalk = require('chalk');
var exec = require('child_process').exec;<% if (sass) { %>
var sass = require('gulp-ruby-sass');<% } %><% if (less) { %>
var less = require('gulp-less');<% } %><% if (typescript) { %>
var typescript = require('gulp-typescript');<% } %>

var app = express();
app.use(livereload({ port: 35729 , interval: 1000}));

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
        'test/spec/**/*.js'<% } %>],
    karma: 'karma.conf.js',
    views: {
        main: yeoman.app + '/index.html',
        files: [yeoman.app + '/views/**/*.html']
    }
};

var uiLintScripts = lazypipe()
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

var lintScripts = lazypipe()<% if (answers.coffee) { %>
  .pipe($.coffeelint)
  .pipe($.coffeelint.reporter);<% } else { %>
  .pipe($.jshint, '.jshintrc')
  .pipe($.jshint.reporter, 'jshint-stylish');<% } %>

var scriptPaths = [
	'./lib/**/*.*',
	'./app/config/**/*.*',
	'./app/server/**/*.*'
];

    //////////////////////
    //  SERVER TASK     //
    //////////////////////

/**
 * watching the src folder and turn ES6 to ES5
 */
gulp.task('watch:src' , function()
{
    return gulp.src('src/**/*.js')
               .pipe(babel())
               .pipe(gulp.dest('app'));
});

gulp.task('serve', function (callback) {
  runSequence('watch',
    'watch:src',
    ['lint:scripts'],
    ['start:client'],
    'clean:tmp',
    'start:server',
	callback);
});

/**
 * open browser
 */
gulp.task('start:client', ['ui:styles'], function () {
  	openURL('http://localhost:3001');
});

gulp.task('start:server' , function()
{
    exec('node start.js');
});

/**
 * vagrant task to start or install provision the virtual server
 */
gulp.task('vagrant' , function(cb)
{
	gutil.log('starting vagrant, if this is the first time. It might take sometime.');
    exec('cd vagrant && vagrant up' , function(err , stdout , stderr)
	{
		if (err) {
			gutil.log('err' , chalk.red(err));
		}
		if (stdout) {
			gutil.log('stdout' , chalk.blue(stdout));
		}
		if (stderr) {
			gutil.log('stderr' , chalk.green(stderr));
		}
		cb();
	});
});
/**
 * docker task
 */
gulp.task('docker' , function(cb)
{

});

gulp.task('watch', <% if (answers.useVagrant) { %>['vagrant'],<% } %> function (cb)
{
	var errLogger = function () {
		gutil.log(gutil.colors.red.apply(undefined, arguments));
	};
	var app = require('gulp-express2')('start.js', gutil.log, errLogger);

	app.run();
	// client side
	gulp.watch([
		'./app/client/**/*.*'
	]).on('change' , function(file)
	{
		app.notify(file);
	});
    // styles watcher
    watch(paths.styles).pipe($.plumber()).pipe(styles()).on('change' , function(file)
	{
		app.notify(file);
	});

    // server side
    gulp.watch(scriptPaths).on('change', function (file) {
		app.run();
		app.notify(file);
    });

});

gulp.task('lint:scripts', function () {
	return gulp.src(scriptPaths)
		  .pipe(lintScripts());
});

gulp.task('clean:tmp', function (cb) {
  	rimraf('./.tmp', cb);
});

gulp.task('test', ['start:server:test'], function () {
  var testToFiles = paths.testRequire.concat(paths.scripts, paths.test);
  return gulp.src(testToFiles)
    	.pipe($.karma({
      		configFile: paths.karma,
      		action: 'watch'
    	}));
});

//////////////////////////
//        UI TASK       //
//////////////////////////

gulp.task('ui:styles', function () {
  return gulp.src(paths.styles)
    .pipe(styles());
});<% if (coffee) { %>

gulp.task('ui:coffee', function() {
  return gulp.src(paths.scripts)
    .pipe(lintScripts())
    .pipe($.coffee({bare: true}).on('error', $.util.log))
    .pipe(gulp.dest('.tmp/scripts'));
});<% } %>
<% if (typescript) { %>
gulp.task('ui:typescript' , function() {
    var tsResult = gulp.src(path.scripts)
        .pipe(ts({
            noImplicitAny: true
        }));
      return tsResult.js.pipe(gulp.dest('.tmp/scripts'));
})<% } %>

gulp.task('ui:lint:scripts', function () {
  return gulp.src(paths.scripts)
    .pipe(uiLintScripts());
});

/*
gulp.task('clean:tmp', function (cb) {
  rimraf('./.tmp', cb);
});
*/

///////////
// Build //
///////////

gulp.task('build', function (callback) {
  runSequence('clean:dist',
    ['images', 'copy:extras', 'copy:fonts', 'client:build'],
    callback);
});

gulp.task('clean:dist', function (cb) {
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

gulp.task('copy:extras', function () {
  return gulp.src(yeoman.app + '/*/.*', { dot: true })
    .pipe(gulp.dest(yeoman.dist));
});

gulp.task('copy:fonts', function () {
  return gulp.src(yeoman.app + '/fonts/**/*')
    .pipe(gulp.dest(yeoman.dist + '/fonts'));
});
