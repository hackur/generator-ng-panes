'use strict';
/**
 * gulpfile.js Version 2 completely rewritten from ground up
 */
var lodash       = require('lodash');
var path         = require('path');
var gulp 		 = require('gulp');
var $ 			 = require('gulp-load-plugins')();
var webserver 	 = require('gulp-webserver');
var ngTemplate   = require('gulp-ng-template');
var inject       = require('gulp-inject');
var minifyHtml   = require('gulp-minify-html');
var angularFS    = require('gulp-angular-filesort');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var minifyCss    = require('gulp-clean-css');
var bowerFiles   = require('main-bower-files');
var es 			 = require('event-stream');
var del          = require('del');
var lazypipe 	 = require('lazypipe');
var runSequence  = require('run-sequence');
var ngAnnotate   = require('gulp-ng-annotate');
var sourcemaps   = require('gulp-sourcemaps');
var pump 		 = require('pump');
var gulpUtil     = require('gulp-util');
<% if (sass || less) { %>
var sourcemaps   = require('gulp-sourcemaps');
<% } %>
<% if (sass) { %>
var sass         = require('gulp-ruby-sass');
<% } %>
<% if (less) { %>
var less         = require('gulp-less');
<% } %>

/**
 * get the os info for our use
 */
var os 		    = require('os');
var ifaces 		= os.networkInterfaces();
var defaultIp 	= '0.0.0.0';
/**
 * just to get around the stupid windows can't servce up 0.0.0.0 (bind all interface)
 */
var getIpForWebServer = function(callback)
{
	//console.log(os.platform());
	if (os.platform().substr(0,3) === 'win') {
		var called = false;
		Object.keys(ifaces).forEach(function(ifname)
		{
			var alias = 0;
			ifaces[ifname].forEach(function(iface)
			{
				if ('IPv4' !== iface.family || iface.internal !== false) {
					return;
				}
				if (alias >= 1) {
					console.log(ifname  + ':' + alias , iface.address);
					return;
				}
				else {
					if (!called) {
						callback(iface.address);
					}
					called = true;
				}
				++alias;
			});
		});
	}
	else {
		callback(defaultIp);
	}
};
// short hand
var join = path.join;

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
	  dist: 'dist',
	  dev: '.dev'
};
<% if (less) { %>
var ext = 'less';
<% } else if (sass) { %>
var ext = 'scss';
<% } else { %>
var ext = 'css';
<% } %>

var paths = {
	fonts: [
		join(yeoman.app , 'fonts' , '**' , '*.*')
	],
	vendorFonts: [
		<% if (sourceFontPath) { %>"<%- sourceFontPath %>"<% } %>
		// add the font you need to add to your dist package here
	],
    scripts: [
		join(yeoman.app , 'scripts' , '**' , '*.js')
	],
    styles: [yeoman.app + '/styles/**/*.css'],
	watchStyle: [yeoman.app + '/styles/**/*.' + ext],
	mainStyle: [yeoman.app + '/styles/main.' + ext],
    test: ['test/spec/**/*.js'],
    testRequire: [
        'test/mock/**/*.js',
        'test/spec/**/*.js'
	],
    karma: 'karma.conf.js',
    views: {
        main: yeoman.app + '/index.html',
        files: [
			join(yeoman.app , '**' , '*.html'),
			'!' + join(yeoman.app , 'fonts'  , '**' , '*.html'),
			'!' + join(yeoman.app , 'styles' , '**' , '*.html'),
			'!' + join(yeoman.app , 'images' , '**' , '*.html'),
			'!' + join(yeoman.app , 'index.html'),
			'!' + join(yeoman.app , '404.html')
		]
    },
	dev: {
		css: join(yeoman.dev , 'styles'),
		js: join(yeoman.dev , 'scripts'),
		styles: join(yeoman.dev , 'styles' , '**' , '*.css'),
		scripts: join(yeoman.dev , 'scripts' , 'ng-templates.js'),
		appJs: [
			join(yeoman.app , 'scripts' , '**' , '*.js')
		],
		cssPaths:  [ yeoman.bower , path.join(yeoman.app , 'styles')]
	},
	headjs: 'bower_components/modernizr/modernizr.js',
	images: [
		join(yeoman.app , 'images' , '**' , '*.(jpg|jpeg|gif|bmp|svg)')
	]
};

