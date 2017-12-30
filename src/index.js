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
	}

	getConfig() {
		return deepExtend(this.readGlobalConfig(), this.readLocalConfig());
	}

	readLocalConfig() {
		return io.readJsonFile(this.getLocalConfigPath()) || {};
	}

	readGlobalConfig() {
		return io.readJsonFile(this.getGlobalConfigPath()) || {};
	}

	writeLocalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeLocalConfig() must be given an object");
		}
		// We don't ensureParentDirExists because it's the current working dir
		io.writeJsonFile(this.getLocalConfigPath(), data);
	}

	writeGlobalConfig(data) {
		if (!data || typeof data !== 'object') {
			throw new Error("writeGlobalConfig() must be given an object");
		}
		const filePath = this.getGlobalConfigPath();
		io.ensureParentDirExists(filePath);
		io.writeJsonFile(filePath, data);
	}

	getGlobalConfigPath() {
		return path.join(applicationConfigPath(this.appName), "config.json");
	}

	getLocalConfigPath() {
		return path.join('.', `.${this.appName}.config.json`);
	}
}

module.exports = Config;
