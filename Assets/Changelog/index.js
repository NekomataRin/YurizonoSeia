const fs = require('fs')
const path = require('path')

// Every vX.Y.Z.js file of this folder (new version = new file, nothing to change here)
const Changelogs = {}
for (const file of fs.readdirSync(__dirname).filter(f => /^v\d+\.\d+\.\d+\.js$/.test(f))) {
    const data = require(path.join(__dirname, file))
    Changelogs[data.Version] = data
}

// Newest first
const Versions = Object.keys(Changelogs).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))

module.exports = { Changelogs, Versions }
