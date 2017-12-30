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

function writeJsonFile(path, data) {
	const json = JSON.stringify(data, null, '\t');
	fs.writeFileSync(path, json + "\n", {
		encoding: 'utf8'
	});
}

module.exports = {
	readJsonFile,
	writeJsonFile,
}
