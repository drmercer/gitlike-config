var assert = require('assert');

var Config = require('../src/index.js');

var conf = new Config({
	name: 'gitlike-config-test'
})

var origConf = conf.getConfig();

assert.equal(origConf.potato, 1337);

conf.writeLocalConfig({
	potato: 1338,
	carrot: 4321,
})

assert.equal(conf.getConfig().potato, 1338);
assert.equal(conf.getConfig().carrot, 4321);

conf.writeLocalConfig(origConf)

conf.writeGlobalConfig({potato: 1000, bagel: true});
assert.equal(conf.readGlobalConfig().potato, 1000);
assert.equal(conf.getConfig().potato, origConf.potato);
assert.equal(conf.getConfig().bagel, true);

try {
	conf.writeLocalConfig(null);
	assert.fail("writeLocalConfig(null) should throw");
} catch (e) {
	console.log("Correctly threw:", e.toString());
}