////////////////////////
// Reusable pipelines //
////////////////////////

var lintScripts = lazypipe()
  					.pipe($.jshint, '.jshintrc')
  					.pipe($.jshint.reporter, 'jshint-stylish');

var styles = lazypipe()
	  			.pipe($.autoprefixer, 'last 1 version');

var pathReplace = function(filePath , dir)
{
	dir = dir || '/bower_components/';
	var fp;
	if (typeof dir==='string') {
		fp = filePath.replace(dir , '');
	}
	else {
		dir.forEach(function(d)
		{
			if (filePath.indexOf(d)>-1) {
				fp = filePath.replace(d , '');
			}
		});
	}
	var isJs = filePath.indexOf('.js') > -1;
	if (isJs) {
		return '<script src="' + fp + '"><' + '/script>';
	}
	return '<link rel="stylesheet" href="' + fp + '" />';
};

gulp.task('dev:build' , function(cb)
{
	runSequence('dev:build:base' , 'dev:wiredep' , cb);
});

gulp.task('dev:build:base' , function(cb)
{
	runSequence('dev:clean' , ['dev:copy' , 'dev:scripts'] , cb);
});

gulp.task('dev:copy' , ['dev:copy:js' , 'dev:copy:fonts' , 'dev:copy:images' , 'dev:copy:others']);

gulp.task('dev:scripts' , ['dev:templates' , 'dev:styles']);

gulp.task('dev:styles', function () {
	<% if (sass) { %>
	return sass(paths.mainStyle, {
					sourcemap: true,
					style: 'expanded',
					precision: 10,
					loadPath: paths.dev.cssPaths
				})
    			.on('error', sass.logError)
    			// For inline sourcemaps
    			.pipe(sourcemaps.write())
    			// For file sourcemaps
				/*
			    .pipe(sourcemaps.write('maps', {
			      includeContent: false,
			      sourceRoot: yeoman.dev
			  })) */
    		    .pipe(gulp.dest(paths.dev.css));
	<% } else if (less) { %>
	return gulp.src(paths.mainStyle)
	  		   .pipe(sourcemaps.init())
	  		   .pipe(less({
				   paths: paths.dev.cssPaths
			   }))
	  		   .pipe(sourcemaps.write())
	  		   .pipe(gulp.dest(paths.dev.css));
	<% } else { %>
    return gulp.src(paths.styles)
      		   .pipe(styles())
			   .pipe(gulp.dest(paths.dev.css));
	<% } %>
});

gulp.task('dev:wiredep' , function()
{
	return gulp.src(join(yeoman.app ,'index.html'))
			   .pipe(
				   inject(
					   gulp.src(bowerFiles(), {read: false}),
					   {
						   name: 'bower',
						   transform: function(filePath)
						   {
							   return pathReplace(filePath);
						   }
					   }
				   )
			   )
			   .pipe(
				   inject(
					   gulp.src(paths.headjs , {read: false}),
					   {
						   name: 'head' ,
					       transform: function(filePath) {
							   return pathReplace(filePath);
						   }
					   }
				   )
			   )
			   .pipe(inject(
				   es.merge(
				   		gulp.src(paths.dev.styles , {read: false}),
						gulp.src(paths.dev.scripts , {read: false}),
						gulp.src(paths.scripts).pipe(angularFS())
			   	   ),
				   {
					   transform: function(filePath)
					   {
						   return pathReplace(filePath , ['/'+yeoman.dev+'/', '/'+yeoman.app+'/']);
					   }
				   }
			   ))
			   .pipe(gulp.dest(yeoman.dev));
});

