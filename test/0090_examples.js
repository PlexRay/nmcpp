/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("lodash")
var async = require('async')

var nmcpp = require('../lib/index.js')

/* Tests
============================================================================= */

describe('[0090] Examples', function() {
    beforeEach(function(done) {
        nmcpp.cleanup()
        done()
    });

    it('[0000] Simple resolving', function(done) {
        var debug = require('debug')('nmcpp:test-0090-0000')

        var bit = new nmcpp.TestProvider({
            debug: debug,
            gtld: 'bit'
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "ip": "1.2.3.4"
                    }
                }
            }
        })

        nmcpp.resolve('ip#www.domain.bit', function(err, res) {
            if (err) { return done(err) }
            
            res.data.should.be.equal('1.2.3.4')

            done()
        })
    })
    
    it('[0020] Simple resolving with custom options', function(done) {
        var debug = require('debug')('nmcpp:test-0090-0020')
        
        var bit = new nmcpp.TestProvider({
            debug: debug,
            gtld: 'bit'
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "ip": "1.2.3.4"
                    }
                }
            }
        })

        nmcpp.resolve('ip', {
            domain: "www.domain.bit",
            debug: debug
        }, function(err, res) {
            if (err) { return done(err) }
            
            res.data.should.be.equal('1.2.3.4')

            done()
        })
    })
    
    it('[0040] Resolve a domain + access data directly', function(done) {
        var debug = require('debug')('nmcpp:test-0090-0040')

        var bit = new nmcpp.TestProvider({
            debug: debug,
            gtld: 'bit'
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "email": "alice@example.com"
                    }
                }
            }
        })

        nmcpp.resolve('', {
            domain: "www.domain.bit",
            debug: debug
        }, function(err, res) {
            if (err) { return done(err) }

            res.data.access(function(err, res) {
                if (err) { return done(err) }

                res.should.containEql({
                    "email": "alice@example.com"
                })

                done()
            })
        })
    })
    
    it('[0060] Resolve a domain + lookup several records', function(done) {
        var debug = require('debug')('nmcpp:test-0090-0060')

        var bit = new nmcpp.TestProvider({
            debug: debug,
            gtld: 'bit'
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "email": "alice@example.com",
                        "gpg": {
                            "fpr": "78F11E68E8415BE8F74AAF2F9EE84CF88C6D1D6B"
                        }
                    }
                }
            }
        })

        nmcpp.resolve('', {
            domain: 'www.domain.bit',
            debug: debug
        }, function(err, res) {
            if (err) { return done(err) }
            
            res.data.should.be.instanceof(nmcpp.DataHolder)

            async.map(['email', 'fpr.gpg'], 
                function(item, callback) {
                    res.data.lookup(item, callback)
                },
                function(err, results) {
                    if (err) { return done(err) }
                    
                    results[0].should.be.equal('alice@example.com')
                    results[1].should.be.equal('78F11E68E8415BE8F74AAF2F9EE84CF88C6D1D6B')
                    
                    done()
                })
        })
    })
})