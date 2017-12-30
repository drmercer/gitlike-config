const applicationConfigPath = require('application-config-path');
const path = require('path');
const _merge = require('lodash/merge');
const _get = require('lodash/get');
const _set = require('lodash/set');

const io = require('./io');

// Use private-parts to create private members. Private functions are defined here:
const _ = require('private-parts').createKey({
	recomputeConfig() {
		this.config = _merge({}, this.globalConf, this.localConf);
	}
});

class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Error("A name must be given to gitlike-config constructor");
		}
		_(this).appName = opts.name;
		_(this).lookInParentDirs = opts.lookInParentDirs !== false;

		if (opts.autoLoad !== false) {
			this.load();
		}
	}

	load() {
		this.readLocalConfig();
		this.readGlobalConfig();
		_(this).recomputeConfig();
	}

	getConfig() {
		return _(this).config;
	}

	get(propertyPath, defaultVal) {
		if (typeof propertyPath !== 'string' &&
				!(propertyPath instanceof Array)) {
			throw new Error("propertyPath must be a string or an array");
		}

		return _get(_(this).config, propertyPath, defaultVal);
	}

	set(propertyPath, value) {
		if (typeof propertyPath !== 'string' &&
				!(propertyPath instanceof Array)) {
			throw new Error("propertyPath must be a string or an array");
		}

		const _config = _(this).localConf;
		_set(_config, propertyPath, value);
		this.writeLocalConfig(_config);
	}

	setGlobal(propertyPath, value) {
		if (typeof propertyPath !== 'string' &&
				!(propertyPath instanceof Array)) {
			throw new Error("propertyPath must be a string or an array");
		}

		const _config = _(this).globalConf;
		_set(_config, propertyPath, value);
		this.writeGlobalConfig(_config);
	}

	readLocalConfig() {
		var conf = io.readJsonFile(this.getLocalConfigPath()) || {};
		_(this).localConf = conf;
		return conf;
	}

	readGlobalConfig() {
		var conf = io.readJsonFile(this.getGlobalConfigPath()) || {};
		_(this).globalConf = conf;
		return conf;
	}

	writeLocalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeLocalConfig() must be given an object");
		}
		// We don't ensureParentDirExists because the parent is the current working
		// dir or some parent of it
		io.writeJsonFile(this.getLocalConfigPath(), data);
		_(this).localConf = data;
		_(this).recomputeConfig();
	}

	writeGlobalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeGlobalConfig() must be given an object");
		}
		const filePath = this.getGlobalConfigPath();
		io.ensureParentDirExists(filePath);
		io.writeJsonFile(filePath, data);
		_(this).globalConf = data;
		_(this).recomputeConfig();
	}

	getGlobalConfigPath() {
		return path.join(applicationConfigPath(_(this).appName), "config.json");
	}

	getLocalConfigPath() {
		var name = `.${_(this).appName}.config.json`;
		var found = null;
		if (_(this).lookInParentDirs) {
			found = io.findClosestParentDirWith(name);
		}
		return found || path.join(".", name);
	}
}

module.exports = Config;
