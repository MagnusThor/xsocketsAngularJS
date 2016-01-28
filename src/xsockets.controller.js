
if (!Array.prototype.find) {
    Array.prototype.find = function (predicate) {
        if (this === null) {
            throw new TypeError("Array.prototype.find called on null or undefined");
        }
        if (typeof predicate !== "function") {
            throw new TypeError("predicate must be a function");
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };
}
if ("angular" in window) {
    (function () {
        "use strict";
        angular.module("xsockets", []);
        angular.module("xsockets").provider("xsocketsController",[
        function () {
          
                var provider = this,
                    self = this;
                var parameters = JSON.parse(localStorage.getItem("ci") ? localStorage.getItem("ci") : "{}");
                var query = function (obj) {
                    var str = "?";
                    delete obj.C;
                    Object.keys(obj).forEach(function (key) {
                        str += key + "=" + encodeURIComponent(obj[key]) + "&";
                    });
                    str = str.slice(0, str.length - 1);
                    return str;
                };
                this.promises = {};
                this.onconnected = function() {
                    this.isConnected = true;
                };
                this.ondisconnected = function() {
                    self.open(self.url);
                };
                this.reconnects = 0;
                this.controllers = [];
                this.listeners = [];
                this.queue = [];
                this.connection = undefined;
                this.isConnected = false;
                this.autoReconnect = false;
            this.url = "";
            this.open = function (url, params, reconnect) {
                if (arguments.length > 0) {
                    if (!reconnect) {
                        this.url = url + query(angular.extend({}, parameters, params));
                    } else {
                        this.reconnects++;
                        this.url = url;
                    }

                };

                this.connection = new window.WebSocket(this.url);
                    this.connection.binaryType = "arraybuffer";
                    this.connection.onclose = function (evt) {

                        self.isConnected = false;
                        if (self.ondisconnected) self.ondisconnected.apply(evt);
                    };
                        this.connection.onopen = function (evt) {
                        self.queue.forEach(function (queuedMessage) {
                            self.send(queuedMessage);
                        });
                        self.queue.length = 0;
                        if (self.onconnected) self.onconnected.apply(evt);
                    };
                 
                  
                    this.connection.onmessage = function (msg) {
                        var obj = JSON.parse(msg.data);
                        var listeners = self.listeners.filter(function (pre) {
                            return pre.controller === obj.C && pre.topic === obj.T;
                        });
                        listeners.forEach(function (lst) {
                            lst.fn.fire(JSON.parse(obj.D), obj.C);
                        });
                        // is there a promise
                       
                        if (provider.promises.hasOwnProperty(obj.T)) {
                            var data = JSON.parse(obj.D);
                          
                            provider.promises[obj.T].resolve({
                                key: data.K, value: data.V
                            });
                        }
                       
                   
                    };
            };
                this.send = function (data) {
                    if (this.connection.readyState === 1) {
                        this.connection.send(data.toString());
                    } else {
                        this.queue.push(data);
                    }
                };
                this.setState = function (ctrl, state) {
                    var controller = this.controllers.find(function (pre) {
                        return pre.controller === ctrl;
                    });
                    if (controller) {
                        controller.readyState = state;
                    }
                };
                this.controllerIsOpen = function (ctrl) {
                    if (!this.controllers.find(function (pre) {
                            return pre.controller === ctrl;
                    })) {
                        self.controllers.push({
                            controller: ctrl,
                            readyState: 0
                        });
                        return false;
                    }
                    return true;
                };
                this.uuid = function (a, b) {
                    for (b = a = ""; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : "-");
                    return b;
                };
                this.listener = function (instance, topic, controller, fn) {
                    this.instance = instance;
                    this.topic = topic;
                    this.controller = controller;
                    this.fn = fn;
                };
                this.$get = [
                    "$q", "$rootScope",
                    function ($q, $rootScope) {
                        return function factory(controller, propertyList, $scope) {
                            var dispatcher = (function (rs) {
                                var ctor = function (fn) {
                                    this.fn = fn;
                                };
                                ctor.prototype.fire = function (d, c) {
                                    rs.$apply(this.fn.apply(this, [d, c]));
                                };
                                return ctor;
                            })($rootScope);
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
                            var uuid = provider.uuid();
                            var findListener = function (i, t, c) {
                                var match = provider.listeners.filter(function (pre) {
                                    return pre.topic === t && pre.controller === c && pre.instance === i;
                                });
                                return match;
                            };
                            var unregisterListener = function (t, c) {
                                var match = provider.listeners.indexOf(findListener(uuid, t, c));
                                provider.listeners.splice(match, 1);
                            };
                            var registerListener = function (i, t, c, fn) {
                                var listener = new provider.listener(i, t, c, new dispatcher(fn));
                                var match = findListener(uuid, t, controller);
                                if (match.length === 0) {
                                    provider.listeners.push(listener);
                                } else {
                                    var index = provider.listeners.indexOf(match[0]);
                                    provider.listeners[index] = listener;
                                }
                            };
                            var removeListeners = function (instance, ctrl) {
                                for (var i = 0; i < provider.listeners.length; i++) {
                                    if (provider.listeners[i].controller === ctrl && provider.listeners[i].instance === instance) {
                                        provider.listeners.splice(i, 1);
                                    }
                                }
                            };
                            var longToByteArray = function (lng) {
                                var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
                                for (var index = 0; index < byteArray.length; index++) {
                                    var byt = lng & 0xff;
                                    byteArray[index] = byt;
                                    lng = (lng - byt) / 256;
                                }
                                return byteArray;
                            };
                            var Message = (function () {
                                var ctor = function (t, o, c) {
                                    this.T = t ? t.toLowerCase() : undefined;
                                    this.D = o;
                                    this.C = c ? c.toLowerCase() : undefined;
                                    this.JSON = {
                                        T: t,
                                        D: JSON.stringify(o),
                                        C: c
                                    };
                                };
                                ctor.prototype.toString = function () {
                                    return JSON.stringify(this.JSON);
                                };
                                return ctor;
                            })();
                            var BinaryMessage = (function () {
                                var ctor = function (arrayBuffer, topic, data) {
                                    this.buffer = this.createBuffer(new Message(topic, data, controller).toString(), arrayBuffer);
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
                            var parseBinaryMessage = function (arrayBuffer, cb) {
                                var data = arrayBuffer; // .buffer
                                var ab2Str = function (buf) {
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
                                cb(ab2Str(new Uint8Array(data, 8, payloadLength)), new Uint8Array(data, parseInt(offset), data.byteLength - offset), header);
                                return this;
                            };
                            var send = function (data) {
                                provider.send(data);
                            };
                            var setProperty = function (name, value) {
                                var data, property = "set_" + name.toLowerCase();
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
                                send(new Message(property, data, controller));
                            };
                            var setEnum = function (name, value) {
                                var property = "set_" + name.toLowerCase();
                                send(new Message(property, value, controller));
                            };
                            var init = function (ctrl) {
                                // controller mat be initialized ?
                                if (!provider.controllerIsOpen(ctrl)) {
                                    send(new Message(eventType.init, {
                                        init: true
                                    }, ctrl));
                                } else { }
                            };
                            var close = function () {
                                send(new Message(eventType.controller.onClose, {}, controller));
                            };
                            // provider API
                            var instance = {
                                controllerName: controller,
                                uuid: uuid,
                                onerror: null,
                                onopen: null,
                                onclose: null,
                                on: function (t, fn) {
                                    registerListener(uuid, t, controller, fn);
                                },
                                off: function (t) {
                                    unregisterListener(uuid, t, controller);
                                },
                                invokeBinary: function (arrayBuffer) {
                                    send(arrayBuffer);
                                },
                                createBinaryMessage: function (a, t, d) {
                                    return new BinaryMessage(a, t, d);
                                },
                                invoke: function (t, d) {
                                    send(new Message(t, d, controller));
                                },
                                publish: function (t, d) {
                                    send(new Message(t, d, controller));
                                },
                                kill: function() {
                                    provider.connection.close();
                                },
                                reconnects: provider.reconnects,
                                close: close,
                                subscribe: function (t, fn) {
                                    registerListener(uuid, t, controller, fn);
                                    send(new Message(eventType.pubSub.subscribe, {
                                        T: t
                                    }, controller));
                                },
                                unsubscribe: function (t) {
                                    unregisterListener(uuid, t, controller);
                                    send(new Message(eventType.pubSub.unsubscribe, {
                                        T: t
                                    }, controller));
                                },
                                setEnum: setEnum,
                                storage: {
                                    set: function (key, value) {
                                        key = key.toLowerCase();
                                        var message = new Message(
                                            eventType.storage.set,
                                            {
                                                K: key,
                                                V: typeof (value) === "object" ? JSON.stringify(value) : value
                                            }, controller
                                        );
                                        send(message);
                                        return message;
                                    },
                                    get: function (key) {
                                        key = key.toLowerCase();
                                        var deferred = $q.defer();
                                        var p = eventType.storage.get + ":" + key;
                                        provider.promises[p] = deferred;
                                        var message = new Message(
                                              eventType.storage.get,
                                              {
                                                  K: key
                                              }, controller
                                          );
                                        send(message);
                                        return deferred.promise;
                                    },
                                    clear: function () {
                                        var message = new Message(
                                                eventType.storage.clear,
                                                {
                                                }, controller
                                            );
                                        send(message);
                                    },
                                    remove: function (key) {
                                        key = key.toLowerCase();
                                        var message = new Message(
                                              eventType.storage.remove,
                                              {
                                                  K: key
                                              }, controller
                                          );
                                        send(message);
                                    }
                                },
                                setProperty: setProperty,
                                getListeners: function () {
                                    return provider.listeners.filter(function (p) {
                                        return p.controller === controller && p.instance === uuid;
                                    });
                                }
                            };
                            registerListener(uuid, eventType.controller.onOpen, controller, function (event) {
                                var ci = {
                                    persistentId: event.PI,
                                    connectionId: event.CI
                                };
                                localStorage.setItem("ci", JSON.stringify(ci));
                                if (instance.onopen)
                                    instance.onopen(ci);
                            });
                            registerListener(uuid, eventType.controller.onClose, controller, function (event) {
                                removeListeners(uuid, event.C);
                                if (instance.onclose)
                                    instance.onclose();
                            });
                            registerListener(uuid, eventType.controller.onError, controller, function (err) {
                                if (instance.onerror)
                                    instance.onerror(err, controller);
                            });
                            if (arguments[1] instanceof Array) {
                                propertyList.forEach(function (prop) {
                                    setProperty(prop.name, prop.value);
                                });
                            } else if (arguments.length === 2) {
                                arguments[1].$on("$destroy", function () {
                                    instance.close();
                                });
                            }
                            if (arguments.length === 3) {
                                arguments[2].$on("$destroy", function () {
                                    instance.close();
                                });
                            }
                            // initialize the controller
                            init(controller);
                            return instance;
                        };
                    }
                ];
            }
        ]);
    })();
} 