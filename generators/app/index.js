'use strict';
var fs = require('fs');
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var wiredep = require('wiredep');
var chalk = require('chalk');
var glob = require('glob');
var htmlWiring = require("html-wiring");
var _ = require('underscore');

_.mixin(require('underscore.inflections'));

var angularUtils = require('../util.js');
var engine = require('../engines').underscore;

var Generator = module.exports = function Generator(args, options)
{
    // calling the super
  	yeoman.generators.Base.apply(this, arguments);
  	// getting the App name
  	this.argument('appname', { type: String, required: false });

  	this.appname = this.appname || path.basename(process.cwd());
    this.appTplName =  _.slugify( _.humanize(this.appname) );

  	// this.appname = _.camelize( this.appTplName );
    // the appname got lost somewhere down there.
    this.env.options.appNameAgain = this.appname;
    this.env.options.appTplName = this.appTplName;

  	this.option('app-suffix', {
    	desc: 'Allow a custom suffix to be added to the module name',
    	type: String
  	});

  	this.env.options['app-suffix'] = this.options['app-suffix'];

    if (!this.appname) {
        this.appname = this.env.options.appNameAgain;
    }

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
    	var jsExt = this.options.coffee ? 'coffee' : 'js';
    	var bowerComments = [
      		'bower:js',
      		'endbower'
    	];
    	if (this.options.coffee) {
      		bowerComments.push('bower:coffee');
      		bowerComments.push('endbower');
    	}
    	this.composeWith('karma:app', {
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
        /*
	    if (this.env.options.ngRoute) {
	      	this.composeWith('angularjs:route', {
	        	args: ['about']
	      	});
	    }
        */
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
 * if they didn't provide a appname, then we ask them here one more time
 */
/*
@TODO find out why the hell this create two different names

Generator.prototype.askForAppName = function()
{
    if (!this.appname) {
        var cb = this.async();
        this.prompt({
            type: 'input',
            name: 'appname',
            message: 'What is your app name?',
            default: path.basename(process.cwd())
        }, function(props)
        {
            console.log('return name' , props.appname);

            this.appname =  _.slugify( _.humanize(props.appname) );
            this.appTplName =  _.slugify( _.humanize(this.appname) );
          	this.appname = _.camelize( this.appTplName );
            this.scriptAppName = this.appname + angularUtils.appName(this);

            this.env.options.appNameAgain = this.appname;
            this.env.options.appTplName = this.appTplName;
            this.env.options.scriptAppName = this.scriptAppName;

            console.log('appname' , this.appname);
            console.log('appTplName' , this.appTplName);
            console.log('scriptAppName' , this.scriptAppName);

            cb();
        }.bind(this));
    }
    else {
        console.log('appname' , this.appname);
        console.log('appTplName' , this.appTplName);
        console.log('scriptAppName' , this.scriptAppName);
    }
}
*/

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
        var tr = props.taskRunner;
    	_this.env.options.taskRunner = tr;
        _this.gulp = (tr=='Gulp');
        _this.grunt = (tr==='Grunt');
    	cb();
  	}.bind(this));
};

