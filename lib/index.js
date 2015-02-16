/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var debug = require('debug')('nmcpp:resolver')

var _ = require("lodash")
var util = require('util')
var async = require('async')
var punycode = require('punycode')

/*jshint -W079 */
var Promise = require('bluebird')
/*jshint +W079 */

/* Utils
============================================================================= */

// Recursive process.nextTick is used. This will break in the next version of node.
// setImmediate should be used for recursive deferral.

var nextTick = process.nextTick

try {
    if (typeof setImmediate === 'function') {
        debug('Using setImmediate() for deferral')
        nextTick = setImmediate
    }
} catch (exc) {
    debug('Using process.nextTick() for deferral')
}

var parseJson = function(data, callback) {
    var json
    try {
        json = JSON.parse(data)
    } catch (exc) {
        return callback(exc)
    }
    callback(null, json)
}
var parseJsonAsync = Promise.promisify(parseJson)

var parseNameData = function(data, callback) {
    parseJson(data, function(err, result) {
        if (err) {
            return callback(err)
        }
        if (result.hasOwnProperty('txid') && result.hasOwnProperty('value')) {
            return callback(null, result.value)
        } else {
            return callback(null, result)
        }
    })
}
var parseNameDataAsync = Promise.promisify(parseNameData)

/* Helpers
============================================================================= */

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function() {
            return parent.apply(this, arguments);
        };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function() {
        this.constructor = child;
    };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    // Set prototype properties in case ones are needed later
    child.__props__ = protoProps;

    return child;
};

/* DataHolder
============================================================================= */

var DataHolder = function(provider, name, path, data, dbg) {
    dbg = dbg || debug

    this._provider = provider

    this._name = name
    this._path = path

    this._err = null
    this._data = data

    this.debug = function() {} //require('debug')(dbg.namespace + ':' + name + ':' + path)

    this._lock = null
    this._queue = []

    this._ready = false

    Object.defineProperty(this, 'legend', {
        get: function() {
            return this._path
        }
    })

    this.debug('new DataHodler(%s@%s)', name, path)
}

DataHolder.prototype.domain = function() {
    var path = this._path.split('.')
    if (path.length > 2) {
        return path[path.length - 2] + '.' + path[path.length - 1]
    } else {
        return this._path
    }
}

DataHolder.prototype.lock = function(session, handler) {
    var self = this

    if (!session) {
        return handler(new Error('Session is required'))
    }

    if (self._lock) {
        //self.debug('(%s) Locked, waiting...', self.legend)
        return self._queue.push(handler)
    }

    self._queue.push(handler)
    async.whilst(function() {
            return self._queue.length > 0
        },
        function(callback) {
            //self.debug('(%s) Lock', self.legend)
            self._lock = self
            var queue = self._queue
            self._queue = []

            async.each(queue,
                function(handler, callback) {
                    handler(self._err, self._data, function(err, res) {
                        if (err || res) {
                            self._err = err
                            self._data = res
                        }
                        callback()
                    })
                },
                function(err) {
                    //self.debug('(%s) Unlock', self.legend)
                    self._lock = null
                    callback()
                })
        },
        function(err) {
            // Nothing to do here
        })
}

DataHolder.prototype.lookup = function(name, callback) {
    var self = this
        // We dont need data locking here because data attributes cant be changed
    if (self._data instanceof Object) {
        var path = name.split('.')
        var data = self._data
        for (var idx = path.length - 1; idx >= 0; idx--) {
            var key = path[idx]
            if (data.hasOwnProperty(key)) {
                data = data[key]
            } else {
                return callback(path.slice(0, idx + 1).join('.'), data)
            }
        }
        return callback(null, data)
    } else {
        //self.debug('(%s) Data is not an object', self.legend)
        return callback(name, null)
    }
}

DataHolder.prototype.lookupAsync = Promise.promisify(DataHolder.prototype.lookup)

var _typeof = function(src) {
    if (src === null) {
        return 'null'
    } else
    if (Array.isArray(src)) {
        return 'array'
    } else {
        return typeof src
    }
}

