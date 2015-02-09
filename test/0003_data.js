/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var test = global.unitjs || require('unit.js'),
    should = test.should

var _ = require("underscore")
var nmcpp = require('../lib/index.js')
var resolver = new nmcpp.Resolver()

/* Tests
============================================================================= */

var TestProvider = nmcpp.Provider.extend({
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

var prov = new TestProvider(nmcpp, 'prov')

/* Tests
============================================================================= */

describe('[0003] Data', function() {

    it('[0000] Invalid data type or non-json data', function(done) {
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit',
            "Hello",
            require('debug')('nmcpp:test-0003-0000'))

        data.lookup("nonexistent", function(err, result) {
            err
                .should.be.type('string')
            err
                .should.equal('nonexistent')

            done()
        })
    })

    it('[0010] lookup("nonexistent")', function(done) {
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            ip: '1.2.3.4'
        }, require('debug')('nmcpp:test-0003-0010'))

        data.lookup("nonexistent", function(err, result) {
            err
                .should.be.type('string')
            err
                .should.equal('nonexistent')

            done()
        })
    })

    it('[0020] lookup("ip.nonexistent.foo")', function(done) {
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            foo: {
                bar: {
                    ip: '1.2.3.4'
                }
            }
        }, require('debug')('nmcpp:test-0003-0020'))

        data.lookup("ip.nonexistent.foo", function(err, result) {
            err
                .should.be.type('string')
            err
                .should.equal('ip.nonexistent')

            done()
        })
    })

    it('[0040] lookup("ip")', function(done) {
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            ip: '1.2.3.4'
        }, require('debug')('nmcpp:test-0003-0040'))

        data.lookup("ip", function(err, result) {
            if (err) {
                return done(new Error('Still have "' + err + '"'))
            }

            result
                .should.be.type('string')
            result
                .should.equal('1.2.3.4')

            done()
        })
    })

    it('[0060] lookup("ip.my")', function(done) {
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            my: {
                ip: '1.2.3.4'
            }
        }, require('debug')('nmcpp:test-0003-0060'))

        data.lookup("ip.my", function(err, result) {
            if (err) {
                return done(new Error('Still have "' + err + '"'))
            }

            result
                .should.be.type('string')
            result
                .should.equal('1.2.3.4')

            done()
        })
    })

    it('[0070] Empty list in delegation', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0070')
        var prov = new TestProvider(resolver, 'bit', debug, {})
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (!err) {
                return done(new Error('Must fail'))
            }

            done()
        })
    })

    it('[0071] Non-string first parameter in delegation', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0071')
        var prov = new TestProvider(resolver, 'bit', debug, {})
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            true
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (!err) {
                return done(new Error('Must fail'))
            }

            done()
        })
    })

    it('[0072] Non-string second parameter in delegation', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0072')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            's/foo', true
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (!err) {
                return done(new Error('Must fail'))
            }

            done()
        })
    })

    it('[0080] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0080')
        var prov = new TestProvider(resolver, 'bit', debug, {})
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            map: {
                www: {
                    ip: '1.2.3.4'
                }
            }
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0100] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0100')
        var prov = new TestProvider(resolver, 'bit', debug, {})
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            's/nonexistent'
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (!err) {
                return done(new Error('Must fail'))
            }

            done()
        })
    })

    it('[0120] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0120')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            's/foo'
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0140] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0140')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": ['s/bar'],
            "s/bar": ['s/baz'],
            "s/baz": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            's/foo'
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0160] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0160')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "delegate": ['s/foo']
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0180] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0180')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                "delegate": ['s/bar']
            },
            "s/bar": {
                "delegate": ['s/baz']
            },
            "s/baz": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "delegate": ['s/foo']
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0200] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0200')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                map: {
                    bar: {
                        map: {
                            www: {
                                ip: '1.2.3.4'
                            }
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "delegate": ['s/foo', 'bar']
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0220] find("www")', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0220')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                map: {
                    subdomain: {
                        map: {
                            bar: {
                                map: {
                                    www: {
                                        ip: '1.2.3.4'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "delegate": ['s/foo', 'bar.subdomain']
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0300] Invalid import parameter', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0300')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {
                "import": 42
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', [
            's/foo'
        ], debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (!err) {
                return done(new Error('Must fail'))
            }

            done()
        })
    })

    it('[0320] Simple import', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0320')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/bar": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/bar"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0340] Delegation in imported data', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0340')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/bar": {
                "delegate": ["s/baz"]
            },
            "s/baz": {
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/bar"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip', '1.2.3.4')

            done()
        })
    })

    it('[0360] Import to a "null" record', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0360')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {},
            "s/bar": {
                map: {
                    www: {
                        r1: null,
                        r2: null,
                        r3: null,
                        r4: null,
                        r5: null
                    }
                }
            },
            "s/baz": {
                map: {
                    www: {
                        r0: null,
                        r1: null,
                        r2: 42,
                        r3: 'hello',
                        r4: [1, 2, 3],
                        r5: {
                            msg: 'hello'
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/foo"],
                ["s/bar"],
                ["s/baz"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            //test.dump(result._data)

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('r0', null)
            result._data
                .should.have.property('r1', null)
            result._data
                .should.have.property('r2', 42)
            result._data
                .should.have.property('r3', 'hello')

            done()
        })
    })

    it('[0380] Import to a "string" record', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0380')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {},
            "s/bar": {
                map: {
                    www: {
                        r1: 'hello',
                        r2: 'hello',
                        r3: 'hello',
                        r4: 'hello',
                        r5: 'hello'
                    }
                }
            },
            "s/baz": {
                map: {
                    www: {
                        r1: null,
                        r2: 42,
                        r3: 'bye',
                        r4: [1, 2, 3],
                        r5: {
                            msg: 'bye'
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/foo"],
                ["s/bar"],
                ["s/baz"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            //test.dump(result._data)

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)

            done()
        })
    })

    it('[0400] Import to an "array" record', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0400')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {},
            "s/bar": {
                map: {
                    www: {
                        r1: ['hello'],
                        r2: ['hello'],
                        r3: ['hello'],
                        r4: ['hello'],
                        r5: ['hello']
                    }
                }
            },
            "s/baz": {
                map: {
                    www: {
                        r1: null,
                        r2: 42,
                        r3: 'bye',
                        r4: [1, 2, 3],
                        r5: {
                            msg: 'bye'
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/foo"],
                ["s/bar"],
                ["s/baz"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            //test.dump(result._data)

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)

            done()
        })
    })

    it('[0420] Import to an "object" record', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0420')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/foo": {},
            "s/bar": {
                map: {
                    www: {
                        r1: {
                            msg: 'hello'
                        },
                        r2: {
                            msg: 'hello'
                        },
                        r3: {
                            msg: 'hello'
                        },
                        r4: {
                            msg: 'hello'
                        },
                        r5: {
                            msg: 'hello'
                        }
                    }
                }
            },
            "s/baz": {
                map: {
                    www: {
                        r1: null,
                        r2: 42,
                        r3: 'bye',
                        r4: [1, 2, 3],
                        r5: {
                            msg: 'bye'
                        }
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/foo"],
                ["s/bar"],
                ["s/baz"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            //test.dump(result._data)

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)

            done()
        })
    })

    it('[0440] Chain imports', function(done) {
        var debug = require('debug')('nmcpp:test-0003-0440')
        var prov = new TestProvider(resolver, 'bit', debug, {
            "s/bar": {
                "import": [
                    ["s/baz"]
                ],
                map: {
                    www: {
                        ip: '1.2.3.4'
                    }
                }
            },
            "s/baz": {
                map: {
                    www: {
                        ip: '5.6.7.8'
                    }
                }
            }
        })
        var data = new nmcpp.DataHolder(prov, 'd/domain', 'domain.bit', {
            "import": [
                ["s/bar"]
            ]
        }, debug)

        data.find(new nmcpp.Session(), "www", function(err, result) {
            if (err) {
                return done(err)
            }

            //test.dump(result._data)

            result
                .should.be.instanceof(nmcpp.DataHolder)
            result._data
                .should.be.instanceof(Object)
            result._data
                .should.have.property('ip')
            result._data.ip
                .should.be.an.instanceof(Array)
            result._data.ip
                .should.have.length(2)
            result._data.ip
                .should.have.property(0, '1.2.3.4')
            result._data.ip
                .should.have.property(1, '5.6.7.8')

            done()
        })
    })
})