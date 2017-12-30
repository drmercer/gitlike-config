const fs = require('fs');

function readJsonFile(filePath) {
	// Return null for nonexistent file
	if (!fs.existsSync(filePath)) {
		return null;
	}

	const contents = fs.readFileSync(filePath, {
		encoding: 'utf8'
	});

	return JSON.parse(contents);
}

module.exports = {
	readJsonFile,
}
