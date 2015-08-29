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
var ncp = require('ncp').ncp;
    ncp.limit = 16;
var exec = require('child_process').exec,
    child;

_.mixin(require('underscore.inflections'));

var angularUtils = require('../../lib/util');
var engine = require('../../lib/engines').underscore;
var Dot = require('../../lib/dot');
var preference = require('../../lib/preference');

// this is coming from the yeoman-generator inside the generator-karma - don't even ask how that's possible
var _engine = function (body, data, options)
{
    return engine.detect(body) ? engine(body, data, options) : body;
};

/**
 * Constructor
 * NOTE when we call this from inside panes.js generator we set the appPath to /app/client/web
 */
var Generator = module.exports = function(args, options)
{
    // calling the super
    yeoman.generators.Base.apply(this, arguments);

    // store all the answers
    this.answers = {};
    // getting the App name
  	this.argument('appname', { type: String, required: false });
  	this.appname = this.appname || path.basename(process.cwd());
    this.appTplName =  _.slugify( _.humanize(this.appname) );
    this.scriptAppName = _.camelize(this.appname) + angularUtils.appName(this);
    // the appname got lost somewhere down there.
    this.env.options.appNameAgain = this.appname;
    this.env.options.appTplName = this.appTplName;
    this.env.options.scriptAppName = this.scriptAppName;
    // condense into one method
    this._setOptions();
    // calling the sub generator
    args = ['main'];
    this.pkg = require('../../package.json');
  	this.sourceRoot(path.join(__dirname, '../templates/common'));

  	this.composeWith('ng-panes:main', {
    	args: args
  	});
  	this.composeWith('ng-panes:controller', {
    	args: args
  	});
    // when this end final callback
  	this.on('end', function ()
    {
        this._runFinalSetup();
  	});
};
// extending
util.inherits(Generator, yeoman.generators.Base);
/**
 * additional code to be call one after the other
 * this whole thing could be removed
 */
Generator.prototype.welcome = function()
{
  	if (!this.options['skip-welcome-message']) {
        var lang = this.env.options.lang;
        this.answers.lang = lang;
        var hello = (lang==='cn') ? '主人，很荣幸可以为你效劳' : 'Glad I can help, my lord.';
        var second = chalk.magenta('Yo Generator for AngularJS brought to you by ') + chalk.white('panes.im' + '\n');
        if (lang==='cn') {
            second = chalk.magenta('由') + chalk.white('panes.im') + chalk.magenta('提供的界面开发協助工具\n');
        }
    	this.log(yosay(hello));
    	this.log(second);
  	}
    this.answers.appname = this.env.options.appNameAgain;
    this.answers.appTplName = this.env.options.appTplName;
    this.answers.scriptAppName = this.env.options.scriptAppName;
};
/**
 * check if there is previously saved projects
 */
Generator.prototype.checkPreviousSavedProject = function()
{
    if (!this.env.options['skip-check']) {
        var savedProjects = preference.find();
        if (savedProjects) {
            var cb = this.async();
            var _this = this;
            var lang = this.env.options.lang;
            var def = (lang==='cn') ? '不了' : 'No';
            var choices = [{name: def , value: def}];
            _.each(savedProjects , function(v , d)
            {
                choices.push({name: v.appname + ' [' + d + ']', value: d});
            });
            this.prompt({
                type: 'list',
                name: 'previousVersion',
                message: (lang==='cn') ? '发现先前保存的项目设置.' : 'Found previous saved project.',
                choices: choices,
                default: def
            } , function(props)
            {
                if (props.previousVersion!==def) {
                    _this.env.options.previousProject = savedProjects[props.previousVersion];
                    _this._displayProject( savedProjects[props.previousVersion] );
                    _this.log(chalk.yellow(lang === 'cn' ? '使用保存的项目设置来建立新的项目。' : 'Using previous project setting to setup your new project'));
                }
                cb();
            }.bind(this));
        }
    }
};

/**
 * ask for what version of AngualarJS they want to use
 */
