var codes = require('status-errors/lib/codes');

function statusErrors(options) {
    options = options || {};

    options.whitelist = options.whitelist || ['status', 'name', 'message', 'devCode', 'devMessage', 'devInfo'];
    options.emit = (options.emit !== false);

    return function* (next) {
        try {
            yield next;
        } catch (err) {
            var tmp = {};

            for (var prop in err) {
                if (err.hasOwnProperty(prop)) {
                    if (options.whitelist.indexOf(prop) > -1) {
                        tmp[prop] = err[prop];
                    }
                }
            }

            if (!err.status) {
                tmp.status = 500;
            }

            tmp.name = (err.status) ? err.name : codes[tmp.status].name;
            tmp.message = (err.status) ? err.message : codes[tmp.status].message;

            if (options.protect401) {
                tmp = {
                    status: 404,
                    name: codes[404].name,
                    message: codes[404].message
                };
            }

            this.status = tmp.status;
            this.body = tmp;

            if (options.emit) {
                // Emit the original error for centralized error logging etc.
                this.app.emit('error', err, this);
            }
        }
    };
}

module.exports = statusErrors;