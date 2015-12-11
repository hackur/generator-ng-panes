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
<<<<<<< HEAD
    angular.module('<%= scriptAppName %>').controller('<%= classedName %>Ctrl', ['$scope' , function ($scope)
=======
    angular.module('<%= scriptAppName %>').controller('<%= cameledName %>Ctrl', ['$scope' , function ($scope)
>>>>>>> c16b038bc2541a1ec3e8233550cde1418377f72d
    {
        // implement your thing here
        var self = this;

        $scope.test = self.test = 'it\'s better to use `this` instead of $scope';


    }]);
}());
