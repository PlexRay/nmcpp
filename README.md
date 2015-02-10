[![build status](https://travis-ci.org/PlexRay/nmcpp.svg)](https://travis-ci.org/PlexRay/nmcpp)
[![unit tests](https://img.shields.io/badge/unit%20tests-passing-brightgreen.svg)](https://dnschain.info/_s/nmcpp/mocha/)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/PlexRay/nmcpp/master/LICENSE)
[![Join the chat at https://gitter.im/PlexRay/nmcpp](https://img.shields.io/badge/gitter-join%20chat-orange.svg)](https://gitter.im/PlexRay/nmcpp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Namecoin Data Processing Library

The Namecoin Data Processor Library allows to simplify access to the 
[Namecoin](http://namecoin.info), as well as other Namecoin data
providers. It was developed primarily for the Namecoin access, but has been 
extended to support any data provider whose data conforms 
[Namecoin Data specifications](http://dot-bit.org/Namespace:Domain_names_v2.0). 
The library supports imports, delegates, aliasing and other features of the Namecoin Data, 
cross-references between Data Providers. The library discovers data inconsistency, 
including circular references.

### Quick Examples

Resolving `IPv4` address at `www.domain.bit`
```js
nmcpp.resolve('ip#www.domain.bit',
function(err, res) {
    console.log('ip:', res.data)
})
```

Same as above
```js
nmcpp.resolve('ip', {
    domain: 'www.domain.bit'
}, function(err, res) {
    console.log('ip:', res.data)
})
```

Resolving `email` and `gpg fingerprint` fields at `www.domain.bit`
```js
nmcpp.resolve('', {
    domain: 'www.domain.bit',
    debug: debug('myapp')
}, function(err, res) {
    if (err) { return done(err) }
    
    async.map(['email', 'fpr.gpg'], 
        function(item, callback) {
            res.data.lookup(item, callback)
        },
        function(err, results) {
            if (err) { return done(err) }
            
            console.log('email:', results[0])
            console.log('gpg fingerprint:'results[1])
            
            done()
        })
})
```

### Example Data Providers

Namecoin wallet data provider using the [namecoin](https://www.npmjs.com/package/namecoin) client library:
```js
var namecoin = require('namecoin');
var client = new namecoin.Client({/*Options*/});

var NamecoinWalletProvider = nmcpp.Provider.extend({
    load: function(name, callback) {
        client.cmd('name_show', name, function(err, result) {
            if (err) { return callback(new Error(err)); }
            return nmcpp.parseNameData(result.value, callback);
        });
    }
});

new NamecoinWalletProvider(nmcpp, 'bit');
```

Web based Public API data provider with multiple gTLD support:
```js
var httpRequest = require('request');
var urljoin = require('url-join');

var NamecoinDNSChainProvider = nmcpp.Provider.extend({
    init: function(addr, transform) {
        this.addr = addr;
        this.transform = transform || function(name) {
            return name
        };
    }, 
    normalize: function(name, type) {
        type = type || 'd';
        if (name.indexOf('/') < 0) {
            return (type + '/' + this.transform(name));
        }
        return name;
    },
    load: function(name, callback) {
        var self = this;
        var url = urljoin(self.addr, name);
        httpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Accept': 'application/json'
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                return callback(new Error(error || response.statusCode));
            }
            return nmcpp.parseNameData(body, callback);
        });
    }
});

var addr = 'https://dnschain.info/bit/';

// .bit gTLD (default name transformation function)
new NamecoinDNSChainProvider(nmcpp, addr);
// .plex gTLD (custom name transformation function)
new NamecoinDNSChainProvider(nmcpp, addr, function(name) {
    return 'plex-net-' + name
});
```

### Documentation

For more information see: [https://dnschain.info/](https://dnschain.info/)

### The MIT License (MIT)

Copyright (c) 2014-2015 PlexRay, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.