/* global: angular */
/**
 * This is a Ng V1.5.x feature
 */
;(function()
{
	'use strict';
	/**
	 * define your controller here
	 */
	var <%= cameledName %>ComponentCtrl = function($scope)
	{
		var $ctrl = this;

		/**
		 * init hook
		 */
		$ctrl.$onInit = function()
		{

		};
		/**
		 * data change hook
		 */
		$ctrl.$onChanges = function(changesObj)
		{

		};
		/**
		 * destroy clean up hook
		 */
		$ctrl.$onDestroy = function()
		{

		};
		/**
		 * postLink but small different from directive's postLink call see https://doc.angularjs.org/guide/component
		 */
		$ctrl.$postLink = function()
		{
			
		};
	};
	/**
	 * Your component
	 */
	angular.module('<%= scriptAppName %>').component('<%= cameledName %>' , {
		bindings: {
			// define what you want to bind to your controller here
		},
		controller: <%= cameledName %>ComponentCtrl, // we don't need to inject anything here, ngAnnotate will take of it
		// controllerAs: '$ctrl',
		// transclude: false, // angular now assume you want transclude by default, uncomment to disable this behaviour
		// isolate: false, // also you can make it not isolate scope
		// restrict: 'E', // by default use E restrict
		<% if (externalTemplate) { %>templateUrl: '<%= externalTemplate %>'<% } else { %>
		template: function($element, $attrs)
		{
			return [
				'<div>' ,
				'</div>'
			].join('');
		}<% } %>
	});
}());
