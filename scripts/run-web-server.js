/* -*- coding: utf-8 -*-
============================================================================= */
/*jshint asi: true*/

var path = require('path'),
    express = require('express')

var port = 8080
var dirs = ['mocha']

var app = express();

dirs.forEach(function(dir) {
    var p = path.join(__dirname, '..', dir)
    console.log('Added static directory', p)
    app.use('/', express.static(p))
})

app.listen(port, function() {
    console.log('Web server started on port:8080')
})