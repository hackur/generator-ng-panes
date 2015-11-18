'use strict';
/**
10 Nov 2015 - decided after cleaning up this and finish the component
sub generator - this will declare 1.0.0 release (skip beta)
and start a brand new ng-es6 instead
**/

var fs          = require('fs');
var path        = require('path');
var util        = require('util');
var yeoman      = require('yeoman-generator');
var yosay       = require('yosay');
var wiredep     = require('wiredep');
var chalk       = require('chalk');
var glob        = require('glob');
var isInstalled = require('is-installed');
var _           = require('underscore');
var ncp         = require('ncp').ncp;
    ncp.limit   = 16;
var exec        = require('child_process').exec,
    child;

_.mixin(require('underscore.inflections'));

var angularUtils = require('../../lib/util');
var engine = require('../../lib/engines').underscore;
var Dot = require('../../lib/dot');
var preference = require('../../lib/preference');
// @TODO this really should be replace with a json file to keep track of all the version numbers
var angularLatestVersion = '1.4.7';

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
    this.panesConfig = false;
    // condense into one method
    this._setOptions();
    // getting the App name
    this._getAppName();

    this.pkg = require('../../package.json');
  	this.sourceRoot(path.join(__dirname, '../templates/common'));

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
    var self = this;
    var lang = this.env.options.lang;
    var cb = this.async();
    self.answers.lang = lang;
    preference.init(lang).then(function(panes)
    {
        self.panesConfig = panes;
        if (panes && panes.ui && panes.ui!=='ng-panes:app') {
            self.log.error('Sorry you did not register the panes app with us. You need to use ' + panes.ui.replace(':app' , '') + ' instead.');
            throw 'terminate';
        }
        // we need to overwrite all those appPath lang etc
        self._overwriteOptions(panes);

      	if (!self.options['skip-welcome-message'] && !panes) {
            var lang = self.env.options.lang;
            var hello = (lang==='cn') ? '主人，很荣幸可以为你效劳' : 'Glad I can help, my lord.';
            var second = chalk.magenta('Yo Generator for AngularJS brought to you by ') + chalk.white('panesjs.com' + '\n');
            if (lang==='cn') {
                second = chalk.magenta('由') + chalk.white('panesjs.com') + chalk.magenta(' 提供的界面开发協助工具\n');
            }
        	self.log(yosay(hello));
        	self.log(second);
      	}
        cb();
    });
};

/**
 * delete previous saved project
 */
Generator.prototype.manageProjects = function()
{
    var self = this;
    if (self.env.options.projects && !this.panesConfig) {
        var savedProjects = preference.findProjects();
        if (savedProjects) {
            var cb = self.async();
            var choices = [];
            _.each(savedProjects , function(project , date)
            {
                choices.push({value: date , name: project.appname + ' - ' + date , checked: false});
            });
            self.prompt({
                type: 'checkbox',
                name: 'toDeleteProjects',
                choices: choices,
                message: (self.answers.lang==='cn') ? '请选择要删除的项目.' : 'Please select the project(s) you want to delete.'
            }, function(props)
            {
                preference.remove(props.toDeleteProjects);
                cb();
            });
        }
    }
};

/**
 * check if there is previously saved projects - ditch this completely?
 */
Generator.prototype.checkPreviousSavedProject = function()
{
    if (!this.env.options['skip-check'] && !this.panesConfig) {
        var savedProjects = preference.findProjects();
        if (savedProjects) {
            var cb = this.async();
            var self = this;
            var lang = this.env.options.lang;
            var def = (lang==='cn') ? '不了' : 'No thanks';
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
                    self.env.options.previousProject = savedProjects[props.previousVersion];
                    self._displayProject( savedProjects[props.previousVersion] );
                    self.log(chalk.yellow(lang === 'cn' ? '使用保存的项目设置来建立新的项目。' : 'Using previous project setting to setup your new project'));
                }
                cb();
            }.bind(this));
        }
    }
};

/**
 * We ask for the appName again only when the user didn't supply one
 * not working here
 */