var _processImport = function(dst, src, importDebug) {
    if (typeof dst !== 'object') {
        return dst
    }
    var name, hdst;
    for (name in src) {
        importDebug('dst.%s: %s, src.%s: %s', name, _typeof(dst[name]), name, _typeof(src[name]))
        if (hasOwnProperty.call(src, name)) {
            var vsrc = src[name]
            var vdst = dst[name]
            hdst = dst.hasOwnProperty(name)
            if ((!hdst) || (hdst && dst[name] === null)) {
                importDebug('1/ dst.%s = %s', name, vsrc)
                dst[name] = vsrc
            } else
            if (_typeof(vdst) === 'array') {
                if (_typeof(vsrc) === 'array') {
                    importDebug('2/ dst.%s.concat(%s)', name, vsrc)
                    dst[name] = vdst.concat(vsrc)
                } else {
                    importDebug('3/ dst.%s.push(%s)', name, vsrc)
                    vdst.push(vsrc)
                }
            } else
            if (_typeof(vdst) === 'object') {
                if (_typeof(vsrc) === 'object') {
                    importDebug('4/ import(dst.%s, %s)', name, vsrc)
                    _processImport(vdst, vsrc, require('debug')(importDebug.namespace + '.' + name))
                } else {
                    importDebug('5/ dst.%s[""] = %s', name, vsrc)
                    vdst[""] = vsrc
                }
            } else {
                if (_typeof(vsrc) === 'array') {
                    importDebug('6/ dst.%s = [%s].concat(%s)', name, vdst, vsrc)
                    dst[name] = [vdst].concat(vsrc)
                } else {
                    importDebug('7/ dst.%s = [%s, %s]', name, vdst, vsrc)
                    dst[name] = [vdst, vsrc]
                }
            }
        }
    }
    return dst;
}

var _findOneInTheMap = function(res, name) {
    if (res.hasOwnProperty('map')) {
        if (res.map.hasOwnProperty(name)) {
            return res.map[name]
        } else
        if (res.map.hasOwnProperty('*')) {
            return res.map['*']
        } else
        if (res.map.hasOwnProperty('')) {
            return res.map['']
        }
    }
    return null
}

DataHolder.prototype._loadForeignData = function(session, data, callback) {
    var self = this
    if (data.length > 0) {
        var ncname = data[0]
        if (typeof ncname === 'string') {
            if ((data.length > 1) && (typeof data[1] !== 'string')) {
                // Covered by Test-0002-0072
                return callback(new Error('Invalid type (' + typeof data[1] + ') of the 2nd argument'))
            }
            // async
            nextTick(function() {
                //self.debug('(%s) Loading data from "%s"...', self.legend, ncname)
                self._provider.loadData(ncname, self._path, function(dlerr, dlres) {
                    if (dlerr) {
                        //self.debug('(%s) Data loading failed, breaking...', self.legend)
                        return callback(dlerr)
                    }
                    //self.debug('(%s) Data loaded, received %s', self.legend, util.inspect(dlres._data))
                    if (data.length > 1) {
                        var rcname = data[1]
                        //self.debug('(%s) Need to delegate "%s" from the received data', self.legend, rcname)
                        return dlres.find(session, rcname, callback)
                    } else {
                        //self.debug('(%s) Need to delegate received data as is', self.legend)
                        return dlres._findSingleDomain(session, '', callback)
                    }
                }, self.debug)
            })
        } else {
            // Covered by Test-0002-0071
            return callback(new Error('Invalid type (' + typeof ncname + ') of the 1st argument'))
        }
    } else {
        //self.debug('(%s) Empty list found, breaking...', self.legend)
        return callback(new Error('Empty list in delegation'))
    }
}

/** Preprocess if required
 */
