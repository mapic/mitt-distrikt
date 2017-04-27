/*
 Leaflet 1.0.3+ed36a04, a JS library for interactive maps. http://leafletjs.com
 (c) 2010-2016 Vladimir Agafonkin, (c) 2010-2011 CloudMade
*/

window.L = {
    version: "1.0.3+ed36a04"
};

function expose() {
    var oldL = window.L;

    L.noConflict = function () {
        window.L = oldL;
        return this;
    };

    window.L = L;
}

// define Leaflet for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = L;

// define Leaflet as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(L);
}

// define Leaflet as a global L variable, saving the original L to restore later if needed
if (typeof window !== 'undefined') {
    expose();
}



/*
 * @namespace Util
 *
 * Various utility functions, used by Leaflet internally.
 */

L.Util = {

    // @function extend(dest: Object, src?: Object): Object
    // Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
    extend: function (dest) {
        var i, j, len, src;

        for (j = 1, len = arguments.length; j < len; j++) {
            src = arguments[j];
            for (i in src) {
                dest[i] = src[i];
            }
        }
        return dest;
    },

    // @function create(proto: Object, properties?: Object): Object
    // Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
    create: Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),

    // @function bind(fn: Function, …): Function
    // Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
    // Has a `L.bind()` shortcut.
    bind: function (fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        var args = slice.call(arguments, 2);

        return function () {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    },

    // @function stamp(obj: Object): Number
    // Returns the unique ID of an object, assiging it one if it doesn't have it.
    stamp: function (obj) {
        /*eslint-disable */
        obj._leaflet_id = obj._leaflet_id || ++L.Util.lastId;
        return obj._leaflet_id;
        /*eslint-enable */
    },

    // @property lastId: Number
    // Last unique ID used by [`stamp()`](#util-stamp)
    lastId: 0,

    // @function throttle(fn: Function, time: Number, context: Object): Function
    // Returns a function which executes function `fn` with the given scope `context`
    // (so that the `this` keyword refers to `context` inside `fn`'s code). The function
    // `fn` will be called no more than one time per given amount of `time`. The arguments
    // received by the bound function will be any arguments passed when binding the
    // function, followed by any arguments passed when invoking the bound function.
    // Has an `L.bind` shortcut.
    throttle: function (fn, time, context) {
        var lock, args, wrapperFn, later;

        later = function () {
            // reset lock and call if queued
            lock = false;
            if (args) {
                wrapperFn.apply(context, args);
                args = false;
            }
        };

        wrapperFn = function () {
            if (lock) {
                // called too soon, queue to call later
                args = arguments;

            } else {
                // call and lock until later
                fn.apply(context, arguments);
                setTimeout(later, time);
                lock = true;
            }
        };

        return wrapperFn;
    },

    // @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
    // Returns the number `num` modulo `range` in such a way so it lies within
    // `range[0]` and `range[1]`. The returned value will be always smaller than
    // `range[1]` unless `includeMax` is set to `true`.
    wrapNum: function (x, range, includeMax) {
        var max = range[1],
            min = range[0],
            d = max - min;
        return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
    },

    // @function falseFn(): Function
    // Returns a function which always returns `false`.
    falseFn: function () { return false; },

    // @function formatNum(num: Number, digits?: Number): Number
    // Returns the number `num` rounded to `digits` decimals, or to 5 decimals by default.
    formatNum: function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    },

    // @function trim(str: String): String
    // Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
    trim: function (str) {
        return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    },

    // @function splitWords(str: String): String[]
    // Trims and splits the string on whitespace and returns the array of parts.
    splitWords: function (str) {
        return L.Util.trim(str).split(/\s+/);
    },

    // @function setOptions(obj: Object, options: Object): Object
    // Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
    setOptions: function (obj, options) {
        if (!obj.hasOwnProperty('options')) {
            obj.options = obj.options ? L.Util.create(obj.options) : {};
        }
        for (var i in options) {
            obj.options[i] = options[i];
        }
        return obj.options;
    },

    // @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
    // Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
    // translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
    // be appended at the end. If `uppercase` is `true`, the parameter names will
    // be uppercased (e.g. `'?A=foo&B=bar'`)
    getParamString: function (obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
            params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    },

    // @function template(str: String, data: Object): String
    // Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
    // and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
    // `('Hello foo, bar')`. You can also specify functions instead of strings for
    // data values — they will be evaluated passing `data` as an argument.
    template: function (str, data) {
        return str.replace(L.Util.templateRe, function (str, key) {
            var value = data[key];

            if (value === undefined) {
                throw new Error('No value provided for variable ' + str);

            } else if (typeof value === 'function') {
                value = value(data);
            }
            return value;
        });
    },

    templateRe: /\{ *([\w_\-]+) *\}/g,

    // @function isArray(obj): Boolean
    // Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
    isArray: Array.isArray || function (obj) {
        return (Object.prototype.toString.call(obj) === '[object Array]');
    },

    // @function indexOf(array: Array, el: Object): Number
    // Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
    indexOf: function (array, el) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === el) { return i; }
        }
        return -1;
    },

    // @property emptyImageUrl: String
    // Data URI string containing a base64-encoded empty GIF image.
    // Used as a hack to free memory from unused images on WebKit-powered
    // mobile devices (by setting image `src` to this string).
    emptyImageUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
};

