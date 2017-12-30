const applicationConfigPath = require('application-config-path');
const path = require('path');
const deepExtend = require('deep-extend');

const io = require('./io');

class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Error("A name must be given to gitlike-config constructor");
		}
		this.appName = opts.name;

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
		return this.config;
	}

	readLocalConfig() {
		this.localConf = io.readJsonFile(this.getLocalConfigPath()) || {};
		return this.localConf;
	}

	readGlobalConfig() {
		this.globalConf = io.readJsonFile(this.getGlobalConfigPath()) || {};
		return this.globalConf;
	}

	writeLocalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeLocalConfig() must be given an object");
		}
		// We don't ensureParentDirExists because it's the current working dir
		io.writeJsonFile(this.getLocalConfigPath(), data);
		this.localConf = data;
		this._recomputeConfig();
	}

	writeGlobalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeGlobalConfig() must be given an object");
		}
		const filePath = this.getGlobalConfigPath();
		io.ensureParentDirExists(filePath);
		io.writeJsonFile(filePath, data);
		this.globalConf = data;
		this._recomputeConfig();
	}

	getGlobalConfigPath() {
		return path.join(applicationConfigPath(this.appName), "config.json");
	}

	getLocalConfigPath() {
		return path.join('.', `.${this.appName}.config.json`);
	}

	_recomputeConfig() {
		this.config = deepExtend({}, this.globalConf, this.localConf);
	}
}

module.exports = Config;
