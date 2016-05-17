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
		var vm = this;
	};
	/**
	 * Your component
	 */
	angular.module('<%= scriptAppName %>').component('<%= cameledName %>' , {
		bindings: {
			// define what you want to bind to your controller here
		},
		controller: <%= cameledName %>ComponentCtrl, // we don't need to inject anything here, ngAnnotate will take of it
		/**
		 * if you want to change the way how the controllerAs name, uncomment the line below and change the name
		 * Angular already automatically create a local scope for you to use in your template with `<%= name %>`
		 */
		// controllerAs: '<%= cameledName %>',
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
