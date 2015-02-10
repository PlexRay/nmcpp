/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var debug = require('debug')('nmcpp:test-0003')

var test = global.unitjs || require('unit.js'),
    should = test.should

var nmcpp = require('../lib/index.js')

/* Tests
============================================================================= */

describe('[0002] Provider', function() {

    it('[0000] extendable', function(done) {
        var MyProvider = nmcpp.Provider.extend({})

        var bit = new MyProvider({
            debug: debug
        })

        bit
            .should.be.an.instanceof(nmcpp.Provider)

        done()
    })

    it('[0020] init() receives arguments', function(done) {
        var debug = require('debug')('nmcpp:test-0002-0020')
        
        var MyProvider = nmcpp.Provider.extend({
            init: function(opts, data) {
                this.data = data
            }
        })

        var bit = new MyProvider({
            debug: debug
        }, {
            'd/domain': {
                ip: '1.2.3.4'
            }
        })

        bit.data
            .should.be.an.instanceof(Object)
        bit.data
            .should.have.property('d/domain')

        done()
    })

    it('[0040] loadData() works', function(done) {
        var debug = require('debug')('nmcpp:test-0002-0030')
        
        var MyProvider = nmcpp.Provider.extend({
            load: function(name, callback) {
                callback(null, 'RESERVED')
            }
        })

        var bit = new MyProvider({
            debug: debug
        })
        
        bit.loadData('d/domain', 'bit', function(err, res) {
            if (err) {
                return done(err)
            }

            res.should.be.an.instanceof(nmcpp.DataHolder)

            done()
        }, bit.debug)
    })
})