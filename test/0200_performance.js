/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var debug = require('debug')('nmcpp:test-0003')

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("underscore")
var async = require('async')
var nmcpp = require('../lib/index.js')

var Namecoin = nmcpp.Provider.extend({
    init: function(debug, data) {
        this.debug = debug
        this.data = data
    },
    load: function(name, callback) {
        if (this.data.hasOwnProperty(name)) {
            callback(null, _.clone(this.data[name]))
        } else {
            return callback(new Error('Not found'))
        }
    }
})

/* Consts
============================================================================= */

var defaultTimeout = 2 * 60 * 1000

/* Tests
============================================================================= */

describe('[0200] Performance', function() {

    it('[0000] Empty async loop // 100k', function(done) {
        this.timeout(defaultTimeout)

        var count = 100 * 1000
        async.whilst(
            function() {
                return count > 0
            },
            function(callback) {
                nmcpp.nextTick(function() {
                    count--;
                    callback()
                })
            },
            function(err) {
                return done(err)
            }
        )
    })

    it('[0020] find(["ip"], "domain.bit", done) // 10k', function(done) {
        this.timeout(defaultTimeout)

        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0200-0020'), {
            "d/domain": {
                "ip": "8.8.8.8",
                "map": {
                    "*": {
                        "alias": ""
                    }
                }
            }
        })

        var count = 10 * 1000
        async.whilst(
            function() {
                return count > 0
            },
            function(callback) {
                nmcpp.resolve("ip", {
                    domain: 'domain.bit',
                    debug: bit.debug
                }, function(err, res) {
                    if (err) { return callback(err) }
                    count--;
                    callback()
                })
            },
            function(err) {
                return done(err)
            }
        )
    })

    it('[0040] find(["ip"], "www.eu.domain.bit", done) // 10k', function(done) {
        this.timeout(defaultTimeout)

        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0200-0020'), {
            "d/domain": {
                "ip": "8.8.8.8",
                "map": {
                    "us": {
                        "ip": "1.2.3.4",
                        "map": {
                            "www": {
                                "alias": ""
                            }
                        }
                    },
                    "eu": {
                        "ip": "5.6.7.8",
                        "map": {
                            "www": {
                                "alias": "us.@"
                            }
                        }
                    },
                    "*": {
                        "alias": ""
                    }
                }
            }
        })

        var count = 10 * 1000
        async.whilst(
            function() {
                return count > 0
            },
            function(callback) {
                nmcpp.resolve("ip", {
                    domain: 'www.eu.domain.bit',
                    debug: bit.debug
                }, function(err, res) {
                    if (err) { return callback(err) }
                    count--;
                    callback()
                })
            },
            function(err) {
                return done(err)
            }
        )
    })
})