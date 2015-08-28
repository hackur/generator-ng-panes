'use strict';
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var ScriptBase = require('../../lib/script-base.js');
var angularUtils = require('../../lib/util.js');

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

    var coffee = this.env.options.coffee;
    var typescript = this.env.options.typescript;
    var bower = require(path.join(process.cwd(), 'bower.json'));
    var match = require('fs').readFileSync(path.join(
            this.env.options.appPath,
            'scripts/app.' + (coffee ? 'coffee' : typescript ? 'ts': 'js')
        ), 'utf-8').match(/\.when/);

    if (bower.dependencies['angular-route'] || bower.devDependencies['angular-route'] || match !== null) {
        this.foundWhenForRoute = true;
    }

    this.composeWith('angularjs:controller');
    this.composeWith('angularjs:view');
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
                'scripts/app.' + (coffee ? 'coffee' : 'js')
            ));
        });
        return;
    }

    this.uri = this.name;
    if (this.options.uri) {
        this.uri = this.options.uri;
    }

    var typescript = this.env.options.typescript;
    var config = {
        file: path.join(
            this.env.options.appPath,
            'scripts/app.' + (coffee ? 'coffee' : typescript ? 'ts': 'js')
        ),
        needle: '.otherwise',
        splicable: [
            "  templateUrl: 'views/" + this.name.toLowerCase() + ".html'" + (coffee ? "" : "," ),
            "  controller: '" + this.classedName + "Ctrl'" + (coffee ? "" : ","),
            "  controllerAs: '" + this.cameledName + "'"
        ]
    };

    if (coffee) {
        config.splicable.unshift(".when '/" + this.uri + "',");
    }
    else {
        config.splicable.unshift(".when('/" + this.uri + "', {");
        config.splicable.push("})");
    }

    angularUtils.rewriteFile(config);
};
