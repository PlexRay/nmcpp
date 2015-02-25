/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("lodash")
var async = require('async')
var punycode = require('punycode')

var nmcpp = require('../lib/index.js')

/* Tests
============================================================================= */

describe('[0004] Find', function() {
    beforeEach(function(done) {
        nmcpp.cleanup()
        done()
    });

    it('[0000] find("nonexistent", "domain.bit", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0000')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "ip": "127.0.0.1"
            }
        })

        nmcpp.resolve(["nonexistent"], {
            domain: "domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }

            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].error.should.be.instanceof(Error)

            done()
        })
    })

    it('[0020] find("ip", "domain.bit", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0020')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "ip": "127.0.0.1"
            }
        })

        nmcpp.resolve(["ip"], {
            domain: "domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')

            done()
        })
    })

    it('[0040] find(["ip", "ip6"], "domain.bit", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0040')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "ip": "127.0.0.1",
                "ip6": "::1",
            }
        })

        nmcpp.resolve(["ip", "ip6"], {
            domain: "domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(2)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')

            results[1].should.be.instanceof(Object)
            results[1].should.have.property('data', '::1')

            done()
        })
    })

    it('[0060] find("ip", "www.domain", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0060')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "ip": "127.0.0.1"
                    }
                }
            }
        })

        nmcpp.resolve(["ip"], {
            domain: "www.domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'www.domain.bit')

            done()
        })
    })

    it('[0080] find("ip", "www.dev.domain", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0080')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "map": {
                    "dev": {
                        "map": {
                            "": {
                                "ip": "127.0.0.1"
                            }
                        }
                    }
                }
            }
        })

        nmcpp.resolve(["ip"], {
            domain: "www.dev.domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'www.dev.domain.bit')

            done()
        })
    })

    it('[0100] find(["ip#www", "ip6#ftp"], "dev.domain", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0100')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "map": {
                    "dev": {
                        "map": {
                            "www": {
                                "ip": "127.0.0.1",
                                "ip6": "dummy"
                            },
                            "ftp": {
                                "ip": "dummy",
                                "ip6": "::1"
                            }
                        }
                    }
                }
            }
        })

        nmcpp.resolve(["ip#www", "ip6#ftp"], {
            domain: "dev.domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(2)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'www.dev.domain.bit')

            results[1].should.be.instanceof(Object)
            results[1].should.have.property('data', '::1')
            results[1].should.have.property('name', 'ftp.dev.domain.bit')

            done()
        })
    })

    it('[0120] find("gpg.fpr", "domain.bit", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0120')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "gpg": {
                    "fpr": "78F11E68E8415BE8F74AAF2F9EE84CF88C6D1D6B"
                }
            }
        })

        nmcpp.resolve(["fpr.gpg"], {
            domain: "domain.bit",
            debug: debug
        }, function(err, results) {
            
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '78F11E68E8415BE8F74AAF2F9EE84CF88C6D1D6B')
            results[0].should.have.property('name', 'domain.bit')

            done()
        })
    })

    it('[0140] find("", "domain.bit", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0140')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "email": "alice@example.com"
            }
        })

        nmcpp.resolve([""], {
            domain: "domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].data.access(function(err, res) {
                if (err) {
                    return done(err)
                }

                res.should.containEql({
                    "email": "alice@example.com"
                })

                done()
            })
        })
    })

    it('[0160] find("", "www.domain", done)', function(done) {
        var debug = require('debug')('nmcpp:test-0004-0160')
        var provider = new nmcpp.TestProvider({
            debug: debug
        }, {
            "d/domain": {
                "map": {
                    "www": {
                        "email": "alice@example.com"
                    }
                }
            }
        })

        nmcpp.resolve([""], {
            domain: "www.domain.bit",
            debug: debug
        }, function(err, results) {
            if (err) { return done(err) }
            
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].data.access(function(err, res) {
                if (err) {
                    return done(err)
                }

                res.should.containEql({
                    "email": "alice@example.com"
                })

                done()
            })
        })
    })
})