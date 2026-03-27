import app from './app'
import http from 'http'
import debugModule from 'debug'
import sequelize from './db'

// Import models to register them with Sequelize
import './models'

const debug = debugModule('backend:server')

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

const server = http.createServer(app)

sequelize.authenticate().then(() => {
  console.log('Database connection established')
  server.listen(port)
  server.on('error', onError)
  server.on('listening', onListening)
}).catch((err) => {
  console.error('Failed to connect to database:', err)
  process.exit(1)
})

function normalizePort(val: string): number | string | false {
  const parsed = parseInt(val, 10)

  if (isNaN(parsed)) {
    return val
  }

  if (parsed >= 0) {
    return parsed
  }

  return false
}

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

function onListening(): void {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr?.port
  debug('Listening on ' + bind)
}
