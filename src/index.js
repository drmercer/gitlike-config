const applicationConfigPath = require('application-config-path');
const path = require('path');
const deepExtend = require('deep-extend');
const _ = require('private-parts').createKey();

const io = require('./io');

class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Error("A name must be given to gitlike-config constructor");
		}
		_(this).appName = opts.name;

		// opts.autoLoad = false will prevent automatic call to load()
		if (opts.autoLoad !== false) {
			this.load();
		}
	}

	load() {
		this.readLocalConfig();
		this.readGlobalConfig();
		this._recomputeConfig();
	}

	getConfig() {
		return _(this).config;
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
		// We don't ensureParentDirExists because it's the current working dir
		io.writeJsonFile(this.getLocalConfigPath(), data);
		_(this).localConf = data;
		this._recomputeConfig();
	}

	writeGlobalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeGlobalConfig() must be given an object");
		}
		const filePath = this.getGlobalConfigPath();
		io.ensureParentDirExists(filePath);
		io.writeJsonFile(filePath, data);
		_(this).globalConf = data;
		this._recomputeConfig();
	}

	getGlobalConfigPath() {
		return path.join(applicationConfigPath(_(this).appName), "config.json");
	}

	getLocalConfigPath() {
		return path.join('.', `.${_(this).appName}.config.json`);
	}

	_recomputeConfig() {
		_(this).config = deepExtend({}, _(this).globalConf, _(this).localConf);
	}
}

module.exports = Config;
