;(function()
{
    'use strict';

    /**
     * @ngdoc function
     * @name <%= scriptAppName %>.controller:<%= classedName %>Ctrl
     * @description
     * # <%= classedName %>Ctrl
     * Controller of the <%= scriptAppName %>
     */
    angular.module('<%= scriptAppName %>').controller('<%= cameledName %>Ctrl', function($scope)
    {
        // implement your thing here
        var vm = this;

        $scope.test = vm.test = 'it\'s better to use `this` instead of $scope';


    });
}());