(function () {
    // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

    function getPrefixed(name) {
        return window['webkit' + name] || window['moz' + name] || window['ms' + name];
    }

    var lastTime = 0;

    // fallback for IE 7-8
    function timeoutDefer(fn) {
        var time = +new Date(),
            timeToCall = Math.max(0, 16 - (time - lastTime));

        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
    }

    var requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer,
        cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') ||
                   getPrefixed('CancelRequestAnimationFrame') || function (id) { window.clearTimeout(id); };


    // @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
    // Schedules `fn` to be executed when the browser repaints. `fn` is bound to
    // `context` if given. When `immediate` is set, `fn` is called immediately if
    // the browser doesn't have native support for
    // [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
    // otherwise it's delayed. Returns a request ID that can be used to cancel the request.
    L.Util.requestAnimFrame = function (fn, context, immediate) {
        if (immediate && requestFn === timeoutDefer) {
            fn.call(context);
        } else {
            return requestFn.call(window, L.bind(fn, context));
        }
    };

    // @function cancelAnimFrame(id: Number): undefined
    // Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
    L.Util.cancelAnimFrame = function (id) {
        if (id) {
            cancelFn.call(window, id);
        }
    };
})();

// shortcuts for most used utility functions
L.extend = L.Util.extend;
L.bind = L.Util.bind;
L.stamp = L.Util.stamp;
L.setOptions = L.Util.setOptions;




// @class Class
// @aka L.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

L.Class = function () {};

L.Class.extend = function (props) {

    // @function extend(props: Object): Function
    // [Extends the current class](#class-inheritance) given the properties to be included.
    // Returns a Javascript function that is a class constructor (to be called with `new`).
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        this.callInitHooks();
    };

    var parentProto = NewClass.__super__ = this.prototype;

    var proto = L.Util.create(parentProto);
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    // inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        L.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        L.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (proto.options) {
        props.options = L.Util.extend(L.Util.create(proto.options), props.options);
    }

    // mix given properties into the prototype
    L.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parentProto.callInitHooks) {
            parentProto.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };

    return NewClass;
};


// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
L.Class.include = function (props) {
    L.extend(this.prototype, props);
    return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
L.Class.mergeOptions = function (options) {
    L.extend(this.prototype.options, options);
    return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
L.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
    return this;
};



/*
 * @class Evented
 * @aka L.Evented
 * @inherits Class
 *
 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
 *
 * @example
 *
 * ```js
 * map.on('click', function(e) {
 *  alert(e.latlng);
 * } );
 * ```
 *
 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
 *
 * ```js
 * function onClick(e) { ... }
 *
 * map.on('click', onClick);
 * map.off('click', onClick);
 * ```
 */


L.Evented = L.Class.extend({

    /* @method on(type: String, fn: Function, context?: Object): this
     * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
     *
     * @alternative
     * @method on(eventMap: Object): this
     * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
     */
    on: function (types, fn, context) {

        // types can be a map of types/handlers
        if (typeof types === 'object') {
            for (var type in types) {
                // we don't process space-separated events here for performance;
                // it's a hot path since Layer uses the on(obj) syntax
                this._on(type, types[type], fn);
            }

        } else {
            // types can be a string of space-separated words
            types = L.Util.splitWords(types);

            for (var i = 0, len = types.length; i < len; i++) {
                this._on(types[i], fn, context);
            }
        }

        return this;
    },

    /* @method off(type: String, fn?: Function, context?: Object): this
     * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
     *
     * @alternative
     * @method off(eventMap: Object): this
     * Removes a set of type/listener pairs.
     *
     * @alternative
     * @method off: this
     * Removes all listeners to all events on the object.
     */
    off: function (types, fn, context) {

        if (!types) {
            // clear all listeners if called without arguments
            delete this._events;

        } else if (typeof types === 'object') {
            for (var type in types) {
                this._off(type, types[type], fn);
            }

        } else {
            types = L.Util.splitWords(types);

            for (var i = 0, len = types.length; i < len; i++) {
                this._off(types[i], fn, context);
            }
        }

        return this;
    },

    // attach listener (without syntactic sugar now)
    _on: function (type, fn, context) {
        this._events = this._events || {};

        /* get/init listeners for type */
        var typeListeners = this._events[type];
        if (!typeListeners) {
            typeListeners = [];
            this._events[type] = typeListeners;
        }

        if (context === this) {
            // Less memory footprint.
            context = undefined;
        }
        var newListener = {fn: fn, ctx: context},
            listeners = typeListeners;

        // check if fn already there
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i].fn === fn && listeners[i].ctx === context) {
                return;
            }
        }

        listeners.push(newListener);
    },

    _off: function (type, fn, context) {
        var listeners,
            i,
            len;

        if (!this._events) { return; }

        listeners = this._events[type];

        if (!listeners) {
            return;
        }

        if (!fn) {
            // Set all removed listeners to noop so they are not called if remove happens in fire
            for (i = 0, len = listeners.length; i < len; i++) {
                listeners[i].fn = L.Util.falseFn;
            }
            // clear all listeners for a type if function isn't specified
            delete this._events[type];
            return;
        }

        if (context === this) {
            context = undefined;
        }

        if (listeners) {

            // find fn and remove it
            for (i = 0, len = listeners.length; i < len; i++) {
                var l = listeners[i];
                if (l.ctx !== context) { continue; }
                if (l.fn === fn) {

                    // set the removed listener to noop so that's not called if remove happens in fire
                    l.fn = L.Util.falseFn;

                    if (this._firingCount) {
                        /* copy array in case events are being fired */
                        this._events[type] = listeners = listeners.slice();
                    }
                    listeners.splice(i, 1);

                    return;
                }
            }
        }
    },

    // @method fire(type: String, data?: Object, propagate?: Boolean): this
    // Fires an event of the specified type. You can optionally provide an data
    // object — the first argument of the listener function will contain its
    // properties. The event can optionally be propagated to event parents.
    fire: function (type, data, propagate) {
        if (!this.listens(type, propagate)) { return this; }

        var event = L.Util.extend({}, data, {type: type, target: this});

        if (this._events) {
            var listeners = this._events[type];

            if (listeners) {
                this._firingCount = (this._firingCount + 1) || 1;
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var l = listeners[i];
                    l.fn.call(l.ctx || this, event);
                }

                this._firingCount--;
            }
        }

        if (propagate) {
            // propagate the event to parents (set with addEventParent)
            this._propagateEvent(event);
        }

        return this;
    },

    // @method listens(type: String): Boolean
    // Returns `true` if a particular event type has any listeners attached to it.
    listens: function (type, propagate) {
        var listeners = this._events && this._events[type];
        if (listeners && listeners.length) { return true; }

        if (propagate) {
            // also check parents for listeners if event propagates
            for (var id in this._eventParents) {
                if (this._eventParents[id].listens(type, propagate)) { return true; }
            }
        }
        return false;
    },

    // @method once(…): this
    // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
    once: function (types, fn, context) {

        if (typeof types === 'object') {
            for (var type in types) {
                this.once(type, types[type], fn);
            }
            return this;
        }

        var handler = L.bind(function () {
            this
                .off(types, fn, context)
                .off(types, handler, context);
        }, this);

        // add a listener that's executed once and removed after that
        return this
            .on(types, fn, context)
            .on(types, handler, context);
    },

    // @method addEventParent(obj: Evented): this
    // Adds an event parent - an `Evented` that will receive propagated events
    addEventParent: function (obj) {
        this._eventParents = this._eventParents || {};
        this._eventParents[L.stamp(obj)] = obj;
        return this;
    },

    // @method removeEventParent(obj: Evented): this
    // Removes an event parent, so it will stop receiving propagated events
    removeEventParent: function (obj) {
        if (this._eventParents) {
            delete this._eventParents[L.stamp(obj)];
        }
        return this;
    },

    _propagateEvent: function (e) {
        for (var id in this._eventParents) {
            this._eventParents[id].fire(e.type, L.extend({layer: e.target}, e), true);
        }
    }
});

var proto = L.Evented.prototype;

// aliases; we should ditch those eventually

// @method addEventListener(…): this
// Alias to [`on(…)`](#evented-on)
proto.addEventListener = proto.on;

// @method removeEventListener(…): this
// Alias to [`off(…)`](#evented-off)

// @method clearAllEventListeners(…): this
// Alias to [`off()`](#evented-off)
proto.removeEventListener = proto.clearAllEventListeners = proto.off;

// @method addOneTimeEventListener(…): this
// Alias to [`once(…)`](#evented-once)
proto.addOneTimeEventListener = proto.once;

// @method fireEvent(…): this
// Alias to [`fire(…)`](#evented-fire)
proto.fireEvent = proto.fire;

// @method hasEventListeners(…): Boolean
// Alias to [`listens(…)`](#evented-listens)
proto.hasEventListeners = proto.listens;

L.Mixin = {Events: proto};



/*
 * @namespace Browser
 * @aka L.Browser
 *
 * A namespace with static properties for browser/feature detection used by Leaflet internally.
 *
 * @example
 *
 * ```js
 * if (L.Browser.ielt9) {
 *   alert('Upgrade your browser, dude!');
 * }
 * ```
 */

