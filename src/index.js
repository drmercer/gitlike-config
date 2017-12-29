const applicationConfigPath = require('application-config-path');
const deepExtend = require('deep-extend');

const io = require('./io');

class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Exception("A name must be given to gitlike-config constructor");
		}
		this.appName = opts.name;
	}

	getConfig() {
		return deepExtend(this.readGlobalConfig(), this.readLocalConfig());
	}

	readLocalConfig() {
		return io.readJsonFile(this.getLocalConfigPath());
	}

	readGlobalConfig() {
		return io.readJsonFile(this.getGlobalConfigPath());
	}

	getGlobalConfigPath() {
		return applicationConfigPath(this.appName) + "/config.json";
	}

	getLocalConfigPath() {
		return `./.${this.appName}.config.json`;
	}
}

module.exports = Config;
