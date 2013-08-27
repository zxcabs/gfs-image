/**
 * User: Evgeny Reznichenko
 * Date: 27.08.13
 *
 */

var db = require('./common/db.js'),
	should = require('should'),
	gfsimage = require('../lib');

/**
 * Test for #api
 */
describe('#api', function () {
    before(db.open);
	after(db.drop);

	it('should save image', function (done) {
		gfsimage(db.getDB())
			.file(__dirname + '/img/1.jpeg')
			.save(function (err, id) {
				should.not.exist(err);
				should.exist(id);
				done();
			});
	});

	it('should maxsize', function (done) {
		gfsimage(db.getDB())
			.file(__dirname + '/img/1.jpeg')
			.maxsize(100, 100)
			.save(done);
	});

	it('should quality', function (done) {
		gfsimage(db.getDB())
			.file(__dirname + '/img/1.jpeg')
			.quality(30)
			.save(done);
	});

	it('should copy', function (done) {
		gfsimage(db.getDB())
			.file(__dirname + '/img/1.jpeg')
			.copy('mini')
			.resize(250, 250)
			.quality(50)
			.copy('micro')
			.resize(50, 50)
			.save(done)
	});

	it('should owner', function (done) {
		gfsimage(db.getDB())
			.file(__dirname + '/img/1.jpeg')
			.owner({ id: 1, name: 'Jo' })
			.save(done);
	});
});


