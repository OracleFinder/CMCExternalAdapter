# Chainlink CoinMarketCap External Adapter

Adapter for use on Google Cloud Platform, AWS Lambda or Docker. Upload Zip and use trigger URL as bridge endpoint.

## Install

```bash
npm install
```

Create zip:

```bash
zip -r cl-cmc.zip .
```

Create a cloud function in GCP or Lambda, and set the handler function according to the platform you are using.

* GCP: `gcpservice`
* AWS: `handler`

**REMEMBER TO** set the environment variable `API_KEY` to your [CoinMarketCap API Key](https://pro.coinmarketcap.com/)!

## Docker
```bash
docker build . -t cmcadaptor
docker run -d \
    --name cmcadaptor \
    -p 80:80 \
    -e PORT=80 \
    -e API_KEY=<YOUR CMC API KEY> \
    cmcadaptor
```

## Test Cases (GCP/AWS test events)

### Fail

Event: 
```json
{
  "id": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {}
}
```

Result:
```json
{
  "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
  "status": "errored",
  "error": "Not a valid endpoint"
}
```

### Pass

Event:
```json
{
  "id": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "endpoint": "cryptocurrency",
    "path": "info",
    "symbol": "BTC"
  }
}
```

Result:
```json
{
  "jobRunID": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "status": {
      "timestamp": "2018-09-05T08:19:35.467Z",
      "error_code": 0,
      "error_message": null,
      "elapsed": 4,
      "credit_count": 1
    },
    "data": {
      "BTC": {
        "urls": {
          "website": [
            "https://bitcoin.org/"
          ],
          "twitter": [],
          "reddit": [
            "https://reddit.com/r/bitcoin"
          ],
          "message_board": [
            "https://bitcointalk.org"
          ],
          "announcement": [],
          "chat": [],
          "explorer": [
            "https://blockchain.info/",
            "https://live.blockcypher.com/btc/",
            "https://blockchair.com/bitcoin/blocks"
          ],
          "source_code": [
            "https://github.com/bitcoin/"
          ]
        },
        "logo": "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
        "id": 1,
        "name": "Bitcoin",
        "symbol": "BTC",
        "slug": "bitcoin",
        "date_added": "2013-04-28T00:00:00.000Z",
        "tags": [
          "mineable"
        ],
        "category": "coin"
      }
    }
  }
}
```

Event:
```json
{
  "id": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "endpoint": "cryptocurrency",
    "path": "map"
  }
}
```

Event:
```json
{
  "id": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "endpoint": "cryptocurrency",
    "path": "latest",
    "resource": "quotes",
    "id": "1,2",
    "convert": "GBP"
  }
}
```

Event:
```json
{
  "id": "278c97ffadb54a5bbb93cfec5f7b5503",
  "data": {
    "endpoint": "global-metrics",
    "path": "latest",
    "resource": "quotes"
  }
}
```
