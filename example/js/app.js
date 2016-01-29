angular.module("myApp", ["xsockets", "ngRoute"])
    .config([
        "xsocketsControllerProvider", "$routeProvider", "$provide", function (xsocketsControllerProvider, $routeProvider, $provide) {

            xsocketsControllerProvider.open("ws://localhost:49828/");

            xsocketsControllerProvider.onconnected = function(evt) {
                console.log("onconnected %s" , new Date());
            };

            xsocketsControllerProvider.ondisconnected = function (evt) {
                console.log("ondisconnected %s", new Date());
                if (xsocketsControllerProvider.connectionAttempts < 5) { // just try 5 times to reconnect..
                    window.setTimeout(function () {
                        xsocketsControllerProvider.reconnect();
                        console.log("tryinig to connect %s", xsocketsControllerProvider.connectionAttempts);
                }, 2000);
                }
            };

            $routeProvider.when("/monky", {
                templateUrl: "view/monky.html",
                controller: "monkyController"
            }).when("/donky", {
                templateUrl: "view/donky.html",
                controller: "donkyController"
            }).
            when("/zebra", {
                templateUrl: "view/zebra.html",
                controller: "zebraController"
            }).when("/camel", {
                templateUrl: "view/camel.html",
                controller: "camelController"
            })

                .otherwise({
                redirectTo: "/monky"
            });
            // provide the generic controller as bar "serviceId" 
            $provide.factory("bar", ["xsocketsController", function (xsocketsController) {
                var bar = xsocketsController("TestController");
            
                return bar;
            }]);
        }
    ]);


angular.module("myApp").directive('bindFile', [function () {
    return {
        require: "ngModel",
        restrict: 'A',
        link: function ($scope, el, attrs, ngModel) {
            el.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });

            $scope.$watch(function () {
                return ngModel.$viewValue;
            }, function (value) {
                if (!value) {
                    el.val("");
                }
            });
        }
    };
}]);