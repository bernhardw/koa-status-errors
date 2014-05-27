var koa = require('koa');
var request = require('supertest');
var should = require('should');
var statusCodes = require('status-errors/lib/codes');
var StatusError = require('status-errors');
var statusErrors = require('..');

describe('koa-status-errors', function () {

    var app;

    beforeEach(function () {
        app = koa();
    });

    describe('new Error()', function () {
        it('should rewrite to a generic 500', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                throw new Error('Some error.');
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(500)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.status.should.equal(500);
                    res.body.name.should.equal(statusCodes[500].name);
                    res.body.message.should.equal(statusCodes[500].message);
                    done(err);
                });
        });
    });

    describe('this.throw()', function () {
        it('should augment a status code', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                this.throw(404);
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.status.should.equal(404);
                    res.body.name.should.equal('Error');
                    res.body.message.should.equal('Not Found');
                    done(err);
                });
        });

        it('should augment a name', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                this.throw('Some error.');
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(500)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.message.should.equal('Some error.');
                    done();
                });
        });

        it('should use status code and message', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                this.throw(404, 'Something happened');
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.name.should.equal('Error');
                    res.body.message.should.equal('Something happened');
                    done();
                });
        });
    });

    describe('new StatusError()', function () {
        it('should output error as is', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                throw new StatusError(404, {
                    message: 'My custom message.'
                });
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.status.should.equal(404);
                    res.body.name.should.equal('Not Found');
                    res.body.message.should.equal('My custom message.');
                    done(err);
                });
        });
    });

    describe('Options', function () {
        it('should rewrite 401 to 404', function (done) {
            app.use(statusErrors({ protect401: true }));
            app.use(function* () {
                this.throw(401);
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(404)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.status.should.equal(404);
                    res.body.name.should.equal('Not Found');
                    done(err);
                });
        });

        it('should only allow whitelisted properties', function (done) {
            app.use(statusErrors());
            app.use(function* () {
                var error = new Error('Some error.');
                error.foo = 'bar';
                throw error;
            });

            request(app.listen())
                .get('/')
                .expect('Content-Type', 'application/json')
                .expect(500)
                .end(function (err, res) {
                    if (err) return done(err);
                    res.body.status.should.equal(500);
                    res.body.should.not.have.property('foo');
                    done(err);
                });
        });

        it('should prevent emit', function (done) {
            app.use(statusErrors({ emit: false }));

            app.use(function* () {
                throw new Error('Some.');
            });

            var emitted = false;
            app.on('error', function (err, ctx) {
                emitted = true;
            });

            request(app.listen())
                .get('/')
                .expect(500)
                .end(function (err, res) {
                    emitted.should.be.false;
                    done();
                });
        });
    });

});