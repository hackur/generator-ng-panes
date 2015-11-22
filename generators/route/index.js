'use strict';
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var angularUtils = require('../../lib/util.js');
var preference = require('../../lib/preference');

/**
 * Constructor
 */
var Generator = module.exports = function()
{
    ScriptBase.apply(this, arguments);

    this.option('uri', {
        desc: 'Allow a custom uri for routing',
        type: String,
        required: false
    });

    var bower = require(path.join(process.cwd(), 'bower.json'));

    var baseFile = require('fs').readFileSync(path.join(
            this.env.options.appPath,
            'scripts/app.js'
        ), 'utf-8');
    var matchNgRoute = baseFile.match(/\.when/);
    var matchUiRoute = baseFile.match(/\.state/);

    if (bower.dependencies['angular-route'] || bower.devDependencies['angular-route'] || matchNgRoute !== null ) {
        this.foundWhenForRoute = true;
        this.routerType = 'ngRoute';
    }
    else if (bower.dependencies['ui-router'] || matchUiRoute !== null) {
        this.foundWhenForRoute = true;
        this.routerType = 'uiRoute';
    }

    // set up a new flag to use component instead of a controller
    if (!this.options.abstract) {
        var args = [this.name];
        if (this.options.component) {
            this.composeWith('ng-panes:component' , {args: args});
        }
        else {
            this.composeWith('ng-panes:controller' , {args: args});
        }
        this.composeWith('ng-panes:view' , {args: args});
    }
};

util.inherits(Generator, ScriptBase);

/**
 * ask if the user want to overwrite the existing file
 */
Generator.prototype.rewriteAppJs = function()
{
    var coffee = this.env.options.coffee;

    if (!this.foundWhenForRoute) {
        this.on('end', function () {
            this.log(chalk.yellow(
                '\nangular-route is not installed. Skipping adding the route to ' +
                'scripts/app.js'
            ));
        });
        return;
    }

    this.uri = this.name;

    if (this.options.uri) {
        this.uri = this.options.uri;
    }

    var config = {
        file: path.join(
            this.env.options.appPath,
            'scripts/app.js'
        )};
    var lower = this.name.toLowerCase();
    switch (this.routerType) {
        case 'ngRoute':
            config.needle = '.otherwise';
            config.splicable = [
                "  templateUrl: 'views/" + lower + ".html', ",
                " controller: '" + this.classedName + "Ctrl',",
                " controllerAs: '"+ this.cameledName + "'"
            ];

            config.splicable.unshift(".when('/" + this.uri + "', {");
            config.splicable.push("})");
        break;
        case 'uiRoute':
            config.needle = "$urlRouterProvider.otherwise('/');";
            config.splicable = [
                " url: '/"+ lower + "',",
            ];

            if (this.options.abstract) {
                config.splicable.push('abstract: true,');
                config.splicable.push('template: "<div ui-view></div>"');
            } else {
                if (!this.options.component) {
                    config.splicable.push("  controller: '" + this.classedName + "Ctrl'" +  ",");
                    config.splicable.push("  controllerAs: '" + this.cameledName + "'");
                }
                config.splicable.push(" templateUrl: 'views/" + lower + ".html'");
            }

            config.splicable.unshift(" $stateProvider.state('" + this.uri + "' , {");
            config.splicable.push("});");
        break;
    }
    angularUtils.rewriteFile(config);

};
