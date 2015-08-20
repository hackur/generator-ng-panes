'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var angularUtils = require('../util.js');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var wiredep = require('wiredep');
var chalk = require('chalk');
var _ = require('underscore');
_.mixin(require('underscore.inflections'));
var glob = require('glob');


var Generator = module.exports = function Generator(args, options)
{
	// calling the super
  	yeoman.generators.Base.apply(this, arguments);
  	// getting the App name
  	this.argument('appname', { type: String, required: false });
  	this.appname = this.appname || path.basename(process.cwd());
  	this.appname = _.camelize( _.slugify( _.humanize(this.appname) ) );

  	this.option('app-suffix', {
    	desc: 'Allow a custom suffix to be added to the module name',
    	type: String
  	});
  	this.env.options['app-suffix'] = this.options['app-suffix'];
  	this.scriptAppName = this.appname + angularUtils.appName(this);

  	args = ['main'];
	// getting the app path
  	if (typeof this.env.options.appPath === 'undefined') {
    	this.option('appPath', {
      		desc: 'Allow to choose where to write the files'
    	});

    	this.env.options.appPath = this.options.appPath;

    	if (!this.env.options.appPath) {
      		try {
        		this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
      		} catch (e) {}
    	}
    	this.env.options.appPath = this.env.options.appPath || 'app';
    	this.options.appPath = this.env.options.appPath;
  	}

  	this.appPath = this.env.options.appPath;
/*
	// NEVER SAW THE BELOW OPTION AVAILABLE

	// using coffee script?
  	if (typeof this.env.options.coffee === 'undefined') {
    	this.option('coffee', {
      		desc: 'Generate CoffeeScript instead of JavaScript'
    	});

    	// attempt to detect if user is using CS or not
    	// if cml arg provided, use that; else look for the existence of cs
    	if (!this.options.coffee && glob.sync(path.join(this.appPath, '/scripts/ * * /*.coffee'), {}).length > 0) {
      		this.options.coffee = true;
    	}

    	this.env.options.coffee = this.options.coffee;
  	}
	// if the user wants to use typescript
  	if (typeof this.env.options.typescript === 'undefined') {
    	this.option('typescript', {
      		desc: 'Generate TypeScript instead of JavaScript'
    	});

    	// attempt to detect if user is using TS or not
    	// if cml arg provided, use that; else look for the existence of ts
    	if (!this.options.typescript &&
      		glob.sync(path.join(this.appPath, '/scripts/ * * /*.ts'), {}).length > 0) {
      		this.options.typescript = true;
    	}

    	this.env.options.typescript = this.options.typescript;
  	}
*/
  	this.composeWith('angularjs:common', {
    	args: args
  	});

  	this.composeWith('angularjs:main', {
    	args: args
  	});

  	this.composeWith('angularjs:controller', {
    	args: args
  	});

  	this.on('end', function () {

        console.log('getting call when this all finished?');

    	var jsExt = this.options.coffee ? 'coffee' : 'js';

    	var bowerComments = [
      		'bower:js',
      		'endbower'
    	];
    	if (this.options.coffee) {
      		bowerComments.push('bower:coffee');
      		bowerComments.push('endbower');
    	}

    	this.invoke('karma:app', {
      		options: {
        		'skip-install': this.options['skip-install'],
        		'base-path': '../',
        		'coffee': this.options.coffee,
        		'travis': true,
        		'files-comments': bowerComments.join(','),
        		'app-files': 'app/scripts/**/*.' + jsExt,
        		'test-files': [
          			'test/mock/**/*.' + jsExt,
          			'test/spec/**/*.' + jsExt
        		].join(','),
        	'bower-components-path': 'bower_components'
      		}
    	});

	    this.installDependencies({
	      	skipInstall: this.options['skip-install'],
	      	skipMessage: this.options['skip-message'],
	      	callback: _injectDependencies.bind(this)
	    });

	    if (this.env.options.ngRoute) {
	      	this.invoke('angularjs:route', {
	        	args: ['about']
	      	});
	    }
  	});

  	this.pkg = require('../../package.json');
  	this.sourceRoot(path.join(__dirname, '../templates/common'));
};

util.inherits(Generator, yeoman.generators.Base);
/**
 * additional code to be call one after the other
 * this whole thing could be removed
 */

