import server from './network/server'
// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
  try {
    await server.start()
  } catch (error) {
    console.error(error)
  }
})()
