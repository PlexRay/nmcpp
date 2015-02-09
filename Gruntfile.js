/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var path = require("path"),
    child_process = require('child_process')

var spawn = child_process.spawn

global.pidholder = global.pidholder || {
    pid: null
}

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        dirs: {
            tmp: './dist/tmp',
            browser: './browser',
            mocha: './mocha'
        },

        jshint: {
            files: ['Gruntfile.js', 'package.json', 'lib/**/*.js', 'test/**/*.js'],
            options: {
                globals: {
                    jQuery: false
                }
            }
        },

        browserify: {
            options: {
                transform: ['brfs']
            },
            nmcppr: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    "<%= dirs.tmp %>/browser/nmcpp.js": ["./lib/nmcpp.js"]
                }
            },
            nmcppd: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    "<%= dirs.tmp %>/mocha/nmcpp.js": ["./lib/nmcpp.js"]
                }
            },
            tests: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    "<%= dirs.mocha %>/tests.js": ["./test/**/*.js"]
                }
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                sourceMap: true
            },
            nmcpp: {
                files: {
                    '<%= dirs.browser %>/nmcpp.min.js': ['<%= dirs.tmp %>/browser/nmcpp.js']
                }
            }
        },

        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'spec'
            },
            all: {
                src: ['test/*.js']
            }
        },

        watch: {
            options: {
                reload: true
            },
            src: {
                files: ['<%= jshint.files %>'],
                tasks: ['server-stop', 'build', 'server-start'],
                options: {
                    spawn: false
                }
            }
        }
    })

    grunt.registerTask('default', ['build'])

    grunt.registerTask('build', ['jshint', 'browserify', 'uglify'])

    grunt.registerTask('test', ['simplemocha'])

    grunt.registerTask('devel', ['build', 'server-start', 'watch'])

    grunt.registerTask('server-start', 'Start', function() {
        var done = this.async()

        function launch(done) {
            done = done || function() {}

            var launcher = spawn('node', ['scripts/run-web-server.js'], {
                stdio: 'inherit'
            })

            if (launcher) {
                global.pidholder.pid = launcher.pid
                grunt.log.ok(['Launcher started', ' PID: ' + global.pidholder.pid])
                launcher.on('close', function(code) {
                    grunt.log.writeln('Launcher exited with code:', code)
                    global.pidholder.pid = null
                    if (code == 8) {
                        process.nextTick(function() {
                            launch()
                        })
                    }
                })
                done()
            } else {
                grunt.log.error(['Failed to start launcher'])
                done(false)
            }
        }

        launch(done)
    })

    grunt.registerTask('server-stop', 'Stop', function() {
        var done = this.async()

        if (global.pidholder.pid) {
            grunt.log.writeln('Killing', global.pidholder.pid)
            process.kill(global.pidholder.pid, 'SIGKILL')
            global.pidholder.pid = null
            setTimeout(function() {
                done()
            }, 2000)
        } else {
            grunt.log.ok(['Launcher has already finished'])
            done()
        }
    })
}