Generator.prototype.askForAppName = function()
{
	var self = this;
	if (this.baseNameOption) {
        if (!this.panesConfig) {
    		var cb = this.async();
    		var appName = this.env.options.appNameAgain;
    		var msg = (this.env.options.lang==='cn') ? '你现时的项目名是:`' + appName + '`, 你想修改吗？'
    												 : 'Your appname is: `' + appName + '`, would you like to change it?';
    		this.prompt({
    	        type: 'input',
    	        name: 'appname',
    	        message: msg,
    	        default: appName
    	    }, function(props) {
    	        self._getAppName(props.appname);
    	        cb();
    	    }.bind(this));
        }
        else {
            self._getAppName(self.panesConfig.appname);
        }
	}
};

/**
 * ask for what version of AngualarJS they want to use
 */
Generator.prototype.askForAngularVersion = function()
{
    var self = this;
    self.answers.angularBigVer = 1;
    // now we need to ask if they want to use 1.4.X or 1.5.X
    var cb = self.async();
    self.prompt([{
        type: 'list',
        name: 'angularLatestVersion',
        message:  (self.lang==='cn') ? '你想使用那个界面库呢？': 'Which version of Angular would you like to use?',
        choices: [{name: '1.4.X', value: '1.4.7'} , {name: '1.5.X' , value: '1.5.0-beta.0'}],
        default: '1.4.7'
    }], function (props) {
        self.env.options.angularVersion = self.answers.angularVersion = props.angularLatestVersion;
        cb();
    }.bind(this));
};

/**
 * only going to use gulp from now on
 */
Generator.prototype.askForTaskRunner = function()
{
  	var self = this;
    var tr = 'Gulp';
    self.env.options.taskRunner = self.answers.taskRunner = tr;
    self.gulp = (tr==='Gulp');
    self.grunt = (tr==='Grunt');
};

/**
 * If its AngularJS 1.x then we ask for what type of scripting they want to use.
 * V2 default to TypeScript
 */
Generator.prototype.askForScriptingOptions = function()
{
    var self = this;
    var no = false;
    if (!this.env.options.previousProject) {
        var lang = 'JS';
        self.env.options.scriptingLang = self.answers.scriptingLang = lang;
        self.scriptingLang = lang;
        self.coffee     = no;
        self.typescript = no;
    }
    else {
        var p = self.env.options.previousProject;
        self.env.options.scriptingLang = p.scriptingLang;
        self.scriptingLang = p.scriptingLang;
        self.coffee     = no;
        self.typescript = no;
    }
};

/**
 * we are going to list a few popular UI Frameworks to choose from
 */
Generator.prototype.askForUIFrameworks = function()
{
    var self = this;
    /**
     * This gives us an opportunity to call a remote to check on their latest version etc.
     * or a bit manually approach, then we could just update this part to keep it up to date.
     */
    var frameworks = [
        {name: 'Bootstrap' , value: 'bootstrap' , package: 'bootstrap' , ver: '~3.3.5' , alt: 'bootstrap-sass-official' , altver: '~3.3.5'},
        // {name: 'Material Bootstrap' , value: 'bootstrap-material' , package: 'bootstrap-material-design' , ver: '~0.3.0'},
        {name: 'Foundation', value: 'foundation' , package: 'foundation', ver : '~5.5.2'},
        {name: 'Semantic-UI', value: 'semantic' , package: 'semantic-ui', ver: '~2.1.3'},
        {name: 'Angular-Material' , value: 'material' , package: 'angular-material', ver: '~0.10.1'},
        {name: 'Materialize', value: 'materialize' , package: 'materialize' , ver: '~0.97.0'},
        {name: 'UIKit', value: 'uikit' , package: 'uikit', ver: '~2.21.0'}
    ];
    var lang = self.env.options.lang;
    var amazeui = {name: 'AmazeUI' , value: 'amazeui' , package: 'amazeui' , ver: '~2.4.2'};
    var _do_ = (lang==='cn') ? frameworks.unshift(amazeui) : frameworks.push(amazeui);
    self.env.options.availableFrameworks = frameworks;
    if (!this.env.options.previousProject) {
        var cb = this.async();
      	this.prompt([{
        	type: 'list',
        	name: 'uiframework',
        	message:  (lang==='cn') ? '你想使用那个界面库呢？': 'Which UI Framework would you like to use?',
            choices: self.env.options.availableFrameworks,
        	default: (lang==='cn') ? 'amazeui' : 'bootstrap'
      	}], function (props) {
            self.uiframework = self.answers.uiframework = props.uiframework;
        	cb();
      	}.bind(this));
    }
    else {
        self.uiframework = self.env.options.previousProject.uiframework;
    }
};