DataHolder.prototype.read = function(session, callback) {
    var self = this
    if (self._ready) {
        //self.debug('(%s) Ready', self.legend)
        return callback(null, self._data)
    }
    //self.debug('(%s) ++> Preprocessing...', self.legend)
    self.lock(session, function(err, res, unlock) {
        if (err) {
            return callback(new Error('Failed to lock data'))
        }
        async.forever(
            function(next) {
                //self.debug('(%s) Analysing %s...', self.legend, util.inspect(res))
                if (Array.isArray(res)) {
                    //console.log('1/', res)
                    // async
                    nextTick(function() {
                        //self.debug('(%s) Delegation detected, requesting...', self.legend)
                        return self._loadForeignData(session, res, function(dlerr, dlres) {
                            if (dlerr) {
                                //self.debug('(%s) Delegation failed %s, breaking...', self.legend, dlerr)
                                return next(dlerr)
                            } else {
                                //self.debug('(%s) Delegation completed, received %s', self.legend, util.inspect(dlres._data))
                                self._data = res = dlres._data
                                return next()
                            }
                        })
                    })
                } else {
                    if (res instanceof Object) {
                        //self.debug('(%s) Step 1: Checking for delegation first...', self.legend)
                        if (res.hasOwnProperty('delegate')) {
                            //console.log('2/', res.delegate)
                            // async
                            nextTick(function() {
                                //self.debug('(%s) Delegation detected, requesting...', self.legend)
                                return self._loadForeignData(session, res.delegate, function(dlerr, dlres) {
                                    if (dlerr) {
                                        //self.debug('(%s) Delegation failed %s, breaking...', self.legend, dlerr)
                                        return next(dlerr)
                                    } else {
                                        //self.debug('(%s) Delegation completed, received %s', self.legend, util.inspect(dlres._data))
                                        self._data = res = dlres._data
                                        return next()
                                    }
                                })
                            })
                        } else {
                            //self.debug('(%s) Step 2: Importing foreign data...', self.legend)
                            if (res.hasOwnProperty('import')) {
                                //self.debug('(%s) Import section found, processing...', self.legend)
                                var importCommands = res['import']
                                if (Array.isArray(importCommands)) {
                                    if (importCommands.length > 0) {
                                        delete res['import']
                                        async.reduce(importCommands, self._data,
                                            function(memo, command, callback) {
                                                // async
                                                nextTick(function() {
                                                    //self.debug('(%s) Loading foreign data %s...', self.legend, util.inspect(command))
                                                    self._loadForeignData(session, command, function(err, res) {
                                                        if (err) {
                                                            //self.debug('(%s) Failed to load foreign data: ', self.legend, err)
                                                            return callback(err)
                                                        } else {
                                                            //self.debug('(%s) Imported foreign data, merging...', self.legend)
                                                            //self.debug('(%s) --- Dst: %s', self.legend, util.inspect(memo))
                                                            //self.debug('(%s) --- Src: %s', self.legend, util.inspect(res._data))
                                                            _processImport(memo, res._data, self.debug)
                                                            //self.debug('(%s) --- Res: %s', self.legend, util.inspect(memo))
                                                            return callback(err, memo)
                                                        }
                                                    })
                                                })
                                            },
                                            function(err, result) {
                                                return next()
                                            })
                                    } else {
                                        //self.debug('(%s) Import section contains an empty list, deleting...', self.legend)
                                        delete self._data['import']
                                    }
                                } else {
                                    // Should we support a single string???
                                    // Covered by: Test-0002-0160
                                    //self.debug('(%s) Import section contains invalid data type (%s), breaking...', self.legend, typeof importCommands)
                                    return next(new Error('Invalid data type'))
                                }
                            } else {
                                //self.debug('(%s) Import section not found', self.legend)
                                return next('ready')
                            }
                        }
                    } else {
                        // Covered by: Test-0002-0000
                        return next(new Error('Invalid data type (' + typeof res + ')'))
                    }
                }
            },
            function(err) {
                if (err) {
                    self._ready = true
                    if (err == 'ready') {
                        //self.debug('(%s) <++ Ready', self.legend)
                        unlock()
                        nextTick(function() {
                            //console.log('Data:', self._data)
                            callback(null, self._data)
                        })
                    } else {
                        //self.debug('(%s) <++ Failed: %s', self.legend, err)
                        nextTick(function() {
                            callback(err)
                        })
                    }
                }
            })
    })
}
DataHolder.prototype.readAsync = Promise.promisify(DataHolder.prototype.read)

DataHolder.prototype.access = function(callback) {
    return this.read(null, callback)
}
DataHolder.prototype.accessAsync = Promise.promisify(DataHolder.prototype.access)

var Redirect = function(name, domain) {
    this.name = name
    this.domain = domain
}

