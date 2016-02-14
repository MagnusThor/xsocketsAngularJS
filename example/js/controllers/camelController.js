
angular.module("myApp").controller("camelController",
    ["$scope", "foo", function ($scope, rtc) {
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