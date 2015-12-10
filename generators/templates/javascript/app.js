;(function()
{
    'use strict';
    /**
     * @ngdoc overview
     * @name <%= scriptAppName %>
     * @description
     * # <%= scriptAppName %>
     *
     * Main module of the application.
     */
    /* ngModuleStart */
    angular.module('<%= scriptAppName %>', [<%- angularModules %>])
    /* ngModuleEnd */
    <% if (ngRoute=='routeModule') { %>
    .config(['$routeProvider' , function ($routeProvider)
    {
        $routeProvider
        .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl',
            controllerAs: 'main'
        })
        .otherwise({
            redirectTo: '/'
        });

        /* <!-- router:js --> */

        /* <!-- endinject --> */

    }])<% } else { %>
    .config(['$stateProvider' , '$urlRouterProvider' , function($stateProvider , $urlRouterProvider)
    {

        $stateProvider
        .state('index' , {
            url: '',
            templateUrl: 'views/main.html',
            controller: 'MainCtrl',
            controllerAs: 'main'
        });


        $urlRouterProvider.otherwise('/');

    }])<% } %>;

    // also provide a appController here, althought its not recommended to put anything in the $rootScope
    /*
    angular.module('<%= scriptAppName %>').run(['$rootScope' ,'$window' , function($rootScope , $window)
    {
        // do your thing here
    }]);
    */
    
    //Then init the app
    angular.element(document).ready(function()
    {
    	angular.bootstrap(document, ['<%= scriptAppName %>'] , {strictDi: true});

        <% if (uiframework==='bootstrapMaterialDesign') { %>
        // init the js script for material design
        $.material.init();
        <% } %>
    });


}());