gulp.task('dev:jshint' , function()
{
	return gulp.src(paths.dev.appJs).pipe(lintScripts());
});

gulp.task('dev:templates' , function()
{
	return gulp.src(paths.views.files)
			   .pipe(
				   minifyHtml(
					   {empty: true, quotes: true}
				   )
			   )
			   .pipe(
				   ngTemplate({
				   		moduleName: 'ngTemplate',
				   		standalone: true,
				   		filePath: 'ng-templates.js'
			   		})
			   )
			   .pipe(gulp.dest(paths.dev.js));
});

// serving up the dev
gulp.task('dev' , ['dev:build'] , function()
{
	// watch css
	gulp.watch(paths.watchStyle , ['dev:styles']);
	// watch app js
	gulp.watch(paths.views.files , ['dev:templates']);
	// watch templates
	gulp.watch(paths.dev.appJs , ['dev:jshint' , 'dev:copy:js' , 'dev:wiredep']);
	// ?
	gulp.watch(['bower.json' , join(yeoman.app , 'index.html')], ['dev:wiredep']);

	gulp.watch(paths.images , ['dev:copy:images']);

	getIpForWebServer(function(ip)
	{
		gulp.src([yeoman.bower , yeoman.dev])
	        .pipe(webserver({
	            host: ip,
	            port: port.dev,
	            livereload: true,
	            open: true
	    }));
	});
});

gulp.task('dev:copy:js' , function()
{
	return gulp.src(paths.scripts)
			   .pipe(ngAnnotate())
			   .pipe(
				   gulp.dest(
					   join(yeoman.dev , 'scripts')
				   )
			   );
});

gulp.task('dev:copy:fonts' , function()
{
	return gulp.src(paths.fonts)
			   .pipe(gulp.dest(join(yeoman.dev , 'fonts')));
});

gulp.task('dev:copy:images' , function()
{
	return gulp.src(paths.images)
                .pipe(
					$.cache(
						$.imagemin({
                    		optimizationLevel: 5,
                    		progressive: true,
                    		interlaced: true
                		})
					)
				)
                .pipe(gulp.dest(join(yeoman.dev , 'images')));
});

gulp.task('dev:copy:others' , function()
{
	return gulp.src([ '!' + join(yeoman.app , 'index.html') , join(yeoman.app , '*.*')])
			   .pipe(
				   gulp.dest(
					   yeoman.dev
				   )
			   );
});

gulp.task('dev:clean' , function()
{
	return del([join(yeoman.dev , '**')]);
});

/************************************
 *    		BUILD SCRIPT            *
 ************************************/

gulp.task('build', function (callback) {
  	runSequence(
		'dist:clean',
    	['dist:copy' , 'dist:js' , 'dist:css'],
		'dist:index',
    callback);
});
// take a look at it
gulp.task('build:serve' , ['build'] , function()
{
	getIpForWebServer(function(ip)
	{
		gulp.src(yeoman.dist)
	        .pipe(webserver({
	            host: ip,
	            port: port.dev,
	            livereload: false,
	            open: true
	    }));
	});
});

gulp.task('dist:clean', ['dev:clean'], function ()
{
  	return del([ join(yeoman.dist , '**') ]);
});

