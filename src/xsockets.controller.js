angular.module("xsockets", []);
angular.module("xsockets").provider("xsocketsController", [
    function () {
        var query = function (obj) {
            var str = "?";
            delete obj.C;
            Object.keys(obj).forEach(function (key) {
                str += key + "=" + encodeURIComponent(parameters[key]) + "&";
            });
            str = str.slice(0, str.length - 1);
            return str;
        }
        var parameters = JSON.parse(localStorage.getItem("ci") ? localStorage.getItem("ci") : "{}");
        var provider = this;
        this.connection = undefined;
        this.isConnected = false;
        this.open =
            function (url) {
                this.connection = new window.WebSocket(url + query(parameters));
                this.connection.binaryType = "arraybuffer";
            };

        this.deferred = {};
        this.listeners = [];

        this.$get = [
            '$q', '$rootScope', '$timeout', function ($q, $rootScope, $timeout) {
                return function factory(controller, $scope) {
                    var self = this;
                    provider.deferred[controller] = new $q.defer();
                    var eventType = {
                        init: "1",
                        ping: "7",
                        pong: "8",
                        controller: {
                            onError: "4",
                            onOpen: "2",
                            onClose: "3"
                        },
                        storage: {
                            set: "s1",
                            get: "s2",
                            clear: "s4",
                            remove: "s3"
                        },
                        pubSub: {
                            subscribe: "5",
                            unsubscribe: "6"
                        }
                    };

                    this.queue = [];
                    var listeners = provider.listeners;
                    var findListener = function (t, c) {
                        var match = listeners.filter(function (pre) { return pre.topic === t && pre.controller === c });
                        return match;
                    };
                    var unregisterListener = function (t, c) {
                        var match = listeners.indexOf(findListener(t, c));
                        listeners.splice(match, 1);
                    };
                    var registerListener = function (t, c, fn) {
                        listeners.push({ topic: t, controller: c, fn: fn });
                    };
                    var longToByteArray = function (long) {
                        var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
                        for (var index = 0; index < byteArray.length; index++) {
                            var byte = long & 0xff;
                            byteArray[index] = byte;
                            long = (long - byte) / 256;
                        }
                        return byteArray;
                    };
                    var message = (function () {
                        var ctor = function (t, o, c) {
                            this.T = t ? t.toLowerCase() : undefined;
                            this.D = o;
                            this.C = c ? c.toLowerCase() : undefined;
                            this.JSON = {
                                T: t,
                                D: JSON.stringify(o),
                                C: c
                            };
                        }
                        ctor.prototype.toString = function () {
                            return JSON.stringify(this.JSON);
                        };
                        return ctor;
                    })();
                    var binaryMessage = (function () {
                        var ctor = function (arrayBuffer, topic, data) {
                            this.buffer = this.createBuffer(new message(topic, data, controller).toString(), arrayBuffer);
                        };
                        ctor.prototype.stringToBuffer = function (str) {
                            var i,
                                len = str.length,
                                arr = new Array(len);
                            for (i = 0; i < len; i++) {
                                arr[i] = str.charCodeAt(i) & 0xFF;
                            }
                            return new Uint8Array(arr).buffer;
                        };
                        ctor.prototype.appendBuffer = function (a, b) {
                            var c = new Uint8Array(a.byteLength + b.byteLength);
                            c.set(new Uint8Array(a), 0);
                            c.set(new Uint8Array(b), a.byteLength);
                            return c.buffer;
                        };
                        ctor.prototype.createBuffer = function (payload, buffer) {
                            var header = new Uint8Array(longToByteArray(payload.length));
                            var data = this.appendBuffer(this.appendBuffer(header, this.stringToBuffer(payload)), buffer);
                            return data;
                        };
                        return ctor;
                    })();
                    var extractMessage = function (arrayBuffer, cb) {
                        var data = arrayBuffer; // .buffer
                        var ab2str = function (buf) {
                            return String.fromCharCode.apply(null, new Uint16Array(buf));
                        };
                        var byteArrayToLong = function (byteArray) {
                            var value = 0;
                            for (var i = byteArray.byteLength - 1; i >= 0; i--) {
                                value = (value * 256) + byteArray[i];
                            }
                            return parseInt(value);
                        };
                        var header = new Uint8Array(data, 0, 8);
                        var payloadLength = byteArrayToLong(header);
                        var offset = parseInt(8 + byteArrayToLong(header));
                        cb(ab2str(new Uint8Array(data, 8, payloadLength)), new Uint8Array(data, parseInt(offset), data.byteLength - offset), header);
                        return this;
                    };
                    provider.connection.onmessage = function (event) {
                       
                        var listener,obj;
                        if (typeof event.data === "string") {
                         
                            obj = JSON.parse(event.data);
                            listener = findListener(obj.T, obj.C, listeners);
                            if (listener) {
                                listener.forEach(function (l) {
                                
                                    $rootScope.$apply(l.fn.apply(this, [JSON.parse(obj.D), obj.C]));
                                });
                            }
                        } else {
                            extractMessage(event.data, function (str, arrayBuffer) {
                                obj = JSON.parse(str);
                                listener = findListener(obj.T, obj.C, listeners);
                                if (listener) {
                                    listener.forEach(function (l) {
                                        $rootScope.$apply(l.fn.apply(this, [JSON.parse(obj.D), arrayBuffer, obj.C]));
                                    });
                                }
                            });
                        }
                    };
                    var send = function (data) {
                        if (provider.connection.readyState === 0) { 
                            self.queue.push(data);
                        } else {
                            provider.connection.send(data);
                        }
                    };
                    var instance = {
                        on: function (t, fn) {
                            var match = findListener(t, controller);
                            if (match.length === 0) {
                                registerListener(t, controller, fn);
                            } else {
                                var index = listeners.indexOf(findListener(t, controller)[0]);
                                listeners[index] = { topic: t, controller: controller, fn: fn };
                            }
                        },
                        off: function (t) {
                            unregisterListener(t, controller);
                        },
                        invokeBinary: function (arrayBuffer) {
                            send(arrayBuffer);
                        },
                        createBinaryMessage: function (a, t, d) {
                            return new binaryMessage(a, t, d);
                        },

                        invoke: function (t, d) {
                            send(new message(t, d, controller));
                        },
                        publish: function (t, d) {
                            send(new message(t, d, controller));
                        },
                        close: function () {
                            (listeners.filter(function (r) {
                                r.controller = controller;
                            })).forEach(function (match) {
                                listeners.splice(match, 1);
                            });
                            send(new message(eventType.controller.onClose, {}, controller));
                        },
                        subscribe: function (t, fn) {
                            registerListener(t, controller);
                            send(new message(eventType.pubSub.subscribe, { T: t }, controller));
                        },
                        unsubscribe: function (t) {
                            unregisterListener(t, controller);
                            send(new message(eventType.pubSub.unsubscribe, { T: t }, controller));
                        },
                        setEnum: function (name, value) {
                            var property = "set_" + name.toLowerCase();
                            send(new message(property, value, controller));
                        },
                        setProperty: function (name, value) {
                            var data,property = "set_" + name.toLowerCase();
                            if (value instanceof Array) {
                                data = {
                                    value: value
                                };
                            } else if (value instanceof Object) {
                                data = value;
                            } else {
                                data = {
                                    value: value
                                };
                            }
                            send(new message(property, data, controller));
                        },
                        getListeners: function () {
                            return listeners.filter(function (p) {
                                return p.controller === controller;
                            });
                        }
                    };
                    // hook up listeners for the contoller
                    registerListener(eventType.controller.onOpen, controller, function (event) {
                        var ci = {
                            persistentId: event.PI,
                            connectionId: event.CI
                        };
                        localStorage.setItem("ci", JSON.stringify(ci));
                        provider.deferred[controller].resolve(instance, ci);
                    });
                    registerListener(eventType.controller.onClose, controller, function () {
                        instance.close();
                        // todo: maybe rcall reject in defered?
                    });
                    registerListener(eventType.controller.onError, controller, function (err) {
                        provider.deferred[controller].reject(err);
                    });

                    // initialize the controller
                    send(new message(eventType.init, {
                        init: true
                    }, controller).toString());

                    // todo: poll the readyState each second, using a interval instead
                    $timeout(function () {
                        self.queue.forEach(function (msg) {
                            provider.connection.send(msg);
                        });
                        self.queue = [];
                    }, 1000);
                    if ($scope) {
                        $scope.$on('$destroy', function (e) {
                            instance.close();
                        });
                    }
                    return provider.deferred[controller].promise;
                };
            }
        ];

    }
]);