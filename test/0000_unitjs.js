/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var test = global.unitjs || require('unit.js'),
    should = test.should

/* Memwatch
============================================================================= */

/*
var memwatch = require('memwatch')
memwatch.on('leak', function(info) {
    console.log('Leak:', info)
})
*/

/* Tests
============================================================================= */

describe('[0000] Unit.js', function() {

    it('[0000] is sane', function(done) {

        test
            .value(2 + 2)
            .isEqualTo(4);

        (2 + 2).should.not.be.above(4).and.not.below(4);

        should(1 / 0).be.Infinity;

        (function() {
            arguments.should.be.empty;
        })();

        done()
    })
})