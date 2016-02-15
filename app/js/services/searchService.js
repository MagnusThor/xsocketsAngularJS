angular.module("myApp").service('searchService',
[
    "fakeOrder", function (fakeOrder) {

        var self = this;
     
        this.fakeOrders = [];
        this.resultsRecieved =0;

        this.onResult = function (){}

        fakeOrder.on("getorders", function (orders) {
            orders.forEach(function (order) {
                order["foo"] = new Date();
                self.fakeOrders.push(order);
            });

        });

        fakeOrder.on("findorderstatus", function(status) {
            console.log("Status", status);
        });

        fakeOrder.on("results", function (orders) {
            self.resultsRecieved++;
            orders.forEach(function (order) {
                self.fakeOrders.push(order);
            });
            self.onResult(self.resultsRecieved);
        });

        this.findOrder = function (q) {
            this.fakeOrders.length = 0;
            this.resultsRecieved = 0; 
            fakeOrder.invoke("findOrder", { query: q, chunks: 10, wait: 250 });
        };
        this.loadOrders = function (num) {
            this.fakeOrders.length = 0;
            fakeOrder.invoke("getOrders", { num: num });
        };

    }
]).factory("fakeOrder", ["xsocketsController", function (xsocketsController) {
    return xsocketsController("fakeorder");
}]);
