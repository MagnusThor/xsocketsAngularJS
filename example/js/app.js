angular.module("myApp", ['xsockets'])
    .config([
        "xsocketsControllerProvider", function (xsocketsControllerProvider) {
      
            xsocketsControllerProvider.open("ws://magnusthor-001-site1.btempurl.com:80");

        }
    ]).controller("chatController", ["$scope", "xsocketsController", function ($scope, xsocketsController) {

        $scope.message = {
            text: ""
        };
        $scope.messages = [];
            xsocketsController("generic",$scope).then(function(rtc) {
                rtc.on("chatmessage", function (data) {
                    
                    $scope.messages.push(data);
                });
                $scope.sendMessage = function (event) {
                    if (event === 13) {
                        rtc.invoke("chatmessage", {
                            text: $scope.message.text, dt: new Date()
                    });
                      $scope.message.text = "";
                  }
                };
            });
    }
    ]);