/**
 * @TODO this should change to a list of SASS , LESS OR CSS
 *       if they want LESS we could use the JS version during DEV
 */
Generator.prototype.askForStyles = function()
{
  	var self = this;
    var all = ['less' , 'sass' , 'css'];
    // we take the last value `framework` to determinen what they can use next
    var features = {
        'bootstrap' : ['LESS' , 'SASS'],
        'bootstrap-material': ['LESS' , 'SASS'],
        'foundation' : ['SASS'],
        'semantic' : ['LESS'],
        'material' : ['SASS'],
        'materialize' : ['SASS'],
        'uikit' : ['LESS' , 'SASS'],
        'amazeui': ['LESS']
    };
    var framework = this.uiframework;
    var choices = ['CSS'].concat( features[ framework ] );
    var _setTheRest = function(self , features , framework)
    {
        _.each(features , function(value , feature) {
            if (feature===framework) {
                self[feature] = true;
                return;
            }
            self[ feature ] = false;
            all.forEach(function(oscss) {
                self.env.options.cssConfig[feature + oscss] = false;
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
            self.env.options.styleDev = self.answers.styleDev = style;
            // we need to create a rather long variable for the template file as well
            self.env.options.cssConfig = self.answers.cssConfig = self.answers.cssFeatureEnabled = {};
            // set this up for the template
            all.forEach(function(oscss) {
                self.env.options.cssConfig[ framework + oscss ] = self.answers.cssConfig[ framework + oscss ]  = (style===oscss);
                self[oscss] = self.answers.cssFeatureEnabled[oscss] = (style===oscss);
            });
            _setTheRest(self , features , framework);
            cb();
        }.bind(this));
    }
    else { // restore variables
        var p = self.env.options.previousProject;
        self.env.options.styleDev = p.styleDev;
        self.env.options.cssConfig = p.cssConfig;
        all.forEach(function(oscss)
        {
            self[oscss] = p.cssFeatureEnabled[oscss];
        });
        _setTheRest(self , features , framework);
    }
};

Generator.prototype._setModules = function(angMods)
{
    var self = this;
    // inject the ngMaterial if the user choose angular-material for UI
    if (self.uiframework==='material') {
        angMods.push('\'ngMaterial\'');
    }
    if (angMods.length) {
        angMods.forEach(function(mod)
        {
            if (self.env.options.angularDeps.indexOf(mod) > -1) {
                return;
            }
            self.env.options.angularDeps.push(mod);
        });
    }
};

/**
 * asking for what module the user want to include in the app
 */
Generator.prototype.askForAnguarModules = function()
{
    var self = this;
    var choices = [];
    if (self.answers.angularBigVer!==2) {
        choices = [
            {value: 'animateModule', name: 'angular-animate.js', alias: 'ngAnimate', checked: true},
            {value: 'ariaModule', name: 'angular-aria.js', alias: 'ngAria', checked: false},
            {value: 'cookiesModule', name: 'angular-cookies.js', alias: 'ngCookies' , checked: true},
            {value: 'resourceModule', name: 'angular-resource.js', alias: 'ngResource', checked: true},
            {value: 'messagesModule', name: 'angular-messages.js', alias: 'ngMessage', checked: false},
            {value: 'sanitizeModule', name: 'angular-sanitize.js', alias: 'ngSanitize', checked: true},
            {value: 'touchModule', name: 'angular-touch.js',alias: 'ngTouch',checked: true}
        ];
        // new stuff if this is from a panes setup, and the user setup a socket.
        // then we will add a socket-to-angular module to it
        if (this.panesConfig.socket) {
            choices.push({value: 'angular-socket-io' , name: 'angular-socket-io' , alias: 'btford.socket-io' , checked: true , ver: '^0.7.0'});
        }
    }

    if (!this.env.options.previousProject) {
        var cb = this.async();
      	var prompts = [{
        	type: 'checkbox',
        	name: 'modules',
        	message: (this.env.options.lang==='cn') ? '你想使用那个 Angular 的模塊呢？' : 'Which modules would you like to include?',
        	choices: choices
      	}];
        self.answers.ngMods = {};
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
                        self.env.options.ngRoute = true;
                    }
                    self[_mod_.value] = self.answers.ngMods[_mod_.value] = true;
                }
                else {
                    self[_mod_.value] = self.answers.ngMods[_mod_.value] = false;
                }
            });
            self._setModules(angMods);
        	cb();
      	}.bind(this));
    }
    else { // restore variables
        var p = self.env.options.previousProject.ngMods;
        var allMods = {};
        var angMods = [];
        choices.forEach(function(mods)
        {
            allMods[mods.value] = mods;
        });
        _.each(p , function(enabled , modName)
        {
            self[modName] = enabled;
            if (enabled) {
                if (modName==='routeModule' || modName==='ui-router') {
                    self.env.options.ngRoute = modName;
                }
                angMods.push( "'" + allMods[modName].alias + "'" );
            }
        });
        self._setModules(angMods);
    }
};

