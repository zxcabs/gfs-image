/**
 * User: Evgeny Reznichenko
 * Date: 27.08.13
 *
 */


var client = require('mongodb').MongoClient;

var dburi = 'mongodb://127.0.0.1:27017/gfsTestDB',
	dbo;

/**
 * Open connection to database
 * @parma {String} [uri]
 * @param {Function} fn - Callback
 */
exports.open = function open(uri, fn) {
	if (1 === arguments.length) {
		fn = uri;
		uri = dburi;
	}

	if (dbo) {
		console.warn('Connection already open');
		fn(null, dbo);
	}

	client.connect(uri, function onOpen(err, db) {
		if (err) return fn(err);
		dbo = db;
		fn(null, dbo);
	});
};

/**
 * Drop database
 * @param {Function} fn - Callback
 */
exports.drop = function drop(fn) {
	var db = exports.getDB();
	db.dropDatabase(fn);
};

/**
 * Return db
 * @returns {Object} db
 */
exports.getDB = function getDB() {
	if (!dbo) throw new Error('Connection not open');
	return dbo;
};