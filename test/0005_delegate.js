/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var debug = require('debug')('nmcpp:test-0004')

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("underscore")
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

/* Tests
============================================================================= */

describe('[0005] Delegation', function() {

    it('[0000] find(["ip#ftp"], "foo", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0000'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "ftp": ['s/bar']
                }
            },
            "s/bar": {
                "ip": "127.0.0.2"
            }
        })

        nmcpp.resolve(["ip#ftp"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.2')
            results[0].should.have.property('name', 'ftp.domain.bit')

            done()
        })
    })

    it('[0020] find(["ip#ftp"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0020'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "ftp": ['s/bar', 'baz']
                }
            },
            "s/bar": {
                "ip": "127.0.0.2",
                "map": {
                    "baz": {
                        "ip": "127.0.0.3"
                    }
                }
            }
        })

        nmcpp.resolve(["ip#ftp"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.3')
            results[0].should.have.property('name', 'ftp.domain.bit')

            done()
        })
    })

    it('[0040] find(["ip.v4#ftp"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0040'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "ftp": ['s/bar', 'baz']
                }
            },
            "s/bar": {
                "ip": "127.0.0.2",
                "map": {
                    "baz": {
                        "v4": {
                            "ip": "127.0.0.3"
                        }
                    }
                }
            }
        })

        nmcpp.resolve(["ip.v4#ftp"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.3')
            results[0].should.have.property('name', 'ftp.domain.bit')

            done()
        })
    })

    it('[0060] find(["ip6.v6#ftp"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0060'), {
            "d/domain": {
                "map": {
                    "ftp": ['s/foo', 'bar']
                }
            },
            "s/foo": {
                "map": {
                    "bar": ['s/baz', 'qwe']
                }
            },
            "s/baz": {
                "map": {
                    "qwe": {
                        "v6": {
                            "ip6": "::1"
                        }
                    }
                }
            }
        })

        nmcpp.resolve(["ip6.v6#ftp"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(1)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '::1')
            results[0].should.have.property('name', 'ftp.domain.bit')

            done()
        })
    })

    it('[0080] find(["ip", "ip#ftp", "ip6#ftp"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0080'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "ftp": ['s/ftp']
                }
            },
            "s/ftp": {
                "ip": "127.0.0.2"
            }
        })

        nmcpp.resolve(["ip", "ip#ftp"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(2)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'domain.bit')

            results[1].should.be.instanceof(Object)
            results[1].should.have.property('data', '127.0.0.2')
            results[1].should.have.property('name', 'ftp.domain.bit')

            done()
        })
    })

    it('[0100] find(["ip", "ip#www", "ip6#www"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0100'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "www": ['s/bar', 'www']
                }
            },
            "s/bar": {
                "map": {
                    "www": {
                        "ip": "127.0.0.3"
                    }
                }
            }
        })

        nmcpp.resolve(["ip", "ip#www"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(2)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'domain.bit')

            results[1].should.be.instanceof(Object)
            results[1].should.have.property('data', '127.0.0.3')
            results[1].should.have.property('name', 'www.domain.bit')

            done()
        })
    })

    it('[0120] find(["ip", "ip#ftp", "ip#www"], "domain.bit", done)', function(done) {
        var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0005-0120'), {
            "d/domain": {
                "ip": "127.0.0.1",
                "map": {
                    "ftp": ['s/ftp'],
                    "www": ['s/www', 'www']
                }
            },
            "s/ftp": {
                "ip": "127.0.0.2",
                "ip6": "::2"
            },
            "s/www": {
                "map": {
                    "www": {
                        "ip": "127.0.0.3",
                        "ip6": "::3"
                    }
                }
            }
        })

        nmcpp.resolve(["ip", "ip#ftp", "ip#www"], {
            domain: "domain.bit",
            debug: bit.debug
        }, function(results) {
            results
                .should.be.instanceof(Array).and
                .have.lengthOf(3)

            results[0].should.be.instanceof(Object)
            results[0].should.have.property('data', '127.0.0.1')
            results[0].should.have.property('name', 'domain.bit')

            results[1].should.be.instanceof(Object)
            results[1].should.have.property('data', '127.0.0.2')
            results[1].should.have.property('name', 'ftp.domain.bit')

            results[2].should.be.instanceof(Object)
            results[2].should.have.property('data', '127.0.0.3')
            results[2].should.have.property('name', 'www.domain.bit')

            done()
        })
    })
})