Generator.prototype.askForGoogle = function()
{
    var cb = this.async();

    this.prompt({
        type: 'confirm',
        name: 'googleAnalytics',
        message: 'Would you like to use google analytics?',
        default: true
    }, function(props)
    {
        this.googleAnalytics = props.googleAnalytics;
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
        var lang = props.scriptingLang

        _this.env.options.scriptingLang = lang;
        _this.scriptingLang = lang;
        _this.coffee     = (lang === 'CS');
      	_this.typescript = (lang === 'TS');
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
    /**
     * This gives us an opportunity to call a remote to check on their latest version etc.
     * or a bit manually approach, then we could just update this part to keep it up to date.
     */
    _this.env.options.availableFrameworks = [
        {name: 'Bootstrap' , value: 'bootstrap' , package: 'bootstrap' , ver: '^3.4.5' , alt: 'bootstrap-sass-official' , altver: '^3.4.5'},
        {name: 'Foundation', value: 'foundation' , package: 'foundation', ver : '^5.5.2'},
        {name: 'Semantic-UI', value: 'semantic' , package: 'semantic-ui', ver: '^2.0.8'},
        {name: 'Angular-Material' , value: 'material' , package: 'angular-material', ver: '^0.10.1'},
        {name: 'Materialize', value: 'materialize' , package: 'materialize' , ver: '^0.97.0'},
        {name: 'UIKit', value: 'uikit' , package: 'uikit', ver: '^2.21.0'},
        {name: 'AmazeUI' , value: 'amazeui' , package: 'amazeui' , ver: '^2.4.2'}
    ];

  	this.prompt([{
    	type: 'list',
    	name: 'uiframework',
    	message: 'Which UI Framework would you like to use?',
        choices: _this.env.options.availableFrameworks,
    	default: 'bootstrap'
  	}], function (props) {

        _this.uiframework = props.uiframework;

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
    var all = ['less' , 'sass' , 'css'];
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
    var framework = this.uiframework;
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
        // set this up for the template
        _.each(features , function(value , feature)
        {
            if (feature===framework) {
                return;
            }
            _this[ feature ] = false;
        });
        // also for the template
        all.forEach(function(oscss)
        {
            _this[oscss] = (style===oscss);
        });

        cb();
    }.bind(this));
    // next question
};

Generator.prototype.askForAnguar1xModules = function()
{
    var cb = this.async();
    // break this out so we can reuse it later
    var choices = [
        {value: 'animateModule', name: 'angular-animate.js', alias: 'ngAnimate', checked: true},
        {value: 'ariaModule', name: 'angular-aria.js', alias: 'ngAria', checked: false},
        {value: 'cookiesModule', name: 'angular-cookies.js', alias: 'ngCookie' , checked: true},
        {value: 'resourceModule', name: 'angular-resource.js', alias: 'ngResource', checked: true},
        {value: 'messagesModule', name: 'angular-messages.js', alias: 'ngMessage', checked: false},
        {value: 'routeModule', name: 'angular-route.js' , alias: 'ngRoute' , checked: true},
        {value: 'sanitizeModule', name: 'angular-sanitize.js', alias: 'ngSanitize', checked: true},
        {value: 'touchModule', name: 'angular-touch.js',alias: 'ngTouch',checked: true}
    ];

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
                _this[_mod_.value] = true;
            }
            else {
                _this[_mod_.value] = false;
            }
        });
        if (angMods.length) {
      		_this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
    	}
    	cb();
  	}.bind(this));
};

    /////////////////////////////////////////
    //      START COPYING FILES           //
    ////////////////////////////////////////

Generator.prototype.readIndex = function readIndex()
{
    this.ngRoute = this.env.options.ngRoute;

    // this is coming from the yeoman-generator inside the generator-karma - don't even ask how that's possible
    var _engine = function (body, data, options) {
        return engine.detect(body) ? engine(body, data, options) : body;
    };

    this.indexFile = _engine(this.read('app/index.html'), this);
};

Generator.prototype.copyStyleFiles = function()
{
  	var _this = this;
    var ext = _this.env.options.styleDev;
  	var cssFile = 'styles/main.' + (ext==='sass' ? 'scss' : ext);
   	this.copy(
    	path.join('app', cssFile),
    	path.join(this.appPath, cssFile)
  	);
};

Generator.prototype.appJs = function appJs() {
    this.indexFile = htmlWiring.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/scripts.js',
        sourceFileList: ['scripts/app.js', 'scripts/controllers/main.js'],
        searchPath: ['.tmp', this.appPath]
    });
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
    this.indexFile = this.indexFile.replace(/&apos;/g, "'");
    this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function()
{
    if (!this.appname) {
        this.appname = this.env.options.appNameAgain;
    }
    if (!this.appTplName) {
        this.appTplName = this.env.options.appTplName;
    }

    this.ngVer = "1.4.4"; // move back from template - we could do that in the remote in the future

    var f = _.findWhere(this.env.options.availableFrameworks , {value: this.uiframework});
    if (this.uiframework==='bootstrap' && this.env.options.styleDev==='sass') {
        this.bowerUIFramework = f.alt;
        this.bowerUIFrameworkVer = f.altver;
    }
    else {
        this.bowerUIFramework = f.package;
        this.bowerUIFrameworkVer = f.ver;
    }

    this.overwriteBower = false;

    /*
    @TODO

    add overwrite

    <% if (bootstrapless) { %>,
    "overrides": {
      "bootstrap": {
        "main": [
          "less/bootstrap.less",
          "dist/css/bootstrap.css",
          "dist/js/bootstrap.js"
        ]
      }
    }<% } %>

    */

    // inject our own config file - the this.config.save is useless
    this.template('root/_angularjs-config' , '.angularjs-config');
    // then the stock ones
  	this.template('root/_bower.json', 'bower.json');
  	this.template('root/_bowerrc', '.bowerrc');

  	if (this.env.options.taskRunner==='Gulp') {
    	this.template('root/_Gulpfile.js', 'Gulpfile.js');
        this.template('root/_package_gulp.json', 'package.json');
  	} else {
        this.template('root/_package_grunt.json', 'package.json');
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
function _injectDependencies()
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

Generator.prototype._injectDependencies = _injectDependencies;

// -- EOF --
