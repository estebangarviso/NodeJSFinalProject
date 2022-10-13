import logger from 'loglevel'
import chalk from 'chalk'
import { LOG_LEVEL } from './index'

logger.setLevel(LOG_LEVEL)

console.log = function (message: any, ...optionalParams: any[]) {
  logger.info(chalk.green(`[app] 🪵 `, message), ...optionalParams)
}

console.info = function (message: any, ...optionalParams: any[]) {
  logger.info(chalk.cyan(`[app] 💬 `, message), ...optionalParams)
}

console.error = function (message: any, ...optionalParams: any[]) {
  logger.error(chalk.red(`[app] 🔴 `, message), ...optionalParams)
}

console.success = function (message: any, ...optionalParams: any[]) {
  logger.info(chalk.greenBright(`[app] 🟢 `, message), ...optionalParams)
}

console.warn = function (message: any, ...optionalParams: any[]) {
  logger.warn(chalk.yellow(`[app] 🟡 `, message), ...optionalParams)
}

console.debug = function (message: any, ...optionalParams: any[]) {
  // trace where the log is coming from
  const stack = new Error().stack
  const callers = stack?.split('at ')
  let traceString = ''
  if (callers && callers.length > 2)
    for (let i = 2; i < callers.length; i++) {
      // exclude node_modules
      if (!callers[i].includes('node_modules'))
        traceString += `\r    at ${callers[i]}`
    }

  logger.debug(
    chalk.magenta(`[app] 🟣 `, message),
    ...optionalParams,
    `\n${traceString}`
  )
}
