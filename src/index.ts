import server from './network/server'
;(async () => {
  try {
    await server.start()
  } catch (error) {
    console.error(error)
  }
})()