Generator.prototype.askForAngularVersion = function()
{
    var _this = this;
    if (!this.env.options.previousProject) {
        var cb = this.async();
        this.prompt({
            type: 'list',
            name: 'angularVersion',
            message: (this.env.options.lang==='cn') ? '你想用那个版本的AngularJS' : 'What version of AngularJS would you like to use',
            choices: [{name: 'V1.4.X' , value: '1.4.4'}, {name: 'V1.3.X' , value: '1.3.18'},{name: 'V2' , value: '2.0.0'}],
            default: '1.4.4'
        }, function(props) {
            if (props.angularVersion==='2.0.0') {
                _this.env.options.angularVersion ='1.4.4';
                var msg = (_this.env.options.lang==='cn') ? '现时只支技V.1.X版本，默认为V1.4.4版' : 'Sorry only support V1.X at the moment. Version set to V1.4.4';
                _this.log(chalk.red('\n'+msg+'\n'));
                // @TODO in the future set this to the TypeScript
                // _this.env.options.scriptingLang = 'TS';
            }
            else {
                _this.env.options.angularVersion = _this.answers.angularVersion = props.angularVersion;
            }
            cb();
        }.bind(this));
    }
    else {
        _this.env.options.angularVersion = _this.env.options.previousProject.angularVersion;
    }
};

/**
 * only going to use gulp from now on
 */
Generator.prototype.askForTaskRunner = function()
{
  	var cb = this.async();
  	var _this = this;
    var tr = 'Gulp';
    _this.env.options.taskRunner = _this.answers.taskRunner = tr;
    _this.gulp = (tr==='Gulp');
    _this.grunt = (tr==='Grunt');
    cb();
};
/**
 * Ask if the user want to use google analytics
 */
Generator.prototype.askForGoogle = function()
{
    var _this = this;
    if (!this.env.options.previousProject) {
        var cb = this.async();
        this.prompt({
            type: 'confirm',
            name: 'googleAnalytics',
            message: (this.env.options.lang==='cn') ? '你用谷歌的Analytics吗?' : 'Would you like to use Google Analytics?',
            default: (this.env.options.lang==='cn') ? false : true
        }, function(props) {
            this.googleAnalytics = this.answers.googleAnalytics = props.googleAnalytics;
            cb();
        }.bind(this));
    }
    else {
        _this.googleAnalytics = _this.env.options.previousProject.googleAnalytics;
    }
};

/**
 * If its AngularJS 1.x then we ask for what type of scripting they want to use.
 * V2 default to TypeScript
 */
Generator.prototype.askForScriptingOptions = function()
{
    var _this = this;
    if (!this.env.options.previousProject) {
        var cb = this.async();
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
            message: (this.env.options.lang==='cn') ? '你想使用那种方式开发你的Javascript呢?': 'What script would you like to use to develop your app?',
            choices: choices,
            default: defaultValue
        }, function(props) {
            var lang = props.scriptingLang;

            _this.env.options.scriptingLang = _this.answers.scriptingLang = lang;
            _this.scriptingLang = lang;
            _this.coffee     = (lang === 'CS');
          	_this.typescript = (lang === 'TS');

            cb();
        }.bind(this));
    }
    else {
        var p = _this.env.options.previousProject;
        _this.env.options.scriptingLang = p.scriptingLang;
        _this.scriptingLang = p.scriptingLang;
        _this.coffee     = (p.scriptingLang === 'CS');
        _this.typescript = (p.scriptingLang === 'TS');
    }
};

/**
 * we are going to list a few popular UI Frameworks to choose from
 */
