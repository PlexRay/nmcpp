## Namecoin Data Processing Library
[![build status](https://travis-ci.org/PlexRay/nmcpp.svg)](https://travis-ci.org/PlexRay/nmcpp)
[![unit tests](https://img.shields.io/badge/unit%20tests-passing-brightgreen.svg)](https://dnschain.info/_s/nmcpp/mocha/)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/PlexRay/nmcpp/master/LICENSE)
[![Join the chat at https://gitter.im/PlexRay/nmcpp](https://img.shields.io/badge/gitter-join%20chat-orange.svg)](https://gitter.im/PlexRay/nmcpp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

The Namecoin Data Processor Library allows to simplify access to the 
[Namecoin](http://namecoin.info), as well as other Namecoin data
providers. It was developed primarily for the Namecoin access, but has been 
extended to support any data provider whose data conforms 
[Namecoin Data specifications](http://dot-bit.org/Namespace:Domain_names_v2.0). 
The library supports imports, delegates, aliasing and other features of the Namecoin Data, 
cross-references between Data Providers. The library discovers data inconsistency, 
including circular references.

### Quick Example

Resolving `IPv4` address at `www.domain.bit`
```js
nmcpp.resolve('ip#www.domain.bit',
function(err, res) {
    console.log('ip:', res.data)
})
```

### Tests

[Online Unit Tests](https://dnschain.info/_s/nmcpp/mocha/)

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
