(function(angular) {
    var tigerController = function($scope, searchService) {
        var tiger = this;

     
    
        tiger.removeOrder = function (index) {
            tiger.fakeOrders.splice(index, 1);
        };
        tiger.fakeOrders = searchService.fakeOrders;
        tiger.resultsRecieved = 0;

        tiger.findOrder = function (v) {
         
            if (v.target.value.length < 2) return;
            tiger.resultsRecieved = 0;
           
            searchService.findOrder(v.target.value);
        };
        searchService.loadOrders(10);
        searchService.onResult = function(count) {
            tiger.resultsRecieved = count;
        };

    };
    angular.module("myApp").controller("tigerController", [
        "$scope", "searchService", tigerController
    ]);
}(angular));