Generator.prototype.askForUIFrameworks = function()
{
    var _this = this;
    /**
     * This gives us an opportunity to call a remote to check on their latest version etc.
     * or a bit manually approach, then we could just update this part to keep it up to date.
     */
    var frameworks = [
        {name: 'Bootstrap' , value: 'bootstrap' , package: 'bootstrap' , ver: '~3.3.5' , alt: 'bootstrap-sass-official' , altver: '~3.3.5'},
        {name: 'Foundation', value: 'foundation' , package: 'foundation', ver : '~5.5.2'},
        {name: 'Semantic-UI', value: 'semantic' , package: 'semantic-ui', ver: '~2.0.8'},
        {name: 'Angular-Material' , value: 'material' , package: 'angular-material', ver: '~0.10.1'},
        {name: 'Materialize', value: 'materialize' , package: 'materialize' , ver: '~0.97.0'},
        {name: 'UIKit', value: 'uikit' , package: 'uikit', ver: '~2.21.0'}
    ];
    var amazeui = {name: 'AmazeUI' , value: 'amazeui' , package: 'amazeui' , ver: '~2.4.2'};
    (lang==='cn') ? frameworks.unshift(amazeui) : frameworks.push(amazeui);
    _this.env.options.availableFrameworks = frameworks;

    if (!this.env.options.previousProject) {
        var cb = this.async();
        var lang = _this.env.options.lang;
      	this.prompt([{
        	type: 'list',
        	name: 'uiframework',
        	message:  (lang==='cn') ? '你想使用那个界面库呢？': 'Which UI Framework would you like to use?',
            choices: _this.env.options.availableFrameworks,
        	default: (lang==='cn') ? 'amazeui' : 'bootstrap'
      	}], function (props) {
            _this.uiframework = _this.answers.uiframework = props.uiframework;
        	cb();
      	}.bind(this));
    }
    else {
        _this.uiframework = _this.env.options.previousProject.uiframework;
    }
};


/**
 * @TODO this should change to a list of SASS , LESS OR CSS
 *       if they want LESS we could use the JS version during DEV
 */
Generator.prototype.askForStyles = function()
{
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
    var _setTheRest = function(_this , features , framework)
    {
        _.each(features , function(value , feature) {
            if (feature===framework) {
                return;
            }
            _this[ feature ] = false;
            all.forEach(function(oscss) {
                _this.env.options.cssConfig[feature + oscss] = false;
            });
        });
    };

    if (!this.env.options.previousProject) {
        var cb = this.async();
        this.prompt([{
            type: 'list',
            name: 'styleDev',
            message: (this.env.options.lang==='cn') ? '你想使用那种方式开发你的CSS呢？' : 'How would you like to develop your style?',
            choices: choices,
            default: 'CSS'
        }], function(props) {
            var style = props.styleDev.toLowerCase();
            _this.env.options.styleDev = _this.answers.styleDev = style;
            // we need to create a rather long variable for the template file as well
            _this.env.options.cssConfig = _this.answers.cssConfig = _this.answers.cssFeatureEnabled = {};
            // set this up for the template
            all.forEach(function(oscss) {
                _this.env.options.cssConfig[ framework + oscss ] = _this.answers.cssConfig[ framework + oscss ]  = (style===oscss);
                _this[oscss] = _this.answers.cssFeatureEnabled[oscss] = (style===oscss);
            });
            _setTheRest(_this , features , framework);
            cb();
        }.bind(this));
    }
    else { // restore variables
        var p = _this.env.options.previousProject;
        _this.env.options.styleDev = p.styleDev;
        _this.env.options.cssConfig = p.cssConfig;
        all.forEach(function(oscss)
        {
            _this[oscss] = p.cssFeatureEnabled[oscss];
        });
        _setTheRest(_this , features , framework);
    }
};

/**
 * asking for what module the user want to include in the app
 */
