var assert = require('assert');

var Config = require('../src/index.js');

var conf = new Config({
	name: 'gitlike-config-test'
})

try {
	conf.writeLocalConfig(null);
	assert.fail("writeLocalConfig(null) should throw");
} catch (e) {
	// Correct
}

try {
	conf.writeGlobalConfig(null);
	assert.fail("writeGlobalConfig(null) should throw");
} catch (e) {
	// Correct
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
assert.equal(conf.get('potato'), 1337);
assert.equal(origConf.bagel, true);
assert.equal(conf.get('bagel'), true);
assert.equal(conf.get('a.nested.path'), 'to nowhere');
assert.equal(conf.get('a.nested.object'), 'is fun');

conf.setGlobal('a.nested.object', 'is changed globally');
assert.equal(conf.get('a.nested.object'), 'is fun');

conf.set('a.nested.object', 'is changed locally');
assert.equal(conf.get('a.nested.object'), 'is changed locally');

conf.writeLocalConfig({});
conf.writeGlobalConfig({});
