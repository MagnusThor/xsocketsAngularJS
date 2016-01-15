angular.module("myApp", ["xsockets", "ngRoute"])
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
            
                return bar;
            }]);
        }
    ]);
