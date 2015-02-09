/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/
/*jshint -W030 */

var debug = require('debug')('nmcpp:test-0003')

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

describe('[0006] Alias', function() {

    it('[0000] find(["ip#us"], "domain.bit", done)', function(done) {
        try {
            var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0006-0000'), {
                "d/domain": {
                    "ip": "8.8.8.8",
                    "map": {
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            nmcpp.resolve(["ip#us"], {
                domain: "domain.bit",
                debug: bit.debug
            }, function(results) {
                results
                    .should.be.instanceof(Array).and
                    .have.lengthOf(1)

                results[0].should.be.instanceof(Object)
                results[0].should.have.property('data', '8.8.8.8')
                results[0].should.have.property('name', 'domain.bit')

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0020] find(["ip#www.eu"], "domain.bit", done)', function(done) {
        try {
            var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0006-0020'), {
                "d/domain": {
                    "ip": "8.8.8.8",
                    "map": {
                        "eu": {
                            "ip": "1.2.3.4",
                            "map": {
                                "www": {
                                    "alias": "eu.@"
                                }
                            }
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            nmcpp.resolve(["ip#www.eu"], {
                domain: "domain.bit",
                debug: bit.debug
            }, function(results) {
                results
                    .should.be.instanceof(Array).and
                    .have.lengthOf(1)

                results[0].should.be.instanceof(Object)
                results[0].should.have.property('data', '1.2.3.4')
                results[0].should.have.property('name', 'eu.domain.bit')

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0040] find(["ip#www.eu"], "domain.bit", done)', function(done) {
        try {
            var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0006-0040'), {
                "d/domain": {
                    "ip": "8.8.8.8",
                    "map": {
                        "eu": {
                            "ip": "1.2.3.4",
                            "map": {
                                "ftp": {
                                    "ip": "5.6.7.8",
                                },
                                "www": {
                                    "alias": "ftp"
                                }
                            }
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            nmcpp.resolve(["ip#www.eu"], {
                domain: "domain.bit",
                debug: bit.debug
            }, function(results) {
                results
                    .should.be.instanceof(Array).and
                    .have.lengthOf(1)

                results[0].should.be.instanceof(Object)
                results[0].should.have.property('data', '5.6.7.8')
                results[0].should.have.property('name', 'ftp.eu.domain.bit')

                done()
            })
        } catch (exc) {
            done(exc)
        }
    })

    it('[0060] find(["ip#www.eu"], "domain.bit", done)', function(done) {
        try {
            var debug = require('debug')('nmcpp:test-0006-0060')

            var bit = new Namecoin(nmcpp, 'bit', debug, {
                "d/domain": {
                    "ip": "8.8.8.8",
                    "map": {
                        "eu": {
                            "ip": "1.2.3.4",
                            "map": {
                                "www": {
                                    "alias": "ftp.domain.coin."
                                }
                            }
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            var coin = new Namecoin(nmcpp, 'coin', debug, {
                "d/domain": {
                    "ip": "8.8.8.8",
                    "map": {
                        "dev": {
                            "map": {
                                "www": {
                                    "ip": "1.2.3.4",
                                }
                            }
                        },
                        "ftp": {
                            "alias": "www.dev",
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            nmcpp.resolve(["ip#www.eu"], {
                domain: "domain.bit",
                debug: debug
            }, function(results) {
                results
                    .should.be.instanceof(Array).and
                    .have.lengthOf(1)

                results[0].should.be.instanceof(Object)
                results[0].should.have.property('data', '1.2.3.4')
                results[0].should.have.property('name', 'www.dev.domain.coin')

                done()
            })
        } catch (exc) {
            console.log(exc.stack)
            done(exc)
        }
    })

    it('[0080] Circular aliases', function(done) {
        try {
            var bit = new Namecoin(nmcpp, 'bit', require('debug')('nmcpp:test-0008-0080'), {
                'd/domain': {
                    "ip": "8.8.8.8",
                    "map": {
                        "us": {
                            "ip": "1.2.3.4",
                            "map": {
                                "www": {
                                    "alias": ""
                                }
                            }
                        },
                        "uk": {
                            "ip": "1.2.3.4",
                            "map": {
                                "www": {
                                    "alias": "www.dev"
                                },
                                "dev": {
                                    "map": {
                                        "www": {
                                            "ip": "1.2.3.4",
                                        }
                                    }
                                }
                            }
                        },
                        "eu": {
                            "ip": "5.6.7.8",
                            "map": {
                                "www": {
                                    "alias": "us.@"
                                },
                                "coin": {
                                    "alias": "www.domain.coin."
                                }
                            }
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            var coin = new Namecoin(nmcpp, 'coin', require('debug')('nmcpp:test-0007-0000'), {
                'd/domain': {
                    "ip": "8.8.8.8",
                    "map": {
                        "www": {
                            "ip": "1.2.3.4",
                            "alias": "coin.eu.domain.bit."
                        },
                        "*": {
                            "alias": ""
                        }
                    }
                }
            })

            nmcpp.resolve(["ip#coin.eu"], {
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
        } catch (exc) {
            done(exc)
        }
    })
})