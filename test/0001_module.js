/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var test = global.unitjs || require('unit.js'),
    should = test.should

/* Tests
============================================================================= */

describe('[0001] Module', function() {

    it('[0000] available', function(done) {

        var nmcpp = require('../lib/index.js')

        nmcpp
            .should.be.an.instanceOf(Object)

        done()
    })
})