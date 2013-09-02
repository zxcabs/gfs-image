/**
 * User: Evgeny Reznichenko
 * Date: 31.08.13
 *
 */

var ObjectID = require('mongodb').ObjectID,
	mime = require('mime');

module.exports = File;

function File(type) {
	this.id = new ObjectID();
	this.type = type;

	this.path;
	this.children;
	this.root;

	this._owner;
	this._lastModify = new Date();

	this.gmopt = [];

	this.gmcommand('autoOrient');
}

/**
 * Support gm command
 * @param {String} name - Command name
 * @param {Array} [args] - Command arguments
 */
File.prototype.gmcommand = function gmcommand(name, args) {
	var key = '___' + name,
		obj = this[key];

	if (!obj) {
		obj = this[key] = { name: name, arg: args};
		this.gmopt.push(obj);
	} else {
		obj.arg = args;
	}
};

File.prototype.maxsize = function maxsize(w, h) {
	this.resize(w, h, '>');
};

File.prototype.resize = function resize(w, h, mod) {
	this.gmcommand('resize', [w, h, mod]);
};

File.prototype.quality = function quality(val) {
	this.gmcommand('quality', [val]);
};

File.prototype.copy = function copy(name) {
	var file = new File(this.type);

	file.root = this;
	if (!this.children) this.children = [];
	this.children.push({ name: name, file: file });

	return file;
};

File.prototype.info = function info() {
	return {
		id: this.id.toString(),
		name: this.name
	};
};

File.prototype.owner = function owner(obj) {
	this._owner = obj;
};

File.prototype.__defineGetter__('name', function () {
	return this.id.toString() + '.' + mime.extension(this.type);
});

File.prototype.__defineGetter__('meta', function () {
	var meta = {};

	if (this.root) {
		meta.root = this.root.info();
	}

	if (this.children) {
		var children = meta.children = {};

		this.children.forEach(function (file) {
			children[file.name] = file.file.info();
		});
	}

	if (this._owner) {
		meta.owner = this._owner;
	}

	meta.type = this.type;
	meta.lastModify = this._lastModify.toUTCString();

	return meta;
});