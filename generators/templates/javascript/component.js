/* global: angular */
/**
 * This is a Ng V1.5.x feature
 */
(function()
{
	'use strict';
	/**
	 * define your controller here
	 */
	var componentCtrl = function()
	{
		var self = this;
	};
	/**
	 * define options for component
	 */
	var options = {
		bindings: {
			// define what you want to bind to your controller here
		},
		controller: componentCtrl,
		/**
		 * if you want to change the way how the controllerAs name, uncomment the line below and change the name
		 * Angular already automatically create a local scope for you to use in your template with `<%= name %>`
		 */
		// controllerAs: '<%= name %>',
		// transclude: false, // angular now assume you want transclude by default, uncomment to disable this behaviour
		// isolate: false, // also you can make it not isolate scope
		// restrict: 'E', // by default use E restrict
		// bindToController: {}, // change the bindToController
		/**
		 * next if you only have a simple template, you could link this to another file
		 * but in here, we use the full feature of what is available
		 * templateUrl: 'views/component/<%= name %>.html'
		 */
		template: function($element, $attrs)
		{
			return [
				'<div>' ,
				'</div>'
			].join('');
		}
	};
	angular.module('<%= scriptAppName %>').component('<%= cameledName %>' , options);
}());
