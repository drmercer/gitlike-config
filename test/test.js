
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var applicationConfigPath = require('application-config-path');

var Config = require('../src/index.js');

const APP_NAME = 'gitlike-config-test';

it("should work good :P", function() {
	// TODO: indent properly (leaving for now to reduce git diff footprint)


var conf = new Config({
	name: APP_NAME,
	defaults: {
		potato: 'carrot',
		celery: 'healthy',
	},
	autoLoad: false,
})

try {
	conf.writeLocalConfig(null);
	assert.fail("writeLocalConfig(null) should throw");
} catch (e) {
	// Should throw
}

try {
	conf.writeGlobalConfig(null);
	assert.fail("writeGlobalConfig(null) should throw");
} catch (e) {
	// Should throw
}

conf.writeLocalConfig({
	potato: 1337,
	a: {
		nested: {
			object: 'is fun',
		},
	},
})
conf.writeGlobalConfig({
	potato: 1000,
	a: {
		nested: {
			path: 'to nowhere',
			object: 'should be overridden recursively',
		},
	},
	bagel: true,
})

const origConf = conf.getConfig();

assert.equal(origConf.potato, 1337);
assert.equal(origConf.celery, 'healthy');
assert.equal(conf.get('potato'), 1337);
assert.equal(origConf.bagel, true);
assert.equal(conf.get('bagel'), true);
assert.equal(conf.get('a.nested.path'), 'to nowhere');
assert.equal(conf.get('a.nested.object'), 'is fun');

conf.setGlobal('a.nested.object', 'is changed globally');
assert.equal(conf.get('a.nested.object'), 'is fun');

conf.set('a.nested.object', 'is changed locally');
assert.equal(conf.get('a.nested.object'), 'is changed locally');

// Should return false, since a local config already exists.
assert(!conf.initLocalConfig());

conf.deleteLocalConfig((configPath, doDelete) => {
	const fileName = `.${APP_NAME}.config.json`;
	const dir = '.';
	assert.equal(path.resolve(configPath), path.resolve(dir, fileName));
	setTimeout(() => {
		doDelete();
		assert(!fs.existsSync(configPath));
		// Directory should not be deleted
		assert(fs.existsSync(path.dirname(configPath)));

		// Should return true now, since no local config already exists:
		assert(conf.initLocalConfig());
		assert(fs.existsSync(configPath));

		conf.deleteLocalConfig();
		assert(!fs.existsSync(configPath));
	}, 0);
});
conf.deleteGlobalConfig((configPath, doDelete) => {
	const fileName = 'config.json';
	const dir = applicationConfigPath(APP_NAME);
	assert.equal(path.resolve(configPath), path.resolve(dir, fileName));
	setTimeout(() => {
		doDelete();
		assert(!fs.existsSync(configPath));
		// Directory should be deleted
		assert(!fs.existsSync(path.dirname(configPath)));
	}, 0);
});

// End of it("should work good") function
});
