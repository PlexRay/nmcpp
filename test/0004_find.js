/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

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
            this.debug('Returning data...')
            callback(null, _.clone(this.data[name]))
        } else {
            this.debug('Returning not found...')
            return callback(new Error('Not found'))
        }
    }
})

/* Tests
============================================================================= */

describe('[0004] Find', function() {

    it('[0000] find("nonexistent", "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0000'), {
            "d/domain": {
                "ip": "127.0.0.1"
            }
        })

        nmcpp.resolve(["nonexistent"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {

            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].error.should.be.instanceof(Error)

            done()
        })
    })

    it('[0020] find("ip", "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0020'), {
            "d/domain": {
                "ip": "127.0.0.1"
            }
        })

        nmcpp.resolve(["ip"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')

            done()
        })
    })

    it('[0040] find(["ip", "ip6"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0040'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "ip6": "::1",
            }
        })

        nmcpp.resolve(["ip", "ip6"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0060'), {
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
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0080'), {
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
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0100'), {
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
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0120'), {
            "d/domain": {
                "gpg": {
                    "fpr": "78F11E68E8415BE8F74AAF2F9EE84CF88C6D1D6B"
                }
            }
        })

        nmcpp.resolve(["fpr.gpg"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0140'), {
            "d/domain": {
                "email": "alice@example.com"
            }
        })

        nmcpp.resolve([""], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
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
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0004-0160'), {
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
            debug: bit.debug
        }, function(results) {
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