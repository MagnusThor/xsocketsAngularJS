angular.module("myApp").controller("zebraController", ["$scope", "generic", function ($scope, generic) {
    $scope.animal = {
        key: ""
    };
    $scope.preserved = {};

    generic.storage.get("animalName").then(function (obj) {
        // where obj is {key:string,value:any};
        $scope.animal.name = obj.value;
        $scope.preserved = obj;
    });
    $scope.save = function () {
        // void
        var m = generic.storage.set("animalName", $scope.animal.name);



    };
    $scope.close = function () {
        generic.kill();
    };
}]).factory("generic", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic");
}]);
