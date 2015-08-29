#yeoman generator-ng-panes 前端开发神器

基于[generator-angular](https://github.com/yeoman/generator-angular)再开发，加入了许多新功能和为io.js 兼容作好准备。

#新加入的功能

1. 可选多种不同的界面库: [Bootstrap, Bootstrap-Sass](http://getbootstrap.com), [Foundation](http://foundation.zurb.com/), [Semantic-UI](http://semantic-ui.com/) , [Angular-Material](https://material.angularjs.org), [Materialize](), [UIKit](http://getuikit.com/) and [AmazeUI](http://materializecss.com/).
2. 当angular 2进入beta时，你可以选不同版本。
3. 使用gulp为任务助手。
4. 模塊使用DOM模式加入(不在HTML里加attribute), 让开发者更简单地改用AMD方案。
5. 內部开发改善，一起步便mini safe。
6. 可选中文。`yo ng-panes --cn`
7. 把项目的设置保存 ($HOME/.panes/ng-panes-preference.json), 同时可以使用保存的项目设置来建立新的项目。

还有更多

这是panes.js框架系列的其中一个开发助手工具。

##安装

这个开发器现时还没有在npm上注册。请跟据以下指令安装

    $ npm install -g yo
    $ git clone git@git.oschina.net:joelchu/generator-ng-panes.git
    $ cd generator-ng-pages
    $ npm install
    $ npm link

现在离开文件夾

    $ cd ..
    $ mkdir testProject
    $ cd testProject
    $ yo ng-pages --cn

安装完成!

##邦助

	yo ng-pages --help --cn

#Intro

Based on the original [generator-angular](https://github.com/yeoman/generator-angular) with some extra methods,
and getting it ready to work with io.js.

##NEW FEATURES

1. Allow you to choose from different UI framework: [Bootstrap, Bootstrap-Sass](http://getbootstrap.com), [Foundation](http://foundation.zurb.com/), [Semantic-UI](http://semantic-ui.com/) , [Angular-Material](https://material.angularjs.org), [Materialize](), [UIKit](http://getuikit.com/) and [AmazeUI](http://materializecss.com/).
2. This generator will be ready for AngularJS 2.0 when its ready. At the moment, ask you if you want to use V1 or V2 (but it will always set to V1 for the time being).
3. This generator will use Gulp by default.
4. The dist compilation will be little different, all templates will get generate into js files.
5. The Angular module configuration will be a little bit different. It will use angular DOM attachment instead of writing it into the HTML. This will give you the opportunity to use dynamic loading scheme.
6. Chinese option!
7. You can save your settings (saved into $HOME/.panes/ng-panes-preference.json) and allow you create the exact same project again.

And more.

This is part of the panes.js series of tools.

##Installation

This generator is not currently register with npm yet. To test it please do the following:

    $ npm install -g yo
    $ git pull git@github.com:joelchu/generator-ng-panes.git
    $ cd generator-ng-pages
	$ npm install
	$ npm link

Now you exit the `generator-ng-panes` folder.

    $ cd ..
	$ mkdir testProject
	$ cd testProject
	$ yo ng-pages

You are good to go!

###Create Controller

    $ yo ng-panes:controller CONTROLLER_NAME
    $ create controller in /app/controller/CONTROLLER_NAME.js

###Create Service

    $ yo ng-panes:service SERVICE_NAME
    $ create service in /app/service/SERVICE_NAME.js

###Create View

    $ yo ng-panes:view VIEW_NAME
    $ create view in /app/view/VIEW_NAME.html

###Skip check for previous project

    $ yo ng-panes --sc

OR

    $ yo ng-panes --skip-check

##Help

	yo ng-pages --help

##TODO

1. Fix the `bower_components` not serving correctly with gulp.connect.
2. Remove unused code.
3. Translate the help file to Chinese.
4. Streamline the gulpfile and change the build process.
5. Test with every single framework.
6. Fix the Karma:app installation problem (keep over writing the package.json)
7. Write test file for the generator
8. Update the generated project test suite.

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
