
### Namecoin Data Processing Library

The Namecoin Data Processor Library allows to simplify access to the 
[Namecoin] (http://namecoin.info), as well as other [Namecoin Data] (NameData) 
providers. It was developed primarily for the Namecoin access, but has been 
extended to support any data provider whose data conforms 
[Namecoin Data specifications] (http://dot-bit.org/Namespace:Domain_names_v2.0). 
The library supports imports, delegates, aliasing and other features of the Namecoin Data, 
cross-references between Data Providers. The library discovers data inconsistency, 
including circular references.

### Quick Examples

```js
nmcpp.resolve('ip#www.domain.bit',
function(err, res) {
    console.log('ip:', res.data)
})
```

```js
nmcpp.resolve('ip#www', {
    domain: 'domain.bit'
}, function(err, res) {
    console.log('ip:', res.data)
})
```

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

### Documentation

For more information see: [https://dnschain.info/] (https://dnschain.info/)

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