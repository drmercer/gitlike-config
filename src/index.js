class Config {
	constructor(opts) {
		if (!opts || typeof opts.name !== 'string') {
			throw new Exception("A name must be given to gitlike-config constructor");
		}
	}
}

module.exports = Config;