Generator.prototype.welcome = function()
{
  	if (!this.options['skip-welcome-message']) {
    	this.log(yosay());
    	this.log(
      		chalk.magenta(
        		'Yo Generator for AngularJS 1.x and 2.x brought to you by '
            ) +
            chalk.white(
                'http://newb.im' +
        		'\n'
      		)
    	);
  	}
};
/**
 * @TODO: ask for what version of AngualarJS they want to use
 */
Generator.prototype.askForAngularVersion = function()
{
    var cb = this.async();
    var _this = this;
    this.prompt({
        type: 'list',
        name: 'angularVersion',
        message: 'What version of AngularJS would you like to use',
        choices: ['V1' , 'V2'],
        default: 'V1'
    }, function(props)
    {
        _this.env.options.angularVersion ='V1'; // props.angularVersion;
        if (props.angularVersion==='V2') {
            _this.log(chalk.red('\nSorry only support V1 at the moment. Env set to V1\n'));
            // @TODO in the future set this to the TypeScript
            // _this.env.options.scriptingLang = 'TS';
        }
        cb();
    }.bind(this));
};

/**
 * @TODO: If its AngularJS 1.x then we ask for what type of scripting they want to use
 */

Generator.prototype.askForTaskRunner = function()
{
  	var cb = this.async();
  	var _this = this;
    this.prompt([{
    	type: 'list',
    	name: 'taskRunner',
        choices: ['Grunt' , 'Gulp'],
    	message: 'What task runner would you like to use?',
    	default: 'Gulp'
  	}], function (props) {
    	_this.env.options.taskRunner = props.taskRunner;
    	cb();
  	}.bind(this));
};


// if the last question was sass
Generator.prototype.askForScriptingOptions = function()
{
    var cb = this.async();
    var _this = this;
    var defaultValue = 'JS';
    var choices = [{name: 'Javascript' , value: 'JS'} ,
                   {name: 'CoffeeScript' , value: 'CS'},
                   {name: 'TypeScript' , value: 'TS'}];
    // AngularJS V.2 use TypeScript
    if (_this.env.options.angularVersion==='V2') {
        chocies.splice(1,1);
        defaultValue = 'TS';
    }
    this.prompt({
        type: 'list',
        name: 'scriptingLang',
        message: 'What script would you like to use to develop your app?',
        choices: choices,
        default: defaultValue
    }, function(props)
    {
        _this.env.options.scriptingLang = props.scriptingLang;
        //@TODO we need to write this to a file, store for later when user need to generate new script

        cb();
    }.bind(this));
};

/**
 * @TODO we are going to list a few popular UI Frameworks to choose from
 */
Generator.prototype.askForUIFrameworks = function()
{
    var cb = this.async();
    var _this = this;
    var frameworks = [
            {name: 'Bootstrap' , value: 'bootstrap'},
            {name: 'Foundation', value: 'foundation'},
            {name: 'Semantic-UI', value: 'semantic'},
            {name: 'Angular-Material' , value: 'material'},
            {name: 'Materialize', value: 'materialize'},
            {name: 'UIKit', value: 'uikit'},
            {name: 'AmazeUI' , value: 'amazeui'}];

  	this.prompt([{
    	type: 'list',
    	name: 'uiframework',
    	message: 'Which UI Framework would you like to use?',
        choices: frameworks,
    	default: 'bootstrap'
  	}], function (props) {

        _this.env.options.uiframework = props.uiframework;

    	cb();
  	}.bind(this));
};


/**
 * @TODO this should change to a list of SASS , LESS OR CSS
 *       if they want LESS we could use the JS version during DEV
 */
Generator.prototype.askForStyles = function()
{
  	var cb = this.async();
    var _this = this;
    // we take the last value `framework` to determinen what they can use next
    var features = {
        'bootstrap' : ['LESS' , 'SASS'],
        'foundation' : ['SASS'],
        'semantic' : ['LESS'],
        'material' : ['SASS'],
        'materialize' : ['SASS'],
        'uikit' : ['LESS' , 'SASS'],
        'amazeui': ['LESS']
    };
    var framework = _this.env.options.uiframework;
    var choices = ['CSS'].concat( features[ framework ] );
    this.prompt([{
        type: 'list',
        name: 'styleDev',
        message: 'How would you like to develop your style?',
        choices: choices,
        default: 'CSS'
    }], function(props)
    {
        var style = props.styleDev.toLowerCase();
        _this.env.options.styleDev = style;
        // we need to create a rather long variable for the template file as well
        _this.env.options[ framework + style ] = true;

        cb();
    }.bind(this));
    // next question
};