Generator.prototype.askForAnguar1xModules = function()
{
    var _this = this;
    var choices = [
        {value: 'animateModule', name: 'angular-animate.js', alias: 'ngAnimate', checked: true},
        {value: 'ariaModule', name: 'angular-aria.js', alias: 'ngAria', checked: false},
        {value: 'cookiesModule', name: 'angular-cookies.js', alias: 'ngCookies' , checked: true},
        {value: 'resourceModule', name: 'angular-resource.js', alias: 'ngResource', checked: true},
        {value: 'messagesModule', name: 'angular-messages.js', alias: 'ngMessage', checked: false},
        {value: 'routeModule', name: 'angular-route.js' , alias: 'ngRoute' , checked: true},
        {value: 'sanitizeModule', name: 'angular-sanitize.js', alias: 'ngSanitize', checked: true},
        {value: 'touchModule', name: 'angular-touch.js',alias: 'ngTouch',checked: true}
    ];
    var _setModules = function(angMods)
    {
        // inject the ngMaterial if the user choose angular-material for UI
        if (_this.uiframework==='material') {
            angMods.push('ngMaterial');
        }
        if (angMods.length) {
            _this.env.options.angularDeps = '\n    ' + angMods.join(',\n    ') + '\n  ';
        }
    };
    if (!this.env.options.previousProject) {
        var cb = this.async();
      	var prompts = [{
        	type: 'checkbox',
        	name: 'modules',
        	message: (this.env.options.lang==='cn') ? '你想使用那个Angular的模塊呢？' : 'Which modules would you like to include?',
        	choices: choices
      	}];
        var _this = this;
        _this.answers.ngMods = {};
        this.prompt(prompts, function (props) {
        	var hasMod = function (mod) {
                return props.modules.indexOf(mod) !== -1;
    		};
            var angMods = [];
            // start loop
            choices.forEach(function(_mod_) {
                var modName = _mod_.value;
                var yes = hasMod(modName);
                if (yes) {
                    angMods.push( "'"+_mod_.alias+"'" );
                    if (modName==='routeModule') {
                        _this.env.options.ngRoute = true;
                    }
                    _this[_mod_.value] = _this.answers.ngMods[_mod_.value] = true;
                }
                else {
                    _this[_mod_.value] = _this.answers.ngMods[_mod_.value] = false;
                }
            });
            _setModules(angMods);
        	cb();
      	}.bind(this));
    }
    else { // restore variables
        var p = _this.env.options.previousProject.ngMods;
        var allMods = {};
        var angMods = [];
        choices.forEach(function(mods)
        {
            allMods[mods.value] = mods;
        });
        _.each(p , function(enabled , modName)
        {
            _this[modName] = enabled;
            if (enabled) {
                if (modName==='routeModule') {
                    _this.env.options.ngRoute = true;
                }
                angMods.push( "'" + allMods[modName].alias + "'" );
            }
        });
        _setModules(angMods);
    }
};
/**
 * ask if the user want to save this into a project prefernce
 */
Generator.prototype.wantToSaveProject = function()
{
    if (!this.env.options.previousProject) {
        var cb = this.async();
        var _this = this;
        var lang = _this.env.options.lang;
        _this._displayProject(_this.answers);
        this.prompt({
            type: 'confirm',
            message: (lang==='cn') ? '你想把这个项目的设置保存吗?' : 'Would you like to save this project setting?',
            name: 'saveProjectSetting',
            default: true
        }, function(props) {
            if (props.saveProjectSetting) {
                preference.save(_this.answers , function(err)
                {
                    if (err) {
                        return _this.log.error(err);
                    }
                    _this.log(chalk.green(lang==='cn' ? '保存成功!' : 'Saved!'));
                });
            }
            cb();
        }.bind(this));
    }
};

    /////////////////////////////////////////
    //      START COPYING FILES           //
    ////////////////////////////////////////

/**
 * reading the index file into memory then changing in later on.
 */
Generator.prototype.readIndex = function()
{
    this.ngRoute = this.env.options.ngRoute;
    this.thisYear = (new Date()).getFullYear();
    /**
        2015-08-24 we slot a template into it according to its framework selection
    **/
    this.overwrite = _engine(this.read('root/templates/' + this.uiframework + '.html'), this);
    // fetch the index.html file into template engine
    this.indexFile = _engine(this.read('app/index.html'), this);
};

/**
 * copy the style file based on the style development question
 * @TODO copy the fonts folder based on the framework the user selected. Save a lot of trouble in the future
 */
Generator.prototype.copyStyleFiles = function()
{
  	var _this = this;
    var ext = _this.env.options.styleDev;

    _.each(_this.env.options.cssConfig , function(val , key) {
        _this[key] = val;
    });
  	var cssFile = 'styles/main.' + (ext==='sass' ? 'scss' : ext);
    var dest = path.join(this.appPath, cssFile);
    this.copy(
        path.join('app', cssFile),
        dest
    );
};
/**
 * append the application js files to the index.html
 */
Generator.prototype.appJs = function()
{
    this.env.options.installing = true;
    this.indexFile = htmlWiring.appendFiles({
        html: this.indexFile,
        fileType: 'js',
        optimizedPath: 'scripts/scripts.js',
        sourceFileList: ['scripts/app.js', 'scripts/controllers/main.js'],
        searchPath: ['.tmp', this.appPath]
    });
};
/**
 * finally writing the index.html to disk
 */
