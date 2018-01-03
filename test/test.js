
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var mock = require('mock-fs');
var applicationConfigPath = require('application-config-path');

var Config = require('../src/index.js');

const APP_NAME = 'gitlike-config-test';
const globalConfigDir = applicationConfigPath(APP_NAME);
const globalConfigPath = path.join(globalConfigDir, "config.json");
const localConfigName = `.${APP_NAME}.config.json`;
const localConfigPath = path.join(".", localConfigName);

function assertFileContains(path, jsonContents) {
	assert.deepEqual(JSON.parse(fs.readFileSync(path)), jsonContents);
}

const dummyLocalConfig = {
	test: "simple",
	also: {
		test: {
			a: "more complex path"
		}
	},
	override: "local"
};
const dummyGlobalConfig = {
	testGlobal: "bagel",
	override: "global",
	override2: "global"
};
const dummyDefaultConfig = {
	override: "default",
	override2: "default",
	testDefault: "potato",
};

var conf = new Config({
	name: APP_NAME,
	autoLoad: false,
	defaults: dummyDefaultConfig,
});

describe("set (local)", () => {

	beforeEach(() => {
		mock({
			// Nothing (the working directory exists by default)
		});
		conf.load();
	});
	afterEach(() => {
		mock.restore();
	});

	it("should set a basic property", () => {
		conf.set("test", 1);
		assertFileContains(localConfigPath, {
			test: 1
		})
	})

	it("should work with nested paths", () => {
		conf.set("test.some.path", 1);
		assertFileContains(localConfigPath, {
			test: { some: { path: 1 } }
		})
	})

	it("should work with arrays", () => {
		conf.set(["test","some","other","path"], 1);
		assertFileContains(localConfigPath, {
			test: { some: { other: { path: 1 } } }
		})
	})
})

describe("setGlobal", () => {

	beforeEach(() => {
		mock({
			// Just an empty dir for the global config
			[globalConfigDir]: {}
		});
		conf.load();
	});
	afterEach(() => {
		mock.restore();
	});

	it("should set a basic property", () => {
		conf.setGlobal("test", 1);
		assertFileContains(globalConfigPath, {
			test: 1
		})
	})

	it("should work with nested paths", () => {
		conf.setGlobal("test.some.path", 1);
		assertFileContains(globalConfigPath, {
			test: { some: { path: 1 } }
		})
	})

	it("should work with arrays", () => {
		conf.setGlobal(["test","some","other","path"], 1);
		assertFileContains(globalConfigPath, {
			test: { some: { other: { path: 1 } } }
		})
	})
})

describe("get", () => {
	beforeEach(() => {
		mock({
			// Dummy config files
			[localConfigName]: JSON.stringify(dummyLocalConfig),
			[globalConfigPath]: JSON.stringify(dummyGlobalConfig)
		});
		conf.load();
	});
	afterEach(() => {
		mock.restore();
	});

	it("should retrieve local values", () => {
		assert.equal("simple", conf.get("test"));
	})
	it("should retrieve global values", () => {
		assert.equal("bagel", conf.get("testGlobal"));
	})
	it("should retrieve default values", () => {
		assert.equal("potato", conf.get("testDefault"));
	})

	it("should retrieve a nested value", () => {
		assert.equal("more complex path", conf.get("also.test.a"));
	})
	it("should also accept an array", () => {
		assert.equal("more complex path", conf.get(["also","test","a"]));
	})

	it("should prefer local properties over global", () => {
		assert.equal("local", conf.get("override"));
	})
	it("should prefer global properties over default", () => {
		assert.equal("global", conf.get("override2"));
	})

})


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