Generator.prototype.askForAnguar1xModules = function()
{
  	console.log('start angular module');

    var cb = this.async();
    // break this out so we can reuse it later
    var choices = [
        {value: 'animateModule',
        name: 'angular-animate.js',
        alias: 'ngAnimate',
        checked: true
    }, {value: 'ariaModule',
        name: 'angular-aria.js',
        alias: 'ngAria',
        checked: false
    }, {value: 'cookiesModule',
        name: 'angular-cookies.js',
        alias: 'ngCookie',
        checked: true
    }, {value: 'resourceModule',
        name: 'angular-resource.js',
        alias: 'ngResource',
        checked: true
    }, {value: 'messagesModule',
        name: 'angular-messages.js',
        alias: 'ngMessage',
        checked: false
    }, {value: 'routeModule',
        name: 'angular-route.js',
        alias: 'ngRoute',
        checked: true
    }, {value: 'sanitizeModule',
        name: 'angular-sanitize.js',
        alias: 'ngSanitize',
        checked: true
    }, {value: 'touchModule',
        name: 'angular-touch.js',
        alias: 'ngTouch',
        checked: true
    }];
  	var prompts = [{
    	type: 'checkbox',
    	name: 'modules',
    	message: 'Which modules would you like to include?',
    	choices: choices
  	}];
    var _this = this;

  	this.prompt(prompts, function (props)
	{
    	var hasMod = function (mod)
		{
            return props.modules.indexOf(mod) !== -1;
		};
        var angMods = [];
        // start loop
        choices.forEach(function(_mod_)
        {
            var modName = _mod_.value;
            var yes = hasMod(modName);
            if (yes) {
                angMods.push("'"+_mod_.alias+"'" );
                if (modName==='routeModule') {
                    _this.env.options.ngRoute = true;
                }
            }
        });
        if (angMods.length) {
      		_this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
    	}

    	cb();
  	}.bind(this));
};


we are changing how we deal with the index file from this point on.
Generator.prototype.readIndex = function readIndex()
{
  	this.ngRoute = this.env.options.ngRoute;

    this.indexFile = this.read('app/index.html');
};


Generator.prototype.copyStyleFiles = function()
{
  	var ext = _this.env.options.styleDev;
  	var cssFile = 'styles/main.' + (ext==='sass' ? 'scss' : ext);
   	this.copy(
    	path.join('app', cssFile),
    	path.join(this.appPath, cssFile)
  	);
};

Generator.prototype.appJs = function appJs()
{
  	this.indexFile = this.appendFiles({
    	html: this.indexFile,
    	fileType: 'js',
    	optimizedPath: 'scripts/scripts.js',
    	sourceFileList: ['scripts/app.js', 'scripts/controllers/main.js'],
    	searchPath: ['.tmp', this.appPath]
  	});
};

Generator.prototype.createIndexHtml = function createIndexHtml()
{
  	this.indexFile = this.indexFile.replace(/&apos;/g, "'");
  	this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function packageFiles()
{
  	this.coffee = this.env.options.coffee;
  	this.typescript = this.env.options.typescript;

  	this.template('root/_bower.json', 'bower.json');
  	this.template('root/_bowerrc', '.bowerrc');
  	this.template('root/_package.json', 'package.json');
  	if (this.gulp) {
    	this.template('root/_Gulpfile.js', 'Gulpfile.js');
  	} else {
    	this.template('root/_Gruntfile.js', 'Gruntfile.js');
  	}
  	if (this.typescript) {
    	this.template('root/_tsd.json', 'tsd.json');
  	}
  	this.template('root/README.md', 'README.md');
};
/**
 * private method
 */
Generator.prototype._injectDependencies = function _injectDependencies()
{
  	var taskRunner = this.env.options.taskRunner;

  	if (this.options['skip-install']) {
    	this.log(
      		'After running `npm install & bower install`, inject your front end dependencies' +
      		'\ninto your source code by running:' +
      		'\n' +
      		'\n' + chalk.yellow.bold(taskRunner + ' wiredep')
    	);
  	} else {
    	this.spawnCommand(taskRunner, ['wiredep']);
  	}
};

// -- EOF --
