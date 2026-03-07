const levels = { error: 0, warn: 1, info: 2, debug: 3 }
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info

function log(level, ...args) {
  if (levels[level] > currentLevel) return
  const ts = new Date().toISOString()
  const prefix = `[${ts}] [${level.toUpperCase()}]`
  if (level === 'error') console.error(prefix, ...args)
  else if (level === 'warn') console.warn(prefix, ...args)
  else console.log(prefix, ...args)
}

module.exports = {
  error: (...args) => log('error', ...args),
  warn: (...args) => log('warn', ...args),
  info: (...args) => log('info', ...args),
  debug: (...args) => log('debug', ...args),
}
