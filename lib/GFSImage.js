/**
 * User: Evgeny Reznichenko
 * Date: 27.08.13
 *
 */

var path = require('path'),
	fs = require('fs'),
	GridStore = require('mongodb').GridStore,
	ObjectID = require('mongodb').ObjectID,
	mime = require('mime'),
	async = require('async'),
	merge = require('node-lib').util.merge,
	gm = require('gm'),
	defaultOpt = {
		types: ['image/bmp', 'image/jpeg', 'image/png'],
		quality: 80,
		maxsize: [1024, 1024, '>'],
		type: 'image/jpeg'
	},
	File = require('./File.js');

function noop(){};

module.exports = GFSImage;

function GFSImage(db, opt) {
	this.db = db;
	this.opt = merge(defaultOpt, opt);

	this.files = [];
	this.current = null;

	this.originalFilepath;
	this.dir;
}

GFSImage.prototype._addFile = function _addFile(file) {
	file.maxsize(this.opt.maxsize[0], this.opt.maxsize[1]);
	file.quality(this.opt.quality);

	this.files.push(file);

	return file;
};


GFSImage.prototype.file = function file(filepath) {
	if (!this.current) {
		this.current = new File(this.opt.type);
		this._addFile(this.current);

		this.originalFilepath = filepath;
		this.dir = path.dirname(filepath);
	}

	return this;
};

GFSImage.prototype.maxsize = function maxsize(w, h) {
	this.current.maxsize(w, h);
	return this;
};

GFSImage.prototype.resize = function resize(w, h, mod) {
	this.current.resize(w, h, mod);
	return this;
};

GFSImage.prototype.quality = function quality(val) {
	this.current.quality(val);
	return this;
};

GFSImage.prototype.copy = function copy(name) {
	var file = this.files[0].copy(name);
	this.current = file;
	this._addFile(file);
	return this;
};

GFSImage.prototype.owner = function owner(obj) {
	this.files[0].owner(obj);
	return this;
};

/**
 * Save image to database
 * @param fn
 */
GFSImage.prototype.save = function save(fn) {
	var self = this;

	if (!self.files.length) return fn(new Error('should set filepath before save'));
	//if (!~self.opt.types.indexOf(mime.lookup(self.current.path))) return fn(new Error('file should be image'));

	function modifyAndSave(file, next) {
		self._modifyFile(file, function (err) {
			if (err) return next(err);
			self._saveFile(file, function onSave(err) {
				fs.unlink(file.path, noop);
				next(err);
			});
		});
	}

	async.map(self.files, modifyAndSave, function (err) {
		if (err) return fn(err);
		fn(null, self.files[0].id);
	});
};



GFSImage.prototype._saveFile = function saveFile(file, fn) {
	var self = this;

	new GridStore(self.db, file.id, file.name, 'w', { metadata: file.meta })
		.open(function onGSOpen(err, gs) {
			if (err) return fn(err);

			gs.writeFile(file.path, function onGSWriteFile(err) {
				var werr = err;

				gs.close(function (err) {
					if (err || werr) return fn(err || werr);
					fn(null, file.id.toString());
				});
			});
		});
};

GFSImage.prototype._modifyFile = function modifyFile(file, fn) {
	file.path = path.join(this.dir, file.name);

	var g = gm(this.originalFilepath);

	file.gmopt.forEach(function (opt) {
		g[opt.name].apply(g, opt.arg);
	});

	g.write(file.path, fn);
};