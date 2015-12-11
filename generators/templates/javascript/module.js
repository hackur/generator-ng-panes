;(function()
{
	'use strict';
	/**
	 * a standalone module <%= moduleName %>
	 */
<<<<<<< HEAD
	angular.module('<%= moduleName %>', [])
=======
	angular.module('<%= moduleName %>', []);
	/*
>>>>>>> c16b038bc2541a1ec3e8233550cde1418377f72d
	<% if (ngRoute=='routeModule') { %>
	.config(['$routeProvider' , function ($routeProvider)
	{
		// define your sub route

		/* .otherwise({redirectTo: '/'}); */

	<% } else { %>
	.config(['$stateProvider' , function($stateProvider)
	{
		// define your sub route

<<<<<<< HEAD

		/* $urlRouterProvider.otherwise('/'); */
	<% } %>}]);
=======
		/* $urlRouterProvider.otherwise('/'); */
	<% } %>}]);
	*/
>>>>>>> c16b038bc2541a1ec3e8233550cde1418377f72d

}());