DataHolder.prototype.__findSingleDomain = function(session, name, callback) {
    var self = this
    //self.debug('(%s) ++> Searching for "%s"...', self.legend, name)
    self.read(session, function(err, data) {
        if (err) {
            return callback(err)
        }
        //self.debug('(%s) Checking for map...', self.legend)
        if (name === '') {
            if (self._data.hasOwnProperty('alias')) {
                var alias = self._data.alias
                //self.debug('(%s) Alias detected', self.legend)
                if (typeof alias === 'string') {
                    var npath, ndomain
                    if (alias === '') {
                        ndomain = self._path.split('.').slice(1).join('.')
                        //self.debug('(%s) 1/ Redirecting to "%s"', self.legend, ndomain)
                        return callback(null, new Redirect('', ndomain))
                    } else {
                        var apath = alias.split('.')
                        if (apath[apath.length - 1] == '@') {
                            npath = apath.length > 1 ? apath.slice(0, apath.length - 1).join('.') : ''
                            ndomain = self.domain()
                            //self.debug('(%s) 2/ Redirecting to "%s@%s"...', self.legend, npath, ndomain)
                            return callback(null, new Redirect(npath, ndomain))
                        } else
                        if (apath[apath.length - 1] === '') {
                            if (apath.length > 2) {
                                ndomain = apath.slice(0, [apath.length - 1]).join('.')
                                //self.debug('(%s) 3/ Redirecting to "%s@%s"...', self.legend, '', ndomain)
                                return session.visitAlias(ndomain, callback,
                                    function(ndomain, callback) {
                                        // async
                                        nextTick(function() {
                                            return self._provider.resolver._resolveOne(session, '', ndomain, self.debug, function(results) {
                                                if (results.error) {
                                                    //self.debug('(%s) Failed: %s', self.legend, results.error)
                                                    return callback(results.error)
                                                } else {
                                                    //self.debug('(%s) Got result, returning...', self.legend, results.data)
                                                    return callback(null, results.data)
                                                }
                                            })
                                        })
                                    })
                            } else {
                                return callback(new Error('Invalid alias: ' + alias))
                            }
                        } else {
                            ndomain = self._path.split('.').slice(1).join('.')
                            //self.debug('(%s) 4/ Redirecting to "%s@"...', self.legend, alias, ndomain)
                            return callback(null, new Redirect(alias, ndomain))
                        }
                    }
                } else {
                    return callback(new Error('Invalid alias type (' + typeof alias + ')'))
                }
            } else {
                //self.debug('(%s) <++ Returning self...', self.legend)
                return callback(null, self)
            }
        } else {
            var rcdata = _findOneInTheMap(data, name)
            if (rcdata) {
                //self.debug('(%s) <++ Found "%s" in the map, returning...', self.legend, name)
                if (rcdata instanceof DataHolder) {
                    return rcdata._findSingleDomain(session, '', callback)
                } else {
                    data.map[name] = new DataHolder(self._provider, name, name + '.' + self._path, rcdata, self.debug)
                    return data.map[name]._findSingleDomain(session, '', callback)
                }
            } else {
                // Covered by: Test-0002-0010
                //self.debug('(%s) <++ Reporting "%s" not found...', self.legend, name, data)
                return callback(new Error('Failed to find "' + name + '"'))
            }
        }
    })
}

DataHolder.prototype._checkRedirect = function(session, err, res, callback) {
    var self = this
    if (err) {
        return callback(err)
    }
    if (res instanceof Redirect) {
        //self.debug('(%s) Redirected to "%s@%s"...', self.legend, res.name, res.domain)
        if (res.domain == self._path) {
            //self.debug('(%s) Need to find "%s"...', self.legend, res.name)
            return self.find(session, res.name, callback)
        } else {
            //self.debug('(%s) Forwarding redirect...', self.legend)
            callback(null, res)
        }
    } else {
        //self.debug('(%s) Result received, returning...', self.legend)
        return callback(null, res)
    }
}

DataHolder.prototype._findSingleDomain = function(session, name, callback) {
    var self = this
    //self.debug('(%s) Find single domain: %s', self.legend, name)
    return self.__findSingleDomain(session, name, function(err, res) {
        return self._checkRedirect(session, err, res, function(err, res) {
            callback(err, res)
        })
    })
}

