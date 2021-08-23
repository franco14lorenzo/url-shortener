require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser")
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlParser = require('url')
const mongoose = require('mongoose')
const {Schema} = mongoose

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const schema = new mongoose.Schema({url: 'string'})
const Url = mongoose.model('Url', schema)

console.log(mongoose.connection.readyState);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.post('/api/shorturl', function(req, res) {
 
  const bodyUrl = req.body.url
  const something = dns.lookup(urlParser.parse(bodyUrl).hostname, (err, address) => {
    if(!address) {
      res.json({error: "invalid url"})
    } else {
      const url = new Url({url: bodyUrl})
      url.save((err, data) => {
        res.json({original__url: data.url, short_url: data.id})
      })
    }
    console.log("dns", err);
    console.log("address", address);
  })
  console.log("something", something);
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  const shortUrl = req.params.shorturl
  Url.findById(shortUrl, (err, data) =>{
    if(!data){
      res.json({error: "invalid url"})
    } else {
      res.redirect(data.url)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});