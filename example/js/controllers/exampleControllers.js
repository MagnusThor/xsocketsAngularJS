//
// example controller 1 - monkyController
//
angular.module("myApp").controller("monkyController", ["$scope", "foo", function ($scope, rtc) {
    $scope.message = {
        text: ""
    };
    $scope.messages = [];
    rtc.onopen = function (ci) {
        console.log("donkyController rtc open", ci);
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
//
// example controller 2 - donkyController
//
angular.module("myApp").controller("donkyController", ["$scope", "myService", function ($scope, rtc) {
    $scope.message = {
        text: ""
    };
    $scope.messages = rtc.messages;
    $scope.sendMessage = function (event) {
        if (event === 13) {
            rtc.sendMessage($scope.message.text);
            $scope.message.text = "";
        }
    };
   
    $scope.close = function () {
        rtc.closeConnection();
    };
}]);



//
// example controller 3 - zebraController
//
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
    $scope.close = function() {
        generic.kill();
    };
}]).factory("generic", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("generic");
}]);





angular.module("myApp").controller("camelController", ["$scope", "foo", function ($scope, rtc) {
    $scope.theFile = null;
    $scope.files = [];
    // add a listener for "shareFile", will fire when a binaryMessage is recieved.
    rtc.on("sharefile", function(fileProps, arrayBuffer) {
        $scope.files.unshift({
            fileName: fileProps.name,
            fileSize: fileProps.size,
            fileUrl: URL.createObjectURL(rtc.createBlob(arrayBuffer, { type: fileProps.type }))
    });
    });
    $scope.shareFile = function () {
        // get some file properties 
        var fileProperties = {
            name: $scope.theFile.name,
            size: $scope.theFile.size,
            type: $scope.theFile.type

        };
        // load the file as an arrayBuffer
        rtc.getArrayBuffer($scope.theFile).then(function(arrayBuffer) {
            // create a binaryMessage , a message containing the fileProperties + arrayBuffer 
            var bm = rtc.createBinaryMessage(arrayBuffer, "sharefile", fileProperties);
            // send the message to the XSockets.NET Controller , the topic is shareFile
            rtc.invokeBinary(bm);
        });
    };
}]).factory("foo", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("test");
}]).config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(blob?):/);
}]);