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
    angular.module('<%= scriptAppName %>').controller('<%= cameledName %>Ctrl', ['$scope' , function ($scope)
    {
        // implement your thing here
        var self = this;

        $scope.test = self.test = 'it\'s better to use `this` instead of $scope';


    }]);
}());
