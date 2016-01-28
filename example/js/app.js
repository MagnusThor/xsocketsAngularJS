angular.module("myApp", ["xsockets", "ngRoute"])
    .config([
        "xsocketsControllerProvider", "$routeProvider","$provide", function (xsocketsControllerProvider, $routeProvider,$provide) {

            xsocketsControllerProvider.open("wss://webrtoxfordai.azurewebsites.net:443/");

            xsocketsControllerProvider.onconnected = function(evt) {
                console.log("onconnected %s" , new Date());
            };

            xsocketsControllerProvider.ondisconnected = function (evt) {
                console.log("ondisconnected %s", new Date());
                xsocketsControllerProvider.open();
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
                })

                .otherwise({
                redirectTo: "/monky"
            });
            // provide the generic controller as bar "serviceId" 
            $provide.factory("bar", ["xsocketsController", function (xsocketsController) {
                var bar = xsocketsController("generic");
            
                return bar;
            }]);
        }
    ]);
