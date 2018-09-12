const express = require('express');
const bodyParser = require('body-parser');
const adaptor = require('./index');

const app = express();
app.use(bodyParser.json());

app.post('/', function(req, res) {
  adaptor.gcpservice(req, res)
});

let listener = app.listen(process.env.PORT, function() {
  console.log("CMC External Adaptor listening on", listener.address().address + listener.address().port);
});