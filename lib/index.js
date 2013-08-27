/**
 * User: Evgeny Reznichenko
 * Date: 27.08.13
 *
 */

var gm = require('gm'),
	GFSImage = require('./GFSImage');


/**
 * @param db
 * @param opt
 * @returns {GFSImage}
 */
module.exports = function gfsimage(db, opt) {
	return new GFSImage(db, opt);
};