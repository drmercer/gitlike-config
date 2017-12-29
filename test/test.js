var Config = require('../src/index.js');

var conf = new Config({
	name: 'gitlike-config-test'
})

console.log(conf.getGlobalConfigPath());
console.log(conf.getConfig());
