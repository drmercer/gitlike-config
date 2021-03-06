
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var mock = require('mock-fs');
var applicationConfigPath = require('application-config-path');
var _merge = require('lodash/merge');

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
		assert.equal(1, conf.get("test"));
		assertFileContains(localConfigPath, {
			test: 1
		})
	})

	it("should work with nested paths", () => {
		conf.set("test.some.path", 1);
		assert.equal(1, conf.get("test.some.path"));
		assertFileContains(localConfigPath, {
			test: { some: { path: 1 } }
		})
	})

	it("should work with arrays", () => {
		conf.set(["test","some","other","path"], 1);
		assert.equal(1, conf.get("test.some.other.path"));
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
		assert.equal(1, conf.get("test"));
		assertFileContains(globalConfigPath, {
			test: 1
		})
	})

	it("should work with nested paths", () => {
		conf.setGlobal("test.some.path", 1);
		assert.equal(1, conf.get("test.some.path"));
		assertFileContains(globalConfigPath, {
			test: { some: { path: 1 } }
		})
	})

	it("should work with arrays", () => {
		conf.setGlobal(["test","some","other","path"], 1);
		assert.equal(1, conf.get("test.some.other.path"));
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

describe("getConfig", () => {
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

	it("should retrieve merged data", () => {
		const merged = _merge({}, dummyDefaultConfig, dummyGlobalConfig, dummyLocalConfig);
		assert.deepEqual(merged, conf.getConfig());
	})

})

describe("direct write", () => {
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

	describe("writeLocalConfig", () => {
		it("should throw when given a non-object", () => {
			try {
				conf.writeLocalConfig(null);
				assert.fail("null should throw");
			} catch (e) {}
			try {
				conf.writeLocalConfig(1337);
				assert.fail("number should throw");
			} catch (e) {}
			try {
				conf.writeLocalConfig(function(){});
				assert.fail("function should throw");
			} catch (e) {}
		})
		it("should write to file when given a nice object", () => {
			const dummyNewData = {
				potato: 1337,
				a: {
					nested: {
						object: 'is fun',
					},
				},
			};
			conf.writeLocalConfig(dummyNewData);
			assertFileContains(localConfigPath, dummyNewData);
		})
	});

	describe("writeGlobalConfig", () => {
		it("should throw when given a non-object", () => {
			try {
				conf.writeGlobalConfig(null);
				assert.fail("null should throw");
			} catch (e) {}
			try {
				conf.writeGlobalConfig(1337);
				assert.fail("number should throw");
			} catch (e) {}
			try {
				conf.writeGlobalConfig(function(){});
				assert.fail("function should throw");
			} catch (e) {}
		})
		it("should write to file when given a nice object", () => {
			const dummyNewData = {
				potato: 1337,
				a: {
					nested: {
						object: 'is fun',
					},
				},
			};
			conf.writeGlobalConfig(dummyNewData);
			assertFileContains(globalConfigPath, dummyNewData);
		})
	});
});

describe("delete", () => {
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

	it("should delete local config file with confirmation", done => {
		conf.deleteLocalConfig((configPath, doDelete) => {
			assert.equal(path.resolve(configPath), path.resolve(localConfigPath));
			setTimeout(() => {
				doDelete();
				assert(!fs.existsSync(configPath));
				// Directory should not be deleted
				assert(fs.existsSync(path.dirname(configPath)));
				done();
			}, 0);
		});
	});
	it("should delete global config file with confirmation", done => {
		conf.deleteGlobalConfig((configPath, doDelete) => {
			assert.equal(path.resolve(configPath), path.resolve(globalConfigPath));
			setTimeout(() => {
				doDelete();
				assert(!fs.existsSync(configPath));
				// Directory should be deleted
				assert(!fs.existsSync(path.dirname(configPath)));
				done();
			}, 0);
		});
	});
});

describe("initLocalConfig", () => {
	it("should return false when a local config exists in CWD", () => {
		mock({
			[localConfigName]: JSON.stringify(dummyLocalConfig),
		});
		conf.load();
		assert(!conf.initLocalConfig());
	})
	it("should return true and reset data when a local config exists in a parent dir", () => {
		mock({
			// Have to put file in parent dir manually
		});
		const parentDirConfig = path.join("..", localConfigName);
		fs.writeFileSync(parentDirConfig, JSON.stringify(dummyLocalConfig));

		conf.load();
		assert.equal("simple", conf.get("test"));
		assert(!fs.existsSync(localConfigPath));

		assert(conf.initLocalConfig());
		assert.equal(undefined, conf.get("test"));

		assert(fs.existsSync(localConfigPath));
	})
	it("should return true when no local config exists", () => {
		mock({
			// Nothing!
		});
		conf.load();

		assert(!fs.existsSync(localConfigPath));

		assert(conf.initLocalConfig());

		assert(fs.existsSync(localConfigPath));
	})
});
