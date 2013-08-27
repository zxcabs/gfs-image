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

	this.gmopt = [];
}

File.prototype.maxsize = function maxsize(w, h) {
	this.resize(w, h, '>');
};

File.prototype.resize = function resize(w, h, mod) {
	if (!this._resize) {
		this._resize = { name: 'resize', arg: [] };
		this.gmopt.push(this._resize)
	}

	this._resize.arg[0] = w;
	this._resize.arg[1] = h;
	this._resize.arg[2] = mod;
};

File.prototype.quality = function quality(val) {
	if (!this._qa) {
		this._qa = { name: 'quality', arg: [] };
		this.gmopt.push(this._qa);
	}

	this._qa.arg[0] = val;
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

	if (this.owner) {
		meta.owner = this.owner;
	}

	return meta;
});