DataHolder.prototype.find = function(session, name, callback) {
    var self = this

    //self.debug('(%s) [Find] Searching for "%s"...', self.legend, name)

    var names = name.split('.')
    if (names.length > 0) {
        if (names.length == 1) {
            return self._findSingleDomain(session, name, function(err, res) {
                //self.debug('(%s) 1/ Returned: %s, %s', self.legend, err, util.inspect(res))
                callback(err, res)
            })
        } else {
            var memo = self
            async.reduceRight(names, memo,
                function(memo, name, callback) {
                    memo._findSingleDomain(session, name, function(err, res) {
                        //self.debug('(%s) 2/ Returned: %s, %s', self.legend, err, util.inspect(res))
                        callback(err, res)
                    })
                },
                function(err, res) {
                    //self.debug('(%s) 3/ Returned: %s, %s', self.legend, err, util.inspect(res))
                    return self._checkRedirect(session, err, res, callback)
                })
        }
    } else {
        return self._findSingleDomain(session, '', function(err, res) {
            //self.debug('(%s) 4/ Returned: %s, %s', self.legend, err, util.inspect(res))
            callback(err, res)
        })
    }
}
DataHolder.prototype.findAsync = Promise.promisify(DataHolder.prototype.find)

/* Module
============================================================================= */

var Provider = function(opts) {
    var self = this

    opts = opts || {}

    self.debug = opts.debug || debug
    
    self.resolver = opts.resolver || global.nmcpp
    self.gtld = opts.gtld || opts.tld || 'bit'
    self.transform = opts.transform || function(name) {
        return name
    }

    self.resolver.providers[self.gtld] = self

    self.init.apply(self, arguments)
}

Provider.extend = extend

Provider.prototype.ttl = function() {
    return 300
}

Provider.prototype.init = function() {}

Provider.prototype.load = function(name, callback) {
    callback(new Error('Not found'))
}

Provider.prototype.normalize = function(name, type) {
    name = name || ''
    var names = name.split('/')
    if ((names.length > 2) || (names[0] === '')) {
        throw new Error('Invalid name "' + name + '"')
    }
    names = (names.length == 1) ? [(type || 'd'), names[0]]: names
    return names[0] + '/' + punycode.toASCII(this.transform(names[1]))
}

Provider.prototype.loadData = function(name, path, callback, debug) {
    var self = this
    
    debug = debug || self.debug
    try {
        var cname = self.normalize(name)
        var hash = cname + '@' + path
        //self.debug('Provider/ Loading data for "%s"...', cname)
        return self.load(cname, function(err, res, ttl) {
            if (err) {
                return callback(err)
            } else {
                var data = new DataHolder(self, cname, path, res, debug)
                return callback(null, data, ttl)
            }
        })
    } catch (exc) {
        console.log(exc.stack)
        return callback(exc)
    }
}

/* Session
============================================================================= */

var Session = function(resolver) {
    this.resolver = resolver
    this.aliases = {}
}

Session.prototype.visitAlias = function(name, callback, fn) {
    if (this.aliases.hasOwnProperty(name)) {
        return callback(new Error('Circular alias detected (' + name + ')'))
    } else {
        this.aliases[name] = true
        return fn(name, callback)
    }
}

/* Resolver
============================================================================= */

var Resolver = function(opts) {
    var self = this
    
    opts = opts || {}
    
    this.debug = opts.debug || debug
    
    this.providers = opts.providers || {}
    this.dns = opts.dns || {}

    self.init.apply(self, arguments)
}

Resolver.extend = extend

Resolver.prototype.init = function() {
    // Nothing to do here    
}

