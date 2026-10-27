const fs = require('fs')
const path = require('path')

// Lists the files (or only the folders) directly inside `directory`, sorted by name
module.exports = (directory, foldersOnly = false) => {
    if (!fs.existsSync(directory)) return []

    return fs.readdirSync(directory, { withFileTypes: true })
        .filter(file => (foldersOnly) ? file.isDirectory() : file.isFile())
        .map(file => path.join(directory, file.name))
        .sort()
}
