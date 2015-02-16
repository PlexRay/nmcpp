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

describe('[0007] i18n', function() {

    it('[0000] is supported', function(done) {
        var debug = require('debug')('nmcpp:test-0007-0000')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/xn--cjrr4g710f": {
                "ip": "127.0.0.1"
            }
        })

        nmcpp.resolve(["ip"], {
            domain: "国際化.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }

            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', '国際化.bit')
            
            done()
        })
    })
})