;(function()
{
	'use strict';
	/**
	 * a standalone module <%= moduleName %>
	 */
	var <%= moduleStringName %>Module = angular.module('<%= moduleName %>', []);
	/*
	this is commented out because you might not want to define your route.

	<% if (ngRoute=='ngRoute') { %>
	<%= moduleStringName %>Module.config(['$routeProvider' , function ($routeProvider)
	{
		// define your sub route

		// .otherwise({redirectTo: '/'});

	<% } else { %>
	<%= moduleStringName %>Module.config(['$stateProvider' , function($stateProvider)
	{
		// define your sub route

	<% } %>}]);
	*/
}());
