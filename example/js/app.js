angular.module("myApp", ["xsockets","ngRoute"])
    .config([
        "xsocketsControllerProvider", "$routeProvider","$provide", function (xsocketsControllerProvider, $routeProvider,$provide) {
            xsocketsControllerProvider.open("wss://rtcplaygrouund.azurewebsites.net:443");
            $routeProvider.when('/monky', {
                templateUrl: 'view/monky.html',
                controller: 'monkyController'
            }).when('/donky', {
                templateUrl: 'view/donky.html',
                controller: 'donkyController'
            }).otherwise({
                redirectTo: '/monky'
            });
            // provide the generic controller as bar "serviceId" 
            $provide.factory("bar", ["xsocketsController", function (xsocketsController) {
                var bar = xsocketsController("generic");
                console.log("bar provided", bar);
                return bar;
            }]);
        }
    ]);



angular.module("myApp").controller("donkyController", ["$scope", "foo", function ($scope, rtc) {
        $scope.message = {
            text: ""
        };
        $scope.messages = [];
        rtc.onopen = function (ci) {
            console.log("donkyController rtc open",ci)
        };

        rtc.on("chatmessage", function (data) {
            $scope.messages.unshift(data);
        });
        $scope.sendMessage = function (event) {
            if (event === 13) {
                rtc.invoke("chatmessage", {
                    text: $scope.message.text, dt: new Date()
                });
                $scope.message.text = "";
            }
        };
    }]).factory("foo", ["xsocketsController", function (xsocketsController) {
        return xsocketsController("generic");
    }]);
   


 // 'bar' is provided using the "config" of myApp
angular.module("myApp").controller("monkyController", ["$scope", "bar", function ($scope, rtc) {

    $scope.message = {
        text: ""
    };
    $scope.messages = [];
    rtc.onopen = function (ci) {
        console.log("monkyController rtc open", ci)
    };
    rtc.on("chatmessage", function (data) {
        $scope.messages.unshift(data);
    });
    $scope.sendMessage = function (event) {
        if (event === 13) {
            rtc.invoke("chatmessage", {
                text: $scope.message.text, dt: new Date()
            });
            $scope.message.text = "";
        }
    };
}]);
    





