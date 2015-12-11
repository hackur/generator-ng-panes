
var gulp 		 = require('gulp');
var bump 		 = require('gulp-bump');
var gulpReplace  = require('gulp-replace');
var argv 		 = require('yargs').argv;
var shell        = require('gulp-shell');


gulp.task('build:release' , function(cb)
{
	runSequence('git:pull',
				'build',
				'bump:msg',
				cb);
});

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
				  // "git commit -am 'release version from gh-pages: <%= getVersion(file) %>'",
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
	return gulp.src(
		'./bower.json'
	).pipe(
		bump()
	).pipe(gulp.dest('./'));
});