/**
 * the ngRoute and uiRoute separate into two different questions now
 */
Generator.prototype.whichRouterToUse = function()
{
    var self = this;
    if (self.answers.angularBigVer!==2) {
        var cb = self.async();
        var choices = [
            {value: 'routeModule', name: 'angular-route.js' , alias: 'ngRoute' , checked: false},
            {value: 'ui-router' , name: 'angular-ui-router' , alias: 'ui.router' , checked: false , version: '0.2.15'}
        ];
        var prompts = [{
        	type: 'list',
        	name: 'modules',
        	message: (this.env.options.lang==='cn') ? '你想使用那个(Router)的模塊呢？' : 'Which Router would you like to use?',
        	choices: choices
      	}];
        self.prompt(prompts, function (props) {

            self.answers.ngRoute = props.modules;
            self.ngRouteTag = (props.modules==='routeModule') ? 'ng-view' : 'ui-view';
            self.routeModuleName = props.modules;
            self.routeModuleVersion = (props.modules==='routeModule') ? self.ngVer : '0.2.15'; // hardcode this for now, change later

            choices.forEach(function(_mod_) {
                var modName = _mod_.value;
                if (modName === self.answers.ngRoute) {
                    // angMods.push( "'"+_mod_.alias+"'" );
                    self[modName] = self.answers.ngMods[modName] = true;
                    self.env.options.angularDeps.push("'" + _mod_.alias + "'");
                    // self.env.options.angularDeps += ',\n\'' + _mod_.alias + '\' \n  ';
                }
                else {
                    self[modName] = self.answers.ngMods[modName] = false;
                }
            });
            cb();
        }.bind(self));
    }
};

/**
 * ask if the user want to save this into a project prefernce
 * don't ask if they are using this inside the panesjs project
 */
