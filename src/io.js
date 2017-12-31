/*
 * A module with synchronous file I/O operations
 */

const fs = require('fs');
const path = require('path');
const findUp = require('find-up');

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

function ensureParentDirExists(filePath) {
	const dirPath = path.dirname(filePath);
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath);
	} else if (!fs.statSync(dirPath).isDirectory()) {
		throw new Exception(dirPath + " exists but is not a directory!");
	}
}

function findClosestParentDirWith(name) {
	return findUp.sync(name);
}

/**
 * Removes the given file, and optionally the parent directory iff it is
 * empty.
 * @param  {String}  filePath
 *            The path to the file to remove.
 * @param  {Boolean} removeEmptyParent
 *            `true` if the parent directory should also be removed if empty.
 */
function removeFile(filePath, removeEmptyParent) {
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
	if (removeEmptyParent) {
		var dir = path.dirname(filePath);
		if (fs.readdirSync(dir).length === 0) {
			fs.rmdirSync(dir);
		}
	}
}

module.exports = {
	readJsonFile,
	writeJsonFile,
	ensureParentDirExists,
	findClosestParentDirWith,
	removeFile,
}
