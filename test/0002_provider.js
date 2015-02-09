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
        var Namecoin = nmcpp.Provider.extend({})

        var bit = new Namecoin(nmcpp, 'bit')

        bit
            .should.be.an.instanceof(nmcpp.Provider)

        done()
    })

    it('[0020] init() receives arguments', function(done) {
        var Namecoin = nmcpp.Provider.extend({
            init: function(debug, data) {
                this.debug = debug
                this.data = data
            }
        })

        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0002-0020'), {
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
        var Namecoin = nmcpp.Provider.extend({
            init: function(debug, data) {
                this.debug = debug
                this.data = data
            },
            load: function(name, callback) {
                if (this.data.hasOwnProperty(name)) {
                    callback(null, this.data[name])
                } else {
                    return callback(new Error('Not found'))
                }
            }
        })

        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0002-0030'), {
            'd/domain': {
                ip: '1.2.3.4'
            }
        })

        bit.loadData('d/domain', 'bit', function(err, res) {
            if (err) {
                return done(err)
            }

            res.should.be.an.instanceof(Object)

            done()
        }, bit.debug)
    })
})