var express = require('express');
var db = require('./persistent_server.js')()
express()
.use(express.bodyParser())
.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
.use(express.logger())
.get('/1/classes/Messages', db.select)
.post('/1/classes/Messages', db.insert)
.get('/*', function (req, res) { res.sendfile(__dirname + req.url)})
.listen(8000)