// rewire the whole thing and minify
gulp.task('dist:index' , function()
{
	var styles = [
		join(yeoman.dist , 'styles' , 'vendor.min.css'),
		join(yeoman.dist , 'styles' , 'app.min.css')
	];
	var scripts = [
		join(yeoman.dist , 'scripts' , 'vendor.min.js'),
		join(yeoman.dist , 'scripts' , 'app.min.js')
	];
	var pattern = '/' + yeoman.dist + '/';
	return gulp.src(join(yeoman.app ,'index.html'))
			   .pipe(
				   inject(
					   gulp.src(join(yeoman.dist , 'scripts' , 'head.min.js') , {read: false}),
					   {
						   name: 'head' ,
					       transform: function(filePath) {
							   return pathReplace(filePath , pattern);
						   }
					   }
					)
				)
				.pipe(
					inject(
						es.merge(
	 				   		gulp.src(styles , {read: false}),
	 						gulp.src(scripts , {read: false})
	 			   	   ),
	 				   {
	 					   transform: function(filePath)
	 					   {
	 						   return pathReplace(filePath , pattern);
	 					   }
	 				   }
					)
				)
				.pipe(gulp.dest(yeoman.dist));
});

// combine all angular app files into one
gulp.task('dist:ng' , function(cb)
{
	pump([
		gulp.src(paths.dev.appJs),
		ngAnnotate(),
		angularFS(),
		concat('app.js'),
		gulp.dest(join(yeoman.dev , 'scripts'))
	] , cb);
});

// combine all the app related js
gulp.task('dist:js' , function(cb)
{
	runSequence(
		'dist:vendor' ,
		['dist:ng' , 'dev:templates' , 'dist:js:headjs'] ,
		'dist:js:app',
	cb);
});

// note here we call the template method first then concat with it
gulp.task('dist:js:app' , function(cb)
{
	var scripts = [
		join(yeoman.dev , 'scripts' , 'ng-templates.js'),
		join(yeoman.dev , 'scripts' , 'app.js')
	];
	pump([
		gulp.src(scripts),
		concat('app.min.js'),
		uglify(),
		gulp.dest(path.join(yeoman.dist , 'scripts'))
	] , cb);
});

gulp.task('dist:js:headjs' , function(cb)
{
	pump([
		gulp.src(paths.headjs),
		concat('head.min.js'),
		uglify(),
		gulp.dest(join(yeoman.dist , 'scripts'))
	] , cb);
});

gulp.task('dist:vendor' , function(cb)
{
	var js = [] , css = [];

	bowerFiles().forEach(function(file)
	{
		if (file.indexOf('.css') > -1) {
			css.push(file);
		}
		else if (file.indexOf('.js') > -1) {
			js.push(file);
		}
	});

	gulp.src(css)
		.pipe(concat('vendor.min.css'))
		.pipe(minifyCss())
		.pipe(gulp.dest(
			path.join(yeoman.dist,'styles')
		));

	pump([
		gulp.src(js),
		concat('vendor.min.js'),
		uglify(),
		gulp.dest(path.join(yeoman.dist , 'scripts'))
	] , cb);

});

gulp.task('dist:css' , function()
{
	return gulp.src(paths.styles)
			   .pipe(concat('app.min.css'))
			   .pipe(minifyCss())
			   .pipe(gulp.dest(
				   join(yeoman.dist , 'styles')
			   ));
});

gulp.task('dist:copy' , ['dist:copy:fonts' , 'dist:copy:images' , 'dist:copy:others']);

gulp.task('dist:copy:fonts' , function()
{
	var fontPaths = lodash.union(paths.fonts , paths.vendorFonts);

	return gulp.src(fontPaths)
			   .pipe(gulp.dest(join(yeoman.dist , 'fonts')));
});

gulp.task('dist:copy:images' , function()
{
	return gulp.src(join(yeoman.app , 'images','**','*'))
                .pipe(
					$.cache(
						$.imagemin({
                    		optimizationLevel: 5,
                    		progressive: true,
                    		interlaced: true
                		})
					)
				)
                .pipe(gulp.dest(join(yeoman.dist , 'images')));
});

gulp.task('dist:copy:others' , function()
{
	return gulp.src([ '!' + join(yeoman.app , 'index.html') , join(yeoman.app , '*.*')])
			   .pipe(
				   gulp.dest(
					   yeoman.dist
				   )
			   );
});

// -- EOF --
