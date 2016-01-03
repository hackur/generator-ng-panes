'use strict';
var gulp 		 = require('gulp');
var bump 		 = require('gulp-bump');
var runSequence  = require('run-sequence');
var argv 		 = require('yargs').argv;
var shell        = require('gulp-shell');
var releaseTypes = ['major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease'];
var validReleaseType = function()
{
	var cmd = argv.type;
	var found = 'patch';
	if (cmd) {
		releaseTypes.forEach(function(type)
		{
			if (type===cmd) {
				found = cmd;
			}
		});
	}
	return found;
};

gulp.task('build:release' , function(cb)
{
	runSequence('git:pull',
				'build',
				'bump:msg',
				cb);
});

gulp.task('npm:publich' , shell.task([
	"npm publish"
]));

gulp.task('git:pull' , shell.task([
	"git checkout gh-pages",
	"git pull origin gh-pages"
]));

gulp.task('git:commit' , function()
{
	return gulp.src('./bower.json', {read: true})
			   .pipe(shell([
				   "git add .",
				   "git commit -am 'release version: <%= getVersion(file) %>'",
				   "git push origin gh-pages",
				   "git checkout master",
				   "git pull origin gh-pages",
				   "git tag v<%= getVersion(file) %>",
				   "git push origin master --tags",
				   "git checkout gh-pages"
			   ],{
				   templateData: {
					   getVersion: function(s)
					   {
						   var b = s.contents.toString('utf-8');
						   var json = JSON.parse(b);
						   return json.version;
					   }
				   }
			   }));
});

gulp.task('bump:msg' , function(cb)
{
	runSequence('bump',
				'git:commit',
				cb);
});

gulp.task('bump' , function()
{
	var type = validReleaseType();
	return gulp.src(
		['./bower.json','./package.json']
	).pipe(
		bump({type:type})
	).pipe(gulp.dest('./'));
});