Generator.prototype.createIndexHtml = function()
{
    this.indexFile = this.indexFile.replace(/&apos;/g, "'")
                                   .replace('[[overwrite]]' , this.overwrite);
    // writing it to its dest
    this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};
/**
 * supporting files copy to the user folder
 */
Generator.prototype.packageFiles = function()
{
    if (!this.appname) {
        this.appname = this.env.options.appNameAgain;
    }
    if (!this.appTplName) {
        this.appTplName = this.env.options.appTplName;
    }
    if (!this.lang) {
        this.lang = this.env.options.lang;
    }
    this.ngVer = this.env.options.angularVersion; // move back from template - we could do that in the remote in the future
    this.modVer = '2.8.3';

    var f = _.findWhere(this.env.options.availableFrameworks , {value: this.uiframework});
    if (this.uiframework==='bootstrap' && this.env.options.styleDev==='sass') {
        this.bowerUIFramework = f.alt;
        this.bowerUIFrameworkVer = f.altver;
    }
    else {
        this.bowerUIFramework = f.package;
        this.bowerUIFrameworkVer = f.ver;
    }
    // move the bower file parameter out
    this._overRidesBower();
  	// 0.1.7 only use gulp
    this.template('root/_Gulpfile.js', 'Gulpfile.js');
    // same like bower
    this._configuratePackageJson();

    if (this.typescript) {
    	this.template('root/_tsd.json', 'tsd.json');
  	}
  	this.template('root/README.md', 'README.md');

    // inject our own config file - the this.config.save is useless
    this.template('root/_ng-panes-config' , '.ng-panes-config.json');
};
/**
 * This methods is moved from common/index.js
 * this is rather silly to have a setup call that could allow the user to call
 * what if someone call this - you wipe everything?
 */
Generator.prototype.setupEnv = function()
{
    var join = path.join;

    this.sourceRoot(join(__dirname, '../templates/common/root'));
    this.copy('.editorconfig');
    this.copy('.gitattributes');
    if (!this.env.options.coffee) {
        this.copy('.jscsrc');
    }
    this.copy('.jshintrc');
    this.copy('.yo-rc.json');

    this.copy('gitignore', '.gitignore');
    this.directory('test');

    this.sourceRoot(join(__dirname, '../templates/common'));
    var appPath = this.options.appPath;
    var copy = function (dest) {
        this.copy(join('app', dest), join(appPath, dest));
    }.bind(this);

    copy('404.html');
    copy('favicon.ico');
    copy('robots.txt');
    copy('views/main.html');

    this.directory(join('app', 'images'), join(appPath, 'images'));
};

        ///////////////////////////////////
        //         Helper files          //
        ///////////////////////////////////
/**
 * break out from the construtor and break out into its own function
 */
