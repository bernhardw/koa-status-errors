var koa = require('koa');
var app = koa();

var statusErrors = require('..');
app.use(statusErrors({
    handler: function (err) {
        //console.log('Do something with', err);
    }
}));

app.use(function* () {
    this.throw(401);
});

app.listen(3000);