(function () {

    var ua = navigator.userAgent.toLowerCase(),
        doc = document.documentElement,

        ie = 'ActiveXObject' in window,

        webkit    = ua.indexOf('webkit') !== -1,
        phantomjs = ua.indexOf('phantom') !== -1,
        android23 = ua.search('android [23]') !== -1,
        chrome    = ua.indexOf('chrome') !== -1,
        gecko     = ua.indexOf('gecko') !== -1  && !webkit && !window.opera && !ie,

        win = navigator.platform.indexOf('Win') === 0,

        mobile = typeof orientation !== 'undefined' || ua.indexOf('mobile') !== -1,
        msPointer = !window.PointerEvent && window.MSPointerEvent,
        pointer = window.PointerEvent || msPointer,

        ie3d = ie && ('transition' in doc.style),
        webkit3d = ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !android23,
        gecko3d = 'MozPerspective' in doc.style,
        opera12 = 'OTransition' in doc.style;


    var touch = !window.L_NO_TOUCH && (pointer || 'ontouchstart' in window ||
            (window.DocumentTouch && document instanceof window.DocumentTouch));

    L.Browser = {

        // @property ie: Boolean
        // `true` for all Internet Explorer versions (not Edge).
        ie: ie,

        // @property ielt9: Boolean
        // `true` for Internet Explorer versions less than 9.
        ielt9: ie && !document.addEventListener,

        // @property edge: Boolean
        // `true` for the Edge web browser.
        edge: 'msLaunchUri' in navigator && !('documentMode' in document),

        // @property webkit: Boolean
        // `true` for webkit-based browsers like Chrome and Safari (including mobile versions).
        webkit: webkit,

        // @property gecko: Boolean
        // `true` for gecko-based browsers like Firefox.
        gecko: gecko,

        // @property android: Boolean
        // `true` for any browser running on an Android platform.
        android: ua.indexOf('android') !== -1,

        // @property android23: Boolean
        // `true` for browsers running on Android 2 or Android 3.
        android23: android23,

        // @property chrome: Boolean
        // `true` for the Chrome browser.
        chrome: chrome,

        // @property safari: Boolean
        // `true` for the Safari browser.
        safari: !chrome && ua.indexOf('safari') !== -1,


        // @property win: Boolean
        // `true` when the browser is running in a Windows platform
        win: win,


        // @property ie3d: Boolean
        // `true` for all Internet Explorer versions supporting CSS transforms.
        ie3d: ie3d,

        // @property webkit3d: Boolean
        // `true` for webkit-based browsers supporting CSS transforms.
        webkit3d: webkit3d,

        // @property gecko3d: Boolean
        // `true` for gecko-based browsers supporting CSS transforms.
        gecko3d: gecko3d,

        // @property opera12: Boolean
        // `true` for the Opera browser supporting CSS transforms (version 12 or later).
        opera12: opera12,

        // @property any3d: Boolean
        // `true` for all browsers supporting CSS transforms.
        any3d: !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantomjs,


        // @property mobile: Boolean
        // `true` for all browsers running in a mobile device.
        mobile: mobile,

        // @property mobileWebkit: Boolean
        // `true` for all webkit-based browsers in a mobile device.
        mobileWebkit: mobile && webkit,

        // @property mobileWebkit3d: Boolean
        // `true` for all webkit-based browsers in a mobile device supporting CSS transforms.
        mobileWebkit3d: mobile && webkit3d,

        // @property mobileOpera: Boolean
        // `true` for the Opera browser in a mobile device.
        mobileOpera: mobile && window.opera,

        // @property mobileGecko: Boolean
        // `true` for gecko-based browsers running in a mobile device.
        mobileGecko: mobile && gecko,


        // @property touch: Boolean
        // `true` for all browsers supporting [touch events](https://developer.mozilla.org/docs/Web/API/Touch_events).
        // This does not necessarily mean that the browser is running in a computer with
        // a touchscreen, it only means that the browser is capable of understanding
        // touch events.
        touch: !!touch,

        // @property msPointer: Boolean
        // `true` for browsers implementing the Microsoft touch events model (notably IE10).
        msPointer: !!msPointer,

        // @property pointer: Boolean
        // `true` for all browsers supporting [pointer events](https://msdn.microsoft.com/en-us/library/dn433244%28v=vs.85%29.aspx).
        pointer: !!pointer,


        // @property retina: Boolean
        // `true` for browsers on a high-resolution "retina" screen.
        retina: (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1
    };

}());



/*
 * @namespace DomUtil
 *
 * Utility functions to work with the [DOM](https://developer.mozilla.org/docs/Web/API/Document_Object_Model)
 * tree, used by Leaflet internally.
 *
 * Most functions expecting or returning a `HTMLElement` also work for
 * SVG elements. The only difference is that classes refer to CSS classes
 * in HTML and SVG classes in SVG.
 */

L.DomUtil = {

    // @function get(id: String|HTMLElement): HTMLElement
    // Returns an element given its DOM id, or returns the element itself
    // if it was passed directly.
    get: function (id) {
        return typeof id === 'string' ? document.getElementById(id) : id;
    },

    // @function getStyle(el: HTMLElement, styleAttrib: String): String
    // Returns the value for a certain style attribute on an element,
    // including computed values or values set through CSS.
    getStyle: function (el, style) {

        var value = el.style[style] || (el.currentStyle && el.currentStyle[style]);

        if ((!value || value === 'auto') && document.defaultView) {
            var css = document.defaultView.getComputedStyle(el, null);
            value = css ? css[style] : null;
        }

        return value === 'auto' ? null : value;
    },

    // @function create(tagName: String, className?: String, container?: HTMLElement): HTMLElement
    // Creates an HTML element with `tagName`, sets its class to `className`, and optionally appends it to `container` element.
    create: function (tagName, className, container) {

        var el = document.createElement(tagName);
        el.className = className || '';

        if (container) {
            container.appendChild(el);
        }

        return el;
    },

    // @function remove(el: HTMLElement)
    // Removes `el` from its parent element
    remove: function (el) {
        var parent = el.parentNode;
        if (parent) {
            parent.removeChild(el);
        }
    },

    // @function empty(el: HTMLElement)
    // Removes all of `el`'s children elements from `el`
    empty: function (el) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
    },

    // @function toFront(el: HTMLElement)
    // Makes `el` the last children of its parent, so it renders in front of the other children.
    toFront: function (el) {
        el.parentNode.appendChild(el);
    },

    // @function toBack(el: HTMLElement)
    // Makes `el` the first children of its parent, so it renders back from the other children.
    toBack: function (el) {
        var parent = el.parentNode;
        parent.insertBefore(el, parent.firstChild);
    },

    // @function hasClass(el: HTMLElement, name: String): Boolean
    // Returns `true` if the element's class attribute contains `name`.
    hasClass: function (el, name) {
        if (el.classList !== undefined) {
            return el.classList.contains(name);
        }
        var className = L.DomUtil.getClass(el);
        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    },

    // @function addClass(el: HTMLElement, name: String)
    // Adds `name` to the element's class attribute.
    addClass: function (el, name) {
        if (el.classList !== undefined) {
            var classes = L.Util.splitWords(name);
            for (var i = 0, len = classes.length; i < len; i++) {
                el.classList.add(classes[i]);
            }
        } else if (!L.DomUtil.hasClass(el, name)) {
            var className = L.DomUtil.getClass(el);
            L.DomUtil.setClass(el, (className ? className + ' ' : '') + name);
        }
    },

    // @function removeClass(el: HTMLElement, name: String)
    // Removes `name` from the element's class attribute.
    removeClass: function (el, name) {
        if (el.classList !== undefined) {
            el.classList.remove(name);
        } else {
            L.DomUtil.setClass(el, L.Util.trim((' ' + L.DomUtil.getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
        }
    },

    // @function setClass(el: HTMLElement, name: String)
    // Sets the element's class.
    setClass: function (el, name) {
        if (el.className.baseVal === undefined) {
            el.className = name;
        } else {
            // in case of SVG element
            el.className.baseVal = name;
        }
    },

    // @function getClass(el: HTMLElement): String
    // Returns the element's class.
    getClass: function (el) {
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    },

    // @function setOpacity(el: HTMLElement, opacity: Number)
    // Set the opacity of an element (including old IE support).
    // `opacity` must be a number from `0` to `1`.
    setOpacity: function (el, value) {

        if ('opacity' in el.style) {
            el.style.opacity = value;

        } else if ('filter' in el.style) {
            L.DomUtil._setOpacityIE(el, value);
        }
    },

    _setOpacityIE: function (el, value) {
        var filter = false,
            filterName = 'DXImageTransform.Microsoft.Alpha';

        // filters collection throws an error if we try to retrieve a filter that doesn't exist
        try {
            filter = el.filters.item(filterName);
        } catch (e) {
            // don't set opacity to 1 if we haven't already set an opacity,
            // it isn't needed and breaks transparent pngs.
            if (value === 1) { return; }
        }

        value = Math.round(value * 100);

        if (filter) {
            filter.Enabled = (value !== 100);
            filter.Opacity = value;
        } else {
            el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
        }
    },

    // @function testProp(props: String[]): String|false
    // Goes through the array of style names and returns the first name
    // that is a valid style name for an element. If no such name is found,
    // it returns false. Useful for vendor-prefixed styles like `transform`.
    testProp: function (props) {

        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    },

    // @function setTransform(el: HTMLElement, offset: Point, scale?: Number)
    // Resets the 3D CSS transform of `el` so it is translated by `offset` pixels
    // and optionally scaled by `scale`. Does not have an effect if the
    // browser doesn't support 3D CSS transforms.
    setTransform: function (el, offset, scale) {
        var pos = offset || new L.Point(0, 0);

        el.style[L.DomUtil.TRANSFORM] =
            (L.Browser.ie3d ?
                'translate(' + pos.x + 'px,' + pos.y + 'px)' :
                'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
            (scale ? ' scale(' + scale + ')' : '');
    },

    // @function setPosition(el: HTMLElement, position: Point)
    // Sets the position of `el` to coordinates specified by `position`,
    // using CSS translate or top/left positioning depending on the browser
    // (used by Leaflet internally to position its layers).
    setPosition: function (el, point) { // (HTMLElement, Point[, Boolean])

        /*eslint-disable */
        el._leaflet_pos = point;
        /*eslint-enable */

        if (L.Browser.any3d) {
            L.DomUtil.setTransform(el, point);
        } else {
            el.style.left = point.x + 'px';
            el.style.top = point.y + 'px';
        }
    },

    // @function getPosition(el: HTMLElement): Point
    // Returns the coordinates of an element previously positioned with setPosition.
    getPosition: function (el) {
        // this method is only used for elements previously positioned using setPosition,
        // so it's safe to cache the position for performance

        return el._leaflet_pos || new L.Point(0, 0);
    }
};


(function () {
    // prefix style property names

    // @property TRANSFORM: String
    // Vendor-prefixed fransform style name (e.g. `'webkitTransform'` for WebKit).
    L.DomUtil.TRANSFORM = L.DomUtil.testProp(
            ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);


    // webkitTransition comes first because some browser versions that drop vendor prefix don't do
    // the same for the transitionend event, in particular the Android 4.1 stock browser

    // @property TRANSITION: String
    // Vendor-prefixed transform style name.
    var transition = L.DomUtil.TRANSITION = L.DomUtil.testProp(
            ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

    L.DomUtil.TRANSITION_END =
            transition === 'webkitTransition' || transition === 'OTransition' ? transition + 'End' : 'transitionend';

    // @function disableTextSelection()
    // Prevents the user from generating `selectstart` DOM events, usually generated
    // when the user drags the mouse through a page with text. Used internally
    // by Leaflet to override the behaviour of any click-and-drag interaction on
    // the map. Affects drag interactions on the whole document.

    // @function enableTextSelection()
    // Cancels the effects of a previous [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection).
    if ('onselectstart' in document) {
        L.DomUtil.disableTextSelection = function () {
            L.DomEvent.on(window, 'selectstart', L.DomEvent.preventDefault);
        };
        L.DomUtil.enableTextSelection = function () {
            L.DomEvent.off(window, 'selectstart', L.DomEvent.preventDefault);
        };

    } else {
        var userSelectProperty = L.DomUtil.testProp(
            ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

        L.DomUtil.disableTextSelection = function () {
            if (userSelectProperty) {
                var style = document.documentElement.style;
                this._userSelect = style[userSelectProperty];
                style[userSelectProperty] = 'none';
            }
        };
        L.DomUtil.enableTextSelection = function () {
            if (userSelectProperty) {
                document.documentElement.style[userSelectProperty] = this._userSelect;
                delete this._userSelect;
            }
        };
    }

    // @function disableImageDrag()
    // As [`L.DomUtil.disableTextSelection`](#domutil-disabletextselection), but
    // for `dragstart` DOM events, usually generated when the user drags an image.
    L.DomUtil.disableImageDrag = function () {
        L.DomEvent.on(window, 'dragstart', L.DomEvent.preventDefault);
    };

    // @function enableImageDrag()
    // Cancels the effects of a previous [`L.DomUtil.disableImageDrag`](#domutil-disabletextselection).
    L.DomUtil.enableImageDrag = function () {
        L.DomEvent.off(window, 'dragstart', L.DomEvent.preventDefault);
    };

    // @function preventOutline(el: HTMLElement)
    // Makes the [outline](https://developer.mozilla.org/docs/Web/CSS/outline)
    // of the element `el` invisible. Used internally by Leaflet to prevent
    // focusable elements from displaying an outline when the user performs a
    // drag interaction on them.
    L.DomUtil.preventOutline = function (element) {
        while (element.tabIndex === -1) {
            element = element.parentNode;
        }
        if (!element || !element.style) { return; }
        L.DomUtil.restoreOutline();
        this._outlineElement = element;
        this._outlineStyle = element.style.outline;
        element.style.outline = 'none';
        L.DomEvent.on(window, 'keydown', L.DomUtil.restoreOutline, this);
    };

    // @function restoreOutline()
    // Cancels the effects of a previous [`L.DomUtil.preventOutline`]().
    L.DomUtil.restoreOutline = function () {
        if (!this._outlineElement) { return; }
        this._outlineElement.style.outline = this._outlineStyle;
        delete this._outlineElement;
        delete this._outlineStyle;
        L.DomEvent.off(window, 'keydown', L.DomUtil.restoreOutline, this);
    };
})();



/*
 * @namespace DomEvent
 * Utility functions to work with the [DOM events](https://developer.mozilla.org/docs/Web/API/Event), used by Leaflet internally.
 */

// Inspired by John Resig, Dean Edwards and YUI addEvent implementations.



var eventsKey = '_leaflet_events';

L.DomEvent = {

    // @function on(el: HTMLElement, types: String, fn: Function, context?: Object): this
    // Adds a listener function (`fn`) to a particular DOM event type of the
    // element `el`. You can optionally specify the context of the listener
    // (object the `this` keyword will point to). You can also pass several
    // space-separated types (e.g. `'click dblclick'`).

    // @alternative
    // @function on(el: HTMLElement, eventMap: Object, context?: Object): this
    // Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
    on: function (obj, types, fn, context) {

        if (typeof types === 'object') {
            for (var type in types) {
                this._on(obj, type, types[type], fn);
            }
        } else {
            types = L.Util.splitWords(types);

            for (var i = 0, len = types.length; i < len; i++) {
                this._on(obj, types[i], fn, context);
            }
        }

        return this;
    },

    // @function off(el: HTMLElement, types: String, fn: Function, context?: Object): this
    // Removes a previously added listener function. If no function is specified,
    // it will remove all the listeners of that particular DOM event from the element.
    // Note that if you passed a custom context to on, you must pass the same
    // context to `off` in order to remove the listener.

    // @alternative
    // @function off(el: HTMLElement, eventMap: Object, context?: Object): this
    // Removes a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
    off: function (obj, types, fn, context) {

        if (typeof types === 'object') {
            for (var type in types) {
                this._off(obj, type, types[type], fn);
            }
        } else {
            types = L.Util.splitWords(types);

            for (var i = 0, len = types.length; i < len; i++) {
                this._off(obj, types[i], fn, context);
            }
        }

        return this;
    },

    _on: function (obj, type, fn, context) {
        var id = type + L.stamp(fn) + (context ? '_' + L.stamp(context) : '');

        if (obj[eventsKey] && obj[eventsKey][id]) { return this; }

        var handler = function (e) {
            return fn.call(context || obj, e || window.event);
        };

        var originalHandler = handler;

        if (L.Browser.pointer && type.indexOf('touch') === 0) {
            this.addPointerListener(obj, type, handler, id);

        } else if (L.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener &&
                   !(L.Browser.pointer && L.Browser.chrome)) {
            // Chrome >55 does not need the synthetic dblclicks from addDoubleTapListener
            // See #5180
            this.addDoubleTapListener(obj, handler, id);

        } else if ('addEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

            } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
                handler = function (e) {
                    e = e || window.event;
                    if (L.DomEvent._isExternalTarget(obj, e)) {
                        originalHandler(e);
                    }
                };
                obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false);

            } else {
                if (type === 'click' && L.Browser.android) {
                    handler = function (e) {
                        return L.DomEvent._filterClick(e, originalHandler);
                    };
                }
                obj.addEventListener(type, handler, false);
            }

        } else if ('attachEvent' in obj) {
            obj.attachEvent('on' + type, handler);
        }

        obj[eventsKey] = obj[eventsKey] || {};
        obj[eventsKey][id] = handler;

        return this;
    },

    _off: function (obj, type, fn, context) {

        var id = type + L.stamp(fn) + (context ? '_' + L.stamp(context) : ''),
            handler = obj[eventsKey] && obj[eventsKey][id];

        if (!handler) { return this; }

        if (L.Browser.pointer && type.indexOf('touch') === 0) {
            this.removePointerListener(obj, type, id);

        } else if (L.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
            this.removeDoubleTapListener(obj, id);

        } else if ('removeEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false);

            } else {
                obj.removeEventListener(
                    type === 'mouseenter' ? 'mouseover' :
                    type === 'mouseleave' ? 'mouseout' : type, handler, false);
            }

        } else if ('detachEvent' in obj) {
            obj.detachEvent('on' + type, handler);
        }

        obj[eventsKey][id] = null;

        return this;
    },

    // @function stopPropagation(ev: DOMEvent): this
    // Stop the given event from propagation to parent elements. Used inside the listener functions:
    // ```js
    // L.DomEvent.on(div, 'click', function (ev) {
    //  L.DomEvent.stopPropagation(ev);
    // });
    // ```
    stopPropagation: function (e) {

        if (e.stopPropagation) {
            e.stopPropagation();
        } else if (e.originalEvent) {  // In case of Leaflet event.
            e.originalEvent._stopped = true;
        } else {
            e.cancelBubble = true;
        }
        L.DomEvent._skipped(e);

        return this;
    },

    // @function disableScrollPropagation(el: HTMLElement): this
    // Adds `stopPropagation` to the element's `'mousewheel'` events (plus browser variants).
    disableScrollPropagation: function (el) {
        return L.DomEvent.on(el, 'mousewheel', L.DomEvent.stopPropagation);
    },

    // @function disableClickPropagation(el: HTMLElement): this
    // Adds `stopPropagation` to the element's `'click'`, `'doubleclick'`,
    // `'mousedown'` and `'touchstart'` events (plus browser variants).
    disableClickPropagation: function (el) {
        var stop = L.DomEvent.stopPropagation;

        L.DomEvent.on(el, L.Draggable.START.join(' '), stop);

        return L.DomEvent.on(el, {
            click: L.DomEvent._fakeStop,
            dblclick: stop
        });
    },

    // @function preventDefault(ev: DOMEvent): this
    // Prevents the default action of the DOM Event `ev` from happening (such as
    // following a link in the href of the a element, or doing a POST request
    // with page reload when a `<form>` is submitted).
    // Use it inside listener functions.
    preventDefault: function (e) {

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return this;
    },

    // @function stop(ev): this
    // Does `stopPropagation` and `preventDefault` at the same time.
    stop: function (e) {
        return L.DomEvent
            .preventDefault(e)
            .stopPropagation(e);
    },

    // @function getMousePosition(ev: DOMEvent, container?: HTMLElement): Point
    // Gets normalized mouse position from a DOM event relative to the
    // `container` or to the whole page if not specified.
    getMousePosition: function (e, container) {
        if (!container) {
            return new L.Point(e.clientX, e.clientY);
        }

        var rect = container.getBoundingClientRect();

        return new L.Point(
            e.clientX - rect.left - container.clientLeft,
            e.clientY - rect.top - container.clientTop);
    },

    // Chrome on Win scrolls double the pixels as in other platforms (see #4538),
    // and Firefox scrolls device pixels, not CSS pixels
    _wheelPxFactor: (L.Browser.win && L.Browser.chrome) ? 2 :
                    L.Browser.gecko ? window.devicePixelRatio :
                    1,

    // @function getWheelDelta(ev: DOMEvent): Number
    // Gets normalized wheel delta from a mousewheel DOM event, in vertical
    // pixels scrolled (negative if scrolling down).
    // Events from pointing devices without precise scrolling are mapped to
    // a best guess of 60 pixels.
    getWheelDelta: function (e) {
        return (L.Browser.edge) ? e.wheelDeltaY / 2 : // Don't trust window-geometry-based delta
               (e.deltaY && e.deltaMode === 0) ? -e.deltaY / L.DomEvent._wheelPxFactor : // Pixels
               (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 20 : // Lines
               (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 60 : // Pages
               (e.deltaX || e.deltaZ) ? 0 : // Skip horizontal/depth wheel events
               e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
               (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 20 : // Legacy Moz lines
               e.detail ? e.detail / -32765 * 60 : // Legacy Moz pages
               0;
    },

    _skipEvents: {},

    _fakeStop: function (e) {
        // fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
        L.DomEvent._skipEvents[e.type] = true;
    },

    _skipped: function (e) {
        var skipped = this._skipEvents[e.type];
        // reset when checking, as it's only used in map container and propagates outside of the map
        this._skipEvents[e.type] = false;
        return skipped;
    },

    // check if element really left/entered the event target (for mouseenter/mouseleave)
    _isExternalTarget: function (el, e) {

        var related = e.relatedTarget;

        if (!related) { return true; }

        try {
            while (related && (related !== el)) {
                related = related.parentNode;
            }
        } catch (err) {
            return false;
        }
        return (related !== el);
    },

    // this is a horrible workaround for a bug in Android where a single touch triggers two click events
    _filterClick: function (e, handler) {
        var timeStamp = (e.timeStamp || (e.originalEvent && e.originalEvent.timeStamp)),
            elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

        // are they closer together than 500ms yet more than 100ms?
        // Android typically triggers them ~300ms apart while multiple listeners
        // on the same event should be triggered far faster;
        // or check if click is simulated on the element, and if it is, reject any non-simulated events

        if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
            L.DomEvent.stop(e);
            return;
        }
        L.DomEvent._lastClick = timeStamp;

        handler(e);
    }
};

// @function addListener(…): this
// Alias to [`L.DomEvent.on`](#domevent-on)
L.DomEvent.addListener = L.DomEvent.on;

// @function removeListener(…): this
// Alias to [`L.DomEvent.off`](#domevent-off)
L.DomEvent.removeListener = L.DomEvent.off;


