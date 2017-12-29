const fs = require('fs');

function readJsonFile(filePath) {
	// Empty JSON for nonexistent file
	if (!fs.existsSync(filePath)) {
		return {};
	}

	const contents = fs.readFileSync(filePath, {
		encoding: 'utf8'
	});

	return JSON.parse(contents);
}

module.exports = {
	readJsonFile,
}
