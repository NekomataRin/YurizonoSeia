const chalk = require('chalk')

module.exports = async (client) => {
    console.log(`${chalk.cyanBright('[LOG]')} ${chalk.yellowBright(client.user.tag)} Is Online!`)
}
