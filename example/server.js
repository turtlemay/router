const express = require('express')

const app = express()

app.use('/router', express.static(`${__dirname}/../dist`))

app.use(express.static(__dirname))

const listener = app.listen(3030, () => {
  console.info(`Server started on port ${listener.address().port}.`)
})