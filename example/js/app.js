angular.module("myApp", ["xsockets", "ngRoute"])
    .config([
        "xsocketsControllerProvider", "$routeProvider", "$provide", function (xsocketsControllerProvider, $routeProvider, $provide) {
            xsocketsControllerProvider.open("wss://webrtoxfordai.azurewebsites.net:443");
            xsocketsControllerProvider.onconnected = function(evt) {
               // console.log("onconnected %s" , new Date());
            };

            xsocketsControllerProvider.ondisconnected = function (evt) {
        //        console.log("ondisconnected %s", new Date());
                if (xsocketsControllerProvider.connectionAttempts < 5) { // just try 5 times to reconnect..
                    window.setTimeout(function () {
                        xsocketsControllerProvider.reconnect();
                     //   console.log("tryinig to connect %s", xsocketsControllerProvider.connectionAttempts);
                }, 2000);
                }
            };

            $routeProvider.when("/monkey", {
                templateUrl: "view/monkey.html",
                controller: "monkeyController"
            }).when("/donkey", {
                templateUrl: "view/donkey.html",
                controller: "donkeyController"
            }).
            when("/zebra", {
                templateUrl: "view/zebra.html",
                controller: "zebraController"
            }).when("/camel", {
                templateUrl: "view/camel.html",
                controller: "camelController"
            })

                .when("/tiger", {
                    templateUrl: "view/tiger.html",
                    controller: "tigerController",
                    controllerAs: "tiger"
                })

                .otherwise({
                redirectTo: "/monkey"
            });
            // provide the generic controller as bar "serviceId" 
            $provide.factory("bar", ["xsocketsController", function (xsocketsController) {
                var bar = xsocketsController("TestController");
                return bar;
            }]);
        }
    ]);



angular.module("myApp").directive("symField", [function () {
    return {
        replace: true,
        restrict: 'E',
        scope: {
            key : '=',
            model: '=',
        },
        link: function ($scope, el, attrs) {
            var self = $scope;
          
            el.val(self.model[attrs.prop]);
            el.bind(attrs.event || 'change', function (event) {
                self.model[attrs.prop] = event.target.value;
            });
            var _onupdate = function(v) {
                el.val(v);
            }
            var key = attrs.prop;
            Object.defineProperty(self.model, key, {
                enumerable: true,
                configurable: true,
                set: function (value) {
                  
                  
                    this["_" + key] = value;
                  
                    _onupdate(this["_" + key]);
                },
                get: function() {
                    return this["_" + key];
                }

            });

        },
        template: function () {
           
            return '<input class="my-input" type="text">';
        } 
    }
    
}]);




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

var Watchers = {
    getWatchers : function(root) {
      root = angular.element(root || document.documentElement);
    function getElemWatchers(element) {
        var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
        var scopeWatchers = getWatchersFromScope(element.data().$scope);
        var watchers = scopeWatchers.concat(isolateWatchers);
        angular.forEach(element.children(), function (childElement) {
            watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
        });
        return watchers;
    }
    function getWatchersFromScope(scope) {
        if (scope) {
            return scope.$$watchers || [];
        } else {
            return [];
        }
    }

    return getElemWatchers(root);
     },
    checkWatchers: function (ctx) {
        var self = this;
        var createBubble = function(parent, numOfWatchers) {
            var boundingBox = parent.getBoundingClientRect();
            var bubble = document.createElement("mark");
            bubble.style.position = "absolute";
            bubble.textContent = numOfWatchers;
            bubble.style.backgroundColor = "#ff0000";
            bubble.title = parent.id + " =  " + numOfWatchers;
            bubble.style.top = boundingBox.top + "px";
            bubble.style.right = boundingBox.right + "px";
            bubble.classList.add("wcount");
            parent.appendChild(bubble);
        };
        if (!ctx) ctx = document.body;
        var nodes = ctx.querySelectorAll("[data-wcount]");
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var c = self.getWatchers(node);
            node.setAttribute("title", c.length);

            node.style.backgroundColor = "#dadada";
            createBubble(node, c.length);
        };
    }
};