Resolver.prototype._resolveOne = function(session, record, domain, resolveDebug, callback) {
    var self = this

    record = record || ''
    resolveDebug = resolveDebug || self.debug

    var err

    var names = record.split('#')
    var rcname = names[0]
    var rcpath = []
    if (names.length > 1) {
        rcpath = rcpath.concat(names[1].split('.'))
    }
    if (domain) {
        rcpath = rcpath.concat(domain.split('.'))
    }
    //resolveDebug('Need to resolve "%s" at "%s"', rcname, rcpath.join('.'))
    if (rcpath.length > 1) {
        var pgtld = rcpath[rcpath.length - 1]
        var pname = rcpath[rcpath.length - 2]
        var ppath = rcpath.slice(0, rcpath.length - 2)
        //resolveDebug('-- Path: "%s", Name: "%s", TLD: "%s"', ppath, pname, pgtld)
        if (self.providers.hasOwnProperty(pgtld)) {
            //resolveDebug('Provider for gTDL "%s" found', pgtld)
            var provider = self.providers[pgtld]
            //resolveDebug('Loading "%s"...', pname)
            provider.loadData(pname, pname + '.' + pgtld, function(err, res) {
                if (err) {
                    //resolveDebug('Data loading failed: %s', err)
                    return callback({
                        error: err
                    })
                }
                //resolveDebug('Searching for the domain "%s"...', ppath.join('.'))
                res.find(session, ppath.join('.'), function(err, res) {
                    if (err) {
                        //resolveDebug('Search failed: %s', err)
                        return callback({
                            error: err
                        })
                    }
                    //resolveDebug('Received: %s', util.inspect(res))
                    if (rcname) {
                        //resolveDebug('Searching for the record "%s"...', rcname)
                        res.lookup(rcname, function(name, value) {
                            if (name) {
                                //resolveDebug('Partially found: %s', util.inspect(value))
                                return callback({
                                    error: new Error('Partially found "' + rcname + '" (missing: ' + name + ')')
                                })
                            } else {
                                //resolveDebug('Found: %s', util.inspect(value))
                                //resolveDebug('Visited: %s', util.inspect(session.visited))
                                return callback({
                                    ttl: provider.ttl(),
                                    data: value,
                                    name: res._path
                                })
                            }
                        })
                    } else {
                        res.read(session, function(err, data) {
                            if (err) {
                                return callback({
                                    error: err
                                })
                            }
                            return callback({
                                ttl: provider.ttl(),
                                data: res,
                                name: res._path
                            })
                        })
                    }
                })
            }, self.debug)
        } else {
            err = new Error('Unknown gTLD: "' + pgtld + '"')
        }
    } else {
        err = new Error('Invalid domain specified: "' + rcpath.join('.') + '" (' + typeof domain + ')')
    }

    if (err) {
        //resolveDebug('Failed: %s', err)
        callback({
            error: err
        })
    }
}

Resolver.prototype.resolve = function(record, opts, callback) {
    var self = this

    if ((typeof callback === 'undefined') && (_.isFunction(opts))) {
        callback = opts
        opts = undefined
    }

    opts = opts || {}

    var domain = opts.domain || ""
    var resolveDebug = opts.debug || self.debug

    if (Array.isArray(record)) {
        async.map(record,
            function(record, callback) {
                //resolveDebug('Processing %s@%s...', record, domain)
                var session = new Session(self)
                self._resolveOne(session, record, domain, resolveDebug,
                    function(result) {
                        callback(null, result)
                    })
            },
            function(err, result) {
                return callback(err, result)
            })
    } else {
        var session = new Session(self)
        self._resolveOne(session, record, domain, resolveDebug,
            function(result) {
                callback(result.error, result)
            })
    }

    return self
}
Resolver.prototype.resolveAsync = Promise.promisify(Resolver.prototype.resolve)

/* TestProvider
============================================================================= */

var TestProvider = Provider.extend({
    init: function(opts, data) {
        Provider.prototype.init.call(this, opts)
        opts = opts || {}
        this.debug = opts.debug || debug
        this.data = data || opts.data || {}
    },
    load: function(name, callback) {
        var self = this
        //self.debug('Loading "%s"...', name)
        if (self) {
            //self.debug('Returning data...')
            callback(null, _.clone(self.data[name]))
        } else {
            //self.debug('Returning not found...')
            return callback(new Error('Not found'))
        }
    }
})

/* Module
============================================================================= */

var Module = Resolver.extend({
    init: function(opts) {
        this.nextTick = nextTick
        
        this.parseJSON = parseJson
        this.parseJson = parseJson
        this.parseJsonAsync = parseJsonAsync
        this.parseNameData = parseNameData
        this.parseNameDataAsync = parseNameDataAsync
    
        this.DataHolder = DataHolder
        this.Session = Session
        this.Provider = Provider
        this.Resolver = Resolver
        
        this.TestProvider = TestProvider
    }
})

/* Exports
============================================================================= */

global.nmcpp = new Module()

module.exports = global.nmcpp
