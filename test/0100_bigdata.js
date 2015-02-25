/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var debug = require('debug')('nmcpp:test-0100')

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("lodash")
var nmcpp = require('../lib/index.js')

/* Data
============================================================================= */

var DelegatesProvider = nmcpp.Provider.extend({
    init: function(opts) {
        var max = opts.count
        
        this.debug('Creating testdata with %s delegates', max)

        this.names = {}
        this.names['d/name-0'] = {
            "map": {
                "ftp": {
                    "ip": "127.0.0.1"
                }
            }
        }
        for (var idx = 1; idx <= max; idx++) {
            this.names['d/name-' + idx.toString()] = {
                "map": {
                    "ftp": ['d/name-' + (idx - 1).toString(), "ftp"]
                }
            }
        }

        this.names['d/bigdata'] = {
            "map": {
                "ftp": ['d/name-' + max.toString(), "ftp"]
            }
        }

    },
    load: function(name, callback) {
        //console.log('Loading', name)
        if (this.names.hasOwnProperty(name)) {
            callback(null, _.clone(this.names[name]))
        } else {
            return callback(new Error('Not found'))
        }
    }
})

var ImportsProvider = nmcpp.Provider.extend({
    init: function(opts) {
        var max = opts.count
        
        var fn = opts.fn || function(value) {
            return [value]
        }

        this.debug('Creating testdata with %s delegates', max)

        this.names = {}
        this.names['d/name-0'] = {
            "text": fn("0")
        }
        for (var idx = 1; idx <= max; idx++) {
            this.names['d/name-' + idx.toString()] = {
                "text": fn(idx.toString()),
                "import": [
                    ['d/name-' + (idx - 1).toString()]
                ]
            }
        }

        this.names['d/bigdata'] = {
            "text": fn("bigdata"),
            "import": [
                ['d/name-' + max.toString()]
            ]
        }

    },
    load: function(name, callback) {
        //console.log('Loading', name)
        if (this.names.hasOwnProperty(name)) {
            callback(null, _.clone(this.names[name]))
        } else {
            return callback(new Error('Not found'))
        }
    }
})

/* Tests
============================================================================= */

describe('[0100] Bigdata', function() {
    beforeEach(function(done) {
        nmcpp.cleanup()
        done()
    });

    it('[0000] 1k delegates', function(done) {
        this.timeout(60 * 500)
        try {
            var debug = require('debug')('nmcpp:test-0100-0000')

            new DelegatesProvider({
                debug: debug,
                count: 1000
            })

            nmcpp.resolve("ip#ftp", {
                domain: 'bigdata.bit',
                debug: debug
            }, function(err, res) {
                if (err) { return done(err) }

                res.should.be.instanceof(Object)
                res.should.have.property('data', '127.0.0.1')
                res.should.have.property('name', 'ftp.bigdata.bit')

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0020] 5k delegates', function(done) {
        this.timeout(60 * 1000)
        try {
            var debug = require('debug')('nmcpp:test-0100-0020')

            new DelegatesProvider({
                debug: debug,
                count: 5000
            })

            nmcpp.resolve("ip#ftp", {
                domain: 'bigdata.bit',
                debug: debug
            }, function(err, res) {
                if (err) { return done(err) }

                res.should.be.instanceof(Object)
                res.should.have.property('data', '127.0.0.1')
                res.should.have.property('name', 'ftp.bigdata.bit')

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0040] 1k imports', function(done) {
        this.timeout(60 * 500)
        try {
            var debug = require('debug')('nmcpp:test-0100-0040')

            new ImportsProvider({
                debug: debug,
                count: 1000,
                fn: function(value) {
                    return value
                }
            })

            nmcpp.resolve("text", {
                domain: 'bigdata.bit',
                debug: debug
            }, function(err, res) {
                if (err) { return done(err) }
                
                res.should.be.instanceof(Object)

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0060] 5k imports', function(done) {
        this.timeout(60 * 500)
        try {
            var debug = require('debug')('nmcpp:test-0100-0060')

            new ImportsProvider({
                debug: debug,
                count: 5000,
                fn: function(value) {
                    return value
                }
            })

            nmcpp.resolve("text", {
                domain: 'bigdata.bit',
                debug: debug
            }, function(err, res) {
                if (err) { return done(err) }

                res.should.be.instanceof(Object)

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })
})