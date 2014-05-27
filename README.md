# koa-status-errors

Opinionated way to communicate application errors via status codes with your API users.

## Info

* JavaScript errors without a status code are kept private and are rewritten to a generic status code 500 error.
* Errors of type `StatusError` are output as they come.
* Errors thrown via Koa's own `this.throw()` and a status code are output as they come but are augmented with a status code corresponding message.

## Usage
    
    var koa = require('koa');
    var app = koa();    
    
    var errors = require('koa-status-errors');
    
    app.use(errors());
    
    app.use(function* () {
        this.throw(401);
        
        // Output:
        {
            status: 401,
            name: 'Unauthorized'
        }
    });
    
    app.listen(3000);

koa-status-errors works great together with status-errors to communication meaningful errors:

    var koa = require('koa');
    var app = koa();
    
    var errors = require('koa-status-errors');
    var StatusError = require('status-errors');
    
    app.use(errors());
    
    app.use(function* () {
        throw new StatusError(401);
        
        // Output:
        {
            status: 401,
            name: 'Unauthorized',
            message: 'The request requires user authentication.'
        }
    });
    
    app.listen(3000);
    
## Options

* `protect401` (Boolean, default: false): Rewrite 401 to 404 to prevent disclosing of any private information.
* `emit` (Boolean, default: true): Emit app-level errors. `this.app.on('error', function() {})`
* `whitelist` (Array, default: ['status', 'name', 'message', 'devCode', 'devMessage', 'devInfo']. Properties to allow in the response.

## License

ISC