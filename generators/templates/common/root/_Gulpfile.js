'use strict';
/**
 * gulpfile.js Version 2 completely rewritten from ground up
 */
var os 			     = require('os');
var path         = require('path');
var gulp 		     = require('gulp');
var $ 			     = require('gulp-load-plugins')();
var lazypipe 	   = require('lazypipe');
var rimraf 		   = require('rimraf');
var wiredep 	   = require('wiredep').stream;
var runSequence  = require('run-sequence');
var watch 		   = require('gulp-watch');
var webserver 	 = require('gulp-webserver');
<% if (sass) { %>var sass    = require('gulp-ruby-sass');<% } %>
<% if (less) { %>var less    = require('gulp-less');<% } %>

/************************************
 *     		PATHS SETUP             *
 ************************************/

var port = {
	 dev: 3001,
	 dist: 3002
};

var yeoman = {
	  app: require('./bower.json').appPath || 'app',
   	src: require('./bower.json').srcPath || 'src',
	  bower: 'bower_components',
   	dist: 'dist'
};

var paths = {
    scripts: [yeoman.app + '/scripts/**/*.js'],
    styles: [yeoman.app + '/styles/**/*.<% if (sass) { %>scss<% } else if (less) { %>less<% } else { %>css<% } %>'],
    test: ['test/spec/**/*.js'],
    testRequire: [
        yeoman.app + '/bower_components/angular/angular.js',
        yeoman.app + '/bower_components/angular-mocks/angular-mocks.js',
        yeoman.app + '/bower_components/angular-resource/angular-resource.js',
        yeoman.app + '/bower_components/angular-cookies/angular-cookies.js',
        yeoman.app + '/bower_components/angular-sanitize/angular-sanitize.js',
        yeoman.app + '/bower_components/angular-route/angular-route.js',
        'test/mock/**/*.js',
        'test/spec/**/*.js'],
    karma: 'karma.conf.js',
    views: {
        main: yeoman.app + '/index.html',
        files: [yeoman.app + '/views/**/*.html']
    }
};

// top level calls

gulp.task('dev' , ['watch' , 'server:dev' , 'wiredep' , 'styles']);

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  				.pipe($.jshint, '.jshintrc')
  				.pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()<% if (sass) { %>
  .pipe($.rubySass, {
    style: 'expanded',
    precision: 10
  })<% } if (less) { %>
  .pipe(less)<% } %>
  .pipe($.autoprefixer, 'last 1 version')
  .pipe(gulp.dest, '.tmp/styles');

gulp.task('styles', function () {
    return gulp.src(paths.styles)
      		   .pipe(styles());
});

gulp.task('wiredep' , function()
{
	return gulp.src(path.join(yeoman.app ,'index.html'))
			   .pipe(wiredep({
				   ignorePath: '../bower_components/'
			   }))
			   .pipe(gulp.dest(yeoman.app));
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
    	.pipe(lintScripts())
    	.pipe(connect.reload());

  	watch(paths.test)
    	.pipe($.plumber())
    	.pipe(lintScripts());

  	watch('bower.json', ['wiredep']);

});

/*
gulp.task('open' , function()
{
	return gulp.src('')
			   .pipe(open({uri:'http://localhost:'+ port.dev}));
});
*/

// serving up the dev
gulp.task('server:dev' , function()
{
    gulp.src(yeoman.app)
        .pipe(webserver({
            host: '0.0.0.0',
            port: port.dev,
            livereload: true,
            fallback: 'index.html',
            open: true
            /*
            proxies: [{
              source: '/api',
              target: 'http://localhost:8181/api'
            }] */
    }));
});


/************************************
 *    		BUILD SCRIPT            *
 ************************************/


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
