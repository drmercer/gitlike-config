# gitlike-config
A Node module for git-like local/global configuration file management in CLI programs. Uses JSON files to store configuration data in a local directory (the current working directory or a parent of it) and in a global directory (e.g. a folder in `AppData` in Windows or `~/.config` in Linux). The objects in these JSON files can have nested  properties; the objects are merged deeply. Local values override global ones, and both global and local values override the default ones specified programmatically.

## Installation
```sh
$ npm install --save gitlike-config
```

## Usage
```js
var Config = require('gitlike-config');

var conf = new Config({
	name: 'yourAppName',
	defaults: { // optional
		yourDefaults: 'go here',
		properties: {
			can: {
				be: 'nested',
			},
		},
	},
});

console.log(conf.get('yourDefaults'));
// --> 'go here'

console.log(conf.get('properties.can.be'));
// --> 'nested'

conf.set('properties.can.be', 'awesome');
console.log(conf.get('properties.can.be'));
// --> 'awesome'

conf.setGlobal('properties.can.be', 'modified globally or locally');
console.log(conf.get('properties.can.be'));
// --> 'awesome' (because the local setting overrides the global one)
```