Generator.prototype.wantToSaveProject = function()
{
    if (!this.env.options.previousProject && !this.panesConfig) {
        var cb = this.async();
        var self = this;
        var lang = self.env.options.lang;
        self._displayProject(self.answers);
        this.prompt({
            type: 'confirm',
            message: (lang==='cn') ? '你想把这个项目的设置保存吗?' : 'Would you like to save this project setting?',
            name: 'saveProjectSetting',
            default: false
        }, function(props) {
            if (props.saveProjectSetting) {
                preference.save(self.answers , function(err)
                {
                    if (err) {
                        return self.log.error(err);
                    }
                    self.log(chalk.blue(lang==='cn' ? '保存成功!' : 'Saved!'));
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
 * don't create index file when this is inside the panesjs project
 */
Generator.prototype.createIndexHtml = function()
{
    this.ngRoute = this.env.options.ngRoute;
    this.thisYear = (new Date()).getFullYear();
    if (this.panesConfig) {
        // here we copy over a stock template to the index.swig.html
        this.template(path.join('root' , 'panes-templates' , this.uiframework + '.html') ,
                      path.join(this.panesConfig.appPath , 'server' , 'views' , 'index.html'));
    }
    else {
        // 2015-08-24 we slot a template into it according to its framework selection
        this.overwrite = _engine(this.read( path.join('root' , 'templates' , this.uiframework + '.html') ), this);

        this.template(  path.join('app' , 'index.html'),
                        path.join(this.appPath, 'index.html'));
    }
};

/**
 * copy the style file based on the style development question
 * @TODO copy the fonts folder based on the framework the user selected. Save a lot of trouble in the future
 */
Generator.prototype.copyStyleFiles = function()
{
  	var self = this;
    var ext = self.env.options.styleDev;

    _.each(self.env.options.cssConfig , function(val , key) {
        self[key] = val;
    });
  	var cssFile = path.join('styles' , 'main.' + (ext==='sass' ? 'scss' : ext));

    var dest = path.join(this.appPath, cssFile);
    this.copy(
        path.join('app', cssFile),
        dest
    );
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

    var gulpFile = (this.panesConfig) ?  '_gulpfile-panes.js' : '_Gulpfile.js';

    this.template(path.join('root' , gulpFile), 'gulpfile.js');
    // same like bower
    this._configuratePackageJson();

  	this.template('root/README.md', 'README.md');

    this.appPath = this.env.options.appPath;
    // inject our own config file - the this.config.save is useless
    this.integrateWithPanes = (this.panesConfig) ? true : false;
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
    var appPath = this.options.appPath;
    this.sourceRoot(join(__dirname, '..' , 'templates' , 'common' , 'root'));

    if (!this.panesConfig) {

        this.copy('.editorconfig');
        this.copy('.gitattributes');

        if (!this.env.options.coffee) {
            this.copy('.jscsrc');
        }
        this.copy('.jshintrc');
        this.copy('.yo-rc.json');
        this.copy('gitignore', '.gitignore');

        this.sourceRoot(join(__dirname, '..' , 'templates' , 'common'));

        var copy = function (dest) {
            this.copy(join('app', dest), join(appPath, dest));
        }.bind(this);

        copy('404.html');
        copy('favicon.ico');
        copy('robots.txt');
        copy('views/main.html');

    }
    else {
        this.sourceRoot(join(__dirname, '..' , 'templates' , 'common'));
        this.copy(join('app' , 'views' , 'main.html') , join(this.appPath , 'views' , 'main.html'));
    }

    this.directory(join('app', 'images'), join(appPath, 'images'));
};

/**
 * install app
 */
Generator.prototype.installNgApp = function()
{
    // calling the sub generator
    var args = ['main'];

  	this.composeWith('ng-panes:main', {
    	args: args,
        options: {
            appPath: this.appPath,
            panesConfig: this.panesConfig
        }
  	});
  	this.composeWith('ng-panes:controller', {
    	args: args,
        options: {
            appPath: this.appPath,
            panesConfig: this.panesConfig
        }
  	});
};

        ///////////////////////////////////
        //         Helper methods        //
        ///////////////////////////////////

/**
 * fetching the appName, port back from panejs
 */
Generator.prototype._getAppName = function(appName)
{
    if (!appName) {
		this.baseNameOption = false;
		if (!this.appname) {
			this.appname = path.basename(process.cwd());
			this.baseNameOption=true;
		}
	}
	else {
		this.appname = appName;
		this.baseNameOption = false;
	}
    this.appTplName =  _.slugify( _.humanize(this.appname) );
    this.scriptAppName = _.camelize(this.appname);
    // the appname got lost somewhere down there.
    this.env.options.appNameAgain = this.answers.appname = this.appname;
    this.env.options.appTplName = this.answers.appTplName = this.appTplName;
	this.env.options.scriptAppName = this.answers.scriptAppName = this.scriptAppName;
};

/**
 * different names and all kind of different things ...
 */
Generator.prototype._getUIFramework = function(name)
{
    var self = this;
    var frameworks = self.env.options.availableFrameworks;
    var idx = _.findWhere(frameworks , {value: name});
    return idx;
};

/**
 * break out from the construtor and break out into its own function
 */
Generator.prototype._setOptions = function()
{
    this.argument('appname', { type: String, required: false });
    // lang options
    this.option('cn' , {
        desc: 'Change to Chinese (使用中文版)',
        type: String
    });
    var lang = (this.options.cn) ? 'cn' : 'en';
    this.env.options.lang = lang;
    // skip check previous project
    this.option('skip-check' , {
        desc: lang==='cn' ? '不用查看之前存檔的项目。' : 'Don\'t check for previous saved project.' ,
        type: String
    });
    this.option('sc' , {
        desc: lang==='cn' ? '不用查看之前存檔的项目(缩写)。' : 'Don\'t check for previous saved project (shorthand).' ,
        type: String
    });
    this.env.options['skip-check'] = this.options.sc || this.options['skip-check'];
    this.answers.skipCheck = this.env.options['skip-check'];
    // manage previous project
    this.option('projects' , {
        desc: lang === 'cn' ? '管理现有保存的项目设定.' : 'Manage your saved projects',
        type: String
    });
    this.env.options.projects = this.answers.projects = this.options.projects;

    // app path options
    // need to figure out how to force this, and when this is inside the panes installation. This
    // need to follow the parent installation directory structure
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

  	this.appPath = this.answers.appPath = this.env.options.appPath;
    // set a src path one way or the other
    if (typeof this.env.options.srcPath === 'undefined') {
        try {
            this.env.options.srcPath = require( path.join(process.cwd() , 'bower.json') ).srcPath;
        } catch(e) {}
        this.env.options.srcPath = this.env.options.srcPath || 'src';
        this.options.srcPath = this.env.options.srcPath;
    }
    this.srcPath = this.answers.srcPath = this.options.srcPath;
    // set this up as an array now, better formatting
    this.env.options.angularDeps = [];
};
/**
 * overwriting the options
 */
Generator.prototype._overwriteOptions = function(panes)
{
    if (panes) {
        this.env.options.appPath = panes.webAppPath;
        this.appPath = this.answers.appPath = this.env.options.appPath;
        this.env.options.lang = this.answers.lang = panes.lang;
    }
};

/**
 * @TODO figure out a different way to test the app instead of using Karma:app
 */
Generator.prototype._installKarmaApp = function()
{
    var self = this;
    var jsExt = 'js';
    var yeoman = require('yeoman-environment');
    self.yeomanEnv = yeoman.createEnv();
    // we need to check if the other generator is install on this system
    self.yeomanEnv.lookup(function ()
    {
        var meta = self.yeomanEnv.getGeneratorsMeta();
        if (meta['karma:app']) {
            // this one keep trying to overwrite the package.json?
            self.composeWith('karma:app', {
                options: {
                    'skip-install': true , //this.env.options['skip-install'],
                    'base-path': '../',
                    'coffee': false,
                    'travis': true,
                    //'files-comments': bowerComments.join(','),
                    'app-files': 'app/scripts/**/*.' + jsExt,
                    'test-files': [
                        'test/mock/**/*.' + jsExt,
                        'test/spec/**/*.' + jsExt
                    ].join(','),
                    'bower-components-path': 'app/bower_components'
                }
            });
        }
        else {
            var lang = self.env.options.lang;
            var msg = lang==='cn' ? '由于在你的系统里找不到 generator-karma,所以现在不会安装测试。请使用 `npm install -g generator-karma` 指令安装。'
                                       : 'We couldn\'t find generator-karma install on your system. Skip installation. Please run `npm install -g generator-karma` to install.';
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
        enp.push('\t"gulp-sass": "~2.0.2"');
    }
    else if (this.less) {
        enp.push('\t"gulp-less":"~3.0.3"');
    }
    // scripting
    if (this.coffee) {
        enp.push('\t"gulp-coffeelint": "~0.5.0"');
        enp.push('\n"gulp-coffee": "~2.3.1"');
    } else if (this.typescript) {
        enp.push('\t"gulp-typescript" : "~2.8.0"');
    }
    // generate
    this.extraNodePackage = (enp.length>0) ? ','  + enp.join(',\n') : '';
    var pkgFile = path.join('root','_package_gulp.json');
    if (!this.panesConfig) {
        this.template(pkgFile, 'package.json');
    }
    else {
        // generate our one
        var packageFile = _engine(this.read(pkgFile), this);
        if (!_.isObject(packageFile)) {
            packageFile = JSON.parse(packageFile);
        }
        // get the existing one
        var packageJson = path.join(process.cwd() , 'package.json');
        // here we want to read this file then merge witt the existing one
        var existingConfig = require(packageJson);
        var newPkg = _.extend({} , existingConfig);

        // the underscore method is not really merge just over write
        _.each(packageFile.dependencies , function(value , key)
        {
            newPkg.dependencies[key] = value;
        });
        _.each(packageFile.devDependencies , function(value , key)
        {
            newPkg.devDependencies[key] = value;
        });
        // console.log(newPkg);
        fs.writeFile(packageJson , JSON.stringify(newPkg, null , 4) , function(err)
        {
            if (err) {
                throw err;
            }
        });
    }
};

/**
 * adding bower overrides property
 */
Generator.prototype._overRidesBower = function()
{
    this.overwriteBower = false;
    var self = this,
        style = self.env.options.styleDev,
        fontFolder = [],
        files = [];

    switch (self.uiframework) {
        case 'bootstrap':
            files = (style==='sass') ? ['assets/javascript/bootstrap.js'] : ['dist/js/bootstrap.js'];
            if (style!=='sass') {
                files.push('dist/css/bootstrap.css');
            }
            if (style!=='css') {
                fontFolder = (style==='sass') ? ['assets' , 'fonts' , 'bootstrap'] : ['fonts'];
            }
        break;
        case 'bootstrap-material':

        break;
        case 'amazeui':
            files = ['dist/js/amazeui.js'];
            files.push('dist/css/amazeui.css');
            if (style !=='css') {
                fontFolder = ['fonts'];
            }
        break;
        case 'foundation':
            files = ['js/foundation.js'];
            files.push('css/foundation.css');
        break;
        case 'semantic':
            files = ['dist/semantic.js'];
            files.push('dist/semantic.css');
            if (style!=='css') {
                fontFolder = ['dist','themes','default','assets','fonts'];
            }
        break;
        case 'materialize':
            files = ['dist/js/materialize.js'];
            files.push('dist/css/materialize.css');
            if (style!=='css') {
                fontFolder = ['font'];
            }
        break;
        case 'uikit':
            files = ['dist/js/uikit.js'];
            files.push('dist/css/uikit.css');
            if (style!=='css') {
                fontFolder = ['fonts'];
            }
        break;
        case 'material':
            files = ['angular-material.js'];
            files.push('angular-material.css');
        break;
        default:
            // there is nothing to do here, just to keep jshint happy
    }
    this.env.options.fontFolder = fontFolder;

    if (files.length>0) {
        var fw = self._getUIFramework(self.uiframework);
        var uiFrameworkName = fw.package;
        if (uiFrameworkName==='bootstrap' && style==='sass') {
            uiFrameworkName = fw.alt;
        }
        var ow = '\n\t\t"' + uiFrameworkName + '": {\n\t\t\t"main": ["';
            ow += files.join('","');
            ow += '"]\t\n\t\t}\n';
        self.overwriteBower = ow;
    }

  	this.template('root/_bower.json', 'bower.json');
    if (!this.panesConfig) {
        // there already a .bowerrc written by panes
        this.template('root/_bowerrc', '.bowerrc');
    }
};
/**
 * abandone the original injectDependences , its completely useless.
 */
Generator.prototype._runFinalSetup = function()
{
    var self = this;
    var lang = self.env.options.lang;
    if (!this.panesConfig) {
        this._installKarmaApp();
    }
    if (!self.options['skip-install']) {
        var beginning = (lang==='cn') ? '下载中' : 'Downloading';
        var npmCommand = ((lang==='cn' && isInstalled('cnpm')) ? 'cnpm' : 'npm');
        var command = 'bower install && ' + npmCommand + ' install';
        var bm = (lang==='cn') ? '正在执行 `' + command + '` 指令，你可以去上个厕所，抽根煙，弄杯咖啡，補補妆，打电话给你爸妈 ... 回来时任务应该完成了。'
                                : 'Running `' + command + '`, go get yourself a coffee, go to the toilet, powder your nose , call your mom ... it will be ready when you are back.';
        var dotting = new Dot({
                beforeMsg: bm,
                beginning: beginning
            });
        // v0.9.10 first we need to call the bower install then execute npm install
        exec('bower install' , function(error)
        {
            var finalMsg;
            if (error!==null) {
                var errorMsg = (lang==='cn') ? 'Bower出错了 >_<, 请再次运行 `bower install`' : 'Bower Install failed, please execute `bower install` again!';
                self.log.error(errorMsg);
                self.log.error(error);
            }
            else {
                self._moveFontFiles();
                exec(npmCommand + ' install' , function(error) {
                    dotting.finish();
                    if (error !== null) {
                        var errorMsg = (lang==='cn') ? '下载出错了 >_< 请再次运行`'+command+'`指令' : 'package install error, please re-run `'+command+'` again!';
                        self.log.error(errorMsg);
                        self.log(error);
                    }
                    else {
                        if (!self.panesConfig) {
                            finalMsg = (lang==='cn') ? '任务完成，所有外加插件下载成功。' : 'Phew, deps are all downloaded.';
                            self.log(chalk.yellow(finalMsg));
                            var taskRunner = self.env.options.taskRunner;
                            self.env.options.installing  = false;
                            self.spawnCommand(taskRunner.toLowerCase() , ['dev']);
                        }
                        else {
                            var serComm = chalk.yellow('`gulp dev`');
                            finalMsg = (lang === 'cn') ? '请先把数据库先设立后再行 '+serComm+' 来起动你的项目.' : 'Please set up database before use '+serComm+' to start the application.';
                            self.log(finalMsg);
                        }
                    }
                });
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
    var self = this;
    var ff = self.env.options.fontFolder;
    if (ff.length>0) {
        var dest = path.join(self.appPath , 'styles' , ff.join( path.sep ));
        var uiFrameworkPath = self.uiframework;
        if (uiFrameworkPath==='bootstrap' && self.env.options.styleDev==='sass') {
            uiFrameworkPath = 'bootstrap-sass-official';
        }
        var source = path.join('bower_components' ,  uiFrameworkPath , ff.join( path.sep ));
        if (self.panesConfig) {
            source = path.join(self.appPath , source);
        }
        // create the dest folder!
        angularUtils.mkdirFull(path.join(self.appPath , 'styles') , ff , function()
        {
            ncp(source , dest , function(err)
            {
                if (err) {
                    return self.log.error(err);
                }
                var msg = (self.lang==='cn') ? '字体库搬移成功。' : 'Font folder copied.';
                self.log(chalk.yellow(msg));
            });
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
        var lang = self.env.options.lang;
        var names = {
            'lang': {cn: '语言' , en: 'Language'},
            'angularVersion': {cn: 'Angular版本' , en: 'Angular Version'},
            //'googleAnalytics': {cn: '使用谷歌Analytics' , en: 'Google Analytics'},
            'scriptingLang': {cn: 'Javascript开发' , en: 'Javascripting langugage'},
            'uiframework': {cn: '界面库' , en: 'UI Framework'},
            'styleDev': {cn: 'CSS开发方式' , en: 'Style development'},
            'ngMods': {cn: 'Angular模塊' , en: 'Angular Modules'},
            'appname': {cn: '项目名' , en: 'AppName'}
        };
        return (names[name]) ? names[name][lang] : false;
    };
    var self = this;
    var lang = self.env.options.lang;
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
            self.log(result);
        }
    });
};


// -- EOF --
