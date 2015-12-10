;(function()
{
	'use strict';
	/**
	 * a standalone module <%= moduleName %>
	 */
	angular.module('<%= moduleName %>', []);
	/*
	<% if (ngRoute=='routeModule') { %>
	.config(['$routeProvider' , function ($routeProvider)
	{
		// define your sub route

		/* .otherwise({redirectTo: '/'}); */

	<% } else { %>
	.config(['$stateProvider' , function($stateProvider)
	{
		// define your sub route

		/* $urlRouterProvider.otherwise('/'); */
	<% } %>}]);
	*/

}());
