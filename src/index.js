const applicationConfigPath = require('application-config-path');
const path = require('path');
const _merge = require('lodash/merge');
const _get = require('lodash/get');
const _set = require('lodash/set');

const io = require('./io');

// Use private-parts to create private members. Private functions are defined here:
const _ = require('private-parts').createKey({
	recomputeConfig() {
		this.config = _merge({}, this.defaults, this.globalConf, this.localConf);
	},

	confirmAndDelete(confirm, path, removeEmptyParent, postDelete) {
		var doDelete = () => {
			io.removeFile(path, removeEmptyParent);
			postDelete();
		};
		if (confirm) {
			confirm(path, doDelete);
		} else {
			doDelete();
		}
	},
});

class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Error("A name must be given to gitlike-config constructor");
		}
		_(this).appName = opts.name;
		_(this).localConfigName = `.${opts.name}.config.json`
		_(this).lookInParentDirs = opts.lookInParentDirs !== false;
		_(this).defaults = opts.defaults || {};

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

	/**
	 * Deletes the local configuration file.
	 * @param  {Function} confirm (optional) If given, called with the path of the
	 * local config file and a function to call if that file should really be deleted.
	 */
	deleteLocalConfig(confirm) {
		const path = this.getLocalConfigPath();
		// Delete file with optional confirmation
		_(this).confirmAndDelete(confirm, path, false, () => {
			_(this).localConf = {};
			_(this).recomputeConfig();
		});
	}

	/**
	 * Deletes the global configuration file.
	 * @param  {Function} confirm (optional) If given, called with the path of the
	 * global config file and a function to call if that file should really be deleted.
	 */
	deleteGlobalConfig(confirm) {
		const path = this.getGlobalConfigPath();
		// Delete file with optional confirmation, deleting parent directory too (if it's empty)
		_(this).confirmAndDelete(confirm, path, true, () => {
			_(this).globalConf = {};
			_(this).recomputeConfig();
		});
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
		var found = null;
		if (_(this).lookInParentDirs) {
			found = this.getExistingLocalConfigPath();
		}
		return found || this.getDefaultLocalConfigPath();
	}

	getExistingLocalConfigPath() {
		if (!_(this).lookInParentDirs) {
			throw new Error("getExistingLocalConfigPath should not be used with lookInParentDirs:false option.");
		}
		const name = _(this).localConfigName;
		return io.findClosestParentDirWith(name);
	}

	getDefaultLocalConfigPath() {
		return path.join(".", _(this).localConfigName);
	}

	/**
	 * Initializes an empty local config file in the current working directory,
	 * but only if no such file already exists in that directory (`process.cwd()`).
	 * @return {Boolean} `true` if a file was created, `false` if not.
	 */
	initLocalConfig() {
		const existingPath = this.getExistingLocalConfigPath();
		const defaultPath = this.getDefaultLocalConfigPath();
		if (!existingPath || path.resolve(existingPath) !== path.resolve(defaultPath)) {
			io.writeJsonFile(defaultPath, {});
			return true;
		} else {
			return false;
		}
	}
}

module.exports = Config;