Generator.prototype._setOptions = function()
{
    // lang options
    this.option('cn' , {
        desc: 'Change to Chinese (使用中文版)',
        type: String
    });
    var lang = (this.options['cn']) ? 'cn' : 'en';
    this.env.options.lang = lang;
    // skip check previous project
    this.option('skip-check' , {
        desc: lang==='cn' ? '不用查看之前存檔的项目。' : 'Don\'t check for previous saved project.' ,
        type: String
    });
    this.option('sc' , {
        desc: lang==='cn' ? '不用查看之前存檔的项目。' : 'Don\'t check for previous saved project.' ,
        type: String
    });
    this.env.options['skip-check'] = this.options['sc'] || this.options['skip-check'];
    // app suffix
    var appSuffixMsg = (lang==='cn') ? '让你在每个自定模塊加上后缀' : 'Allow a custom suffix to be added to the module name';
  	this.option('app-suffix', {
    	desc: appSuffixMsg,
    	type: String
  	});
  	this.env.options['app-suffix'] = this.options['app-suffix'];
    // app path options
    var appPathMsg = (lang==='cn') ? '更改文件档路径(默认为 /app)' : 'Allow to choose where to write the files';
	// getting the app path
  	if (typeof this.env.options.appPath === 'undefined') {
    	this.option('appPath', {
      		desc: appPathMsg
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
};

/**
 * @TODO figure out a different way to test the app instead of using Karma:app
 */
Generator.prototype._installKarmaApp = function()
{
    var jsExt = this.coffee ? 'coffee' : 'js';
    var bowerComments = [
        'bower:js',
        'endbower'
    ];
    if (this.options.coffee) {
        bowerComments.push('bower:coffee');
        bowerComments.push('endbower');
    }
    // this one keep trying to overwrite the package.json?
    this.composeWith('karma:app', {
        options: {
            'skip-install': this.env.options['skip-install'],
            'base-path': '../',
            'coffee': this.coffee,
            'travis': true,
            'files-comments': bowerComments.join(','),
            'app-files': 'app/scripts/ * * / *.' + jsExt,
            'test-files': [
                'test/mock/ * * / *.' + jsExt,
                'test/spec/ * * / *.' + jsExt
            ].join(','),
            'bower-components-path': 'app/bower_components'
        }
    });
};

/**
 *  move those riduclous template bit here instead
 */
Generator.prototype._configuratePackageJson = function()
{
    var enp = [];
    // oocss
    if (this.sass) {
        enp.push('\t"gulp-ruby-sass": "~0.4.3"');
    }
    else if (this.less) {
        enp.push('\t"gulp-less":"~3.0.3"');
    }
    // scripting
    if (this.coffee) {
        enp.push('\t"gulp-coffeelint": "~0.5.0"' , '\n"gulp-coffee": "~2.3.1"');
    } else if (this.typescript) {
        enp.push('\t"gulp-typescript" : "~2.8.0"');
    }
    // generate
    this.extraNodePackage = (enp.length>0) ? ','  + enp.join(',\n') : '';
    this.template('root/_package_gulp.json', 'package.json');
}

/**
 * adding bower overrides property
 */
Generator.prototype._overRidesBower = function()
{
    this.overwriteBower = false;
    var _this = this,
        style = _this.env.options.styleDev,
        fontFolder = [],
        files = [];

    switch (_this.uiframework) {
        case 'bootstrap':
            files = (style==='sass') ? ['assets/javascript/bootstrap.js'] : ['dist/js/bootstrap.js'];
            if (style==='css') {
                files.push('dist/css/bootstrap.css');
            }
            else {
                fontFolder = (style==='sass') ? ['assets' , 'fonts' , 'bootstrap'] : ['fonts'];
            }
        break;
        case 'amazeui':
            files = ['dist/js/amazeui.js'];
            if (style==='css') {
                files.push('dist/css/amazeui.css');
            }
            else {
                fontFolder = ['fonts'];
            }
        break;
        case 'foundation':
            files = ['js/foundation.js'];
            if (style==='css') {
                files.push('css/foundation.css');
            }
        break;
        case 'semantic-ui':
            files = ['dist/semantic.js'];
            if (style==='css') {
                files.push('dist/semantic.css');
            }
            else {
                fontFolder = ['dist','themes','default','assets','fonts'];
            }
        break;
        case 'materialize':
            files = ['dist/js/materialize.js'];
            if (style==='css') {
                files.push('dist/css/materialize.css');
            }
            else {
                fontFolder = ['font'];
            }
        break;
        case 'uikit':
            files = ['dist/js/uikit.js'];
            if (style==='css') {
                files.push('dist/css/uikit.css');
            }
            else {
                fontFolder = ['fonts'];
            }
        break;
        case 'material':
            files = ['angular-material.js'];
            if (style==='css') {
                files.push('angular-material.css');
            }
        break;
        default:
            // there is nothing to do here, just to keep jshint happy
    }
    this.env.options.fontFolder = fontFolder;

    if (files.length>0) {
        var ow = '\t"' + _this.uiframework + '": {\n\t\t\t"main": ["';
            ow += files.join('","');
            ow += '"]\t\n\t\t}\n';
        _this.overwriteBower = ow;
    }
    // then the stock ones
  	this.template('root/_bower.json', 'bower.json');
  	this.template('root/_bowerrc', '.bowerrc');
};
/**
 * abandone the original injectDependences , its completely useless.
 */
Generator.prototype._runFinalSetup = function()
{
    var _this = this;
    var lang = _this.env.options.lang;
    if (!_this.options['skip-install']) {
        var bm = (lang==='cn') ? '正在执行 npm install && bower install 指令，请去上个厕所，抽根煙，弄杯咖啡，補補妆，打电话给你爸妈 ... 回来时任务应该完成了。'
                               : 'Running npm install && bower install, go get yourself a coffee, go to the toilet, powder your nose , call your mom ... it will be ready when you are back.';
        var beginning = (lang==='cn') ? '下载中' : 'Downloading';
        var command = 'npm install && bower install';// npm install &&
        var dotting = new Dot({
                beforeMsg: bm,
                beginning: beginning
            });
        // execute command
        exec(command , function(error) {
            dotting.finish();
            if (error !== null) {
                var errorMsg = (lang==='cn') ? '下载出错了 >_< 请再次运行`npm install && bower install`指令' : 'package install error, please re-run `npm install && bower install` again!';
                _this.log.error(errorMsg);
                _this.log(error);
            }
            else {
                _this._moveFontFiles();
                // completed
                var finalMsg = (lang==='cn') ? '任务完成，所有外加插件下载成功。' : 'Phew, deps are all downloaded.';
                _this.log(chalk.yellow(finalMsg));
                var taskRunner = _this.env.options.taskRunner;
                _this.env.options.installing  = false;
                // go straight to gulp
                _this.spawnCommand(taskRunner.toLowerCase() , ['firstrun']);
            }
        });
    }
    // this never works!
    this.config.save('scriptingLang' , this.scriptingLang);
    this.config.save('uiframework' , this.uiframework);
    this.config.save('lang' , this.lang);
};

/**
 * copy font files folder to styles/fonts folder for consistency
 */
Generator.prototype._moveFontFiles = function()
{
    var _this = this;
    var ff = _this.env.options.fontFolder;
    if (ff.length>0) {
        var dest = './' + _this.appPath + '/styles/' + ff.join('/');
        var source = './' + _this.appPath + '/bower_components/' +  _this.uiframework + '/' + ff.join('/');
        ncp(source , dest , function(err)
        {
            if (err) {
                return _this.log.error(err);
            }
            _this.log('font folder copied');
        });
    }
};

/**
 * display project before save or re-use
 */
Generator.prototype._displayProject = function(project)
{
    var getFeatureName = function(name)
    {
        var lang = _this.env.options.lang;
        var names = {
            'lang': {cn: '语言' , en: 'Language'},
            'angularVersion': {cn: 'Angular版本' , en: 'Angular Version'},
            'googleAnalytics': {cn: '使用谷歌Analytics' , en: 'Google Analytics'},
            'scriptingLang': {cn: 'Javascript开发' , en: 'Javascripting langugage'},
            'uiframework': {cn: '界面库' , en: 'UI Framework'},
            'styleDev': {cn: 'CSS开发方式' , en: 'Style development'},
            'ngMods': {cn: 'Angular模塊' , en: 'Angular Modules'},
            'appname': {cn: '项目名' , en: 'AppName'}
        };
        return (names[name]) ? names[name][lang] : false;
    };
    var _this = this;
    var lang = _this.env.options.lang;
    var y = chalk.yellow;
    var scriptingLangs = {
        'JS': 'Javascript',
        'CS': 'CoffeeScript',
        'TS': 'TypeScript'
    };
    _.each(project , function(value , key)
    {
        var name = getFeatureName(key);
        if (name) {
            var result = name + ':';
            if (_.isString(value)) {
                if (key==='lang') {
                    result += y((value==='cn') ? '中文' : 'English');
                }
                else if (key==='scriptingLang') {
                    result += y(scriptingLangs[value]);
                }
                else {
                    result += y(value);
                }
            }
            else if (_.isBoolean(value)) {
                result += y((value) ? 'Y' : 'N');
            }
            else if (_.isArray(value)) {
                result += y(value.join(','));
            }
            else {
                var n = [];
                _.each(value , function(v,k)
                {
                    if (v) {
                        n.push(k);
                    }
                });
                result += y(n.join(','));
            }
            _this.log(result);
        }
    });
};
// -- EOF --
