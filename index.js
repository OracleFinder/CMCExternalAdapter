let request = require('request');

let handle = (data, callback) => {
    let url = "https://pro-api.coinmarketcap.com/v1/";
    url = url + data.endpoint;
    if (data.resource != "") {
        url = url + "/" + data.resource;
    }
    url = url + "/" + data.path;

    let idOrSymbol = ["id", "symbol"];
    let idOrSlug = ["id", "slug"];

    let endpoints = {
        "cryptocurrency": {
            "info": {
                eitherOr: [idOrSymbol],
                resources: {}
            },
            "map": {
                optional: ["listing_status", "start", "limit", "symbol"],
                resources: {}
            },
            "latest": {
                resources: {
                    "listings": {
                        optional: ["start", "limit", "convert", "sort", "sort_dir", "cryptocurrency_type"],
                    },
                    "market-pairs": {
                        optional: ["start", "limit", "convert"],
                        eitherOr: [idOrSymbol]
                    },
                    "quotes": {
                        optional: ["convert"],
                        eitherOr: [idOrSymbol]
                    }
                }
            },
            "historical": {
                optional: ["time_end", "count", "interval", "convert"],
                resources: {
                    "ohlcv": {
                        required: ["time_start"],
                        optional: ["time_period"],
                        eitherOr: [idOrSymbol]
                    },
                    "quotes": {
                        optional: ["time_start"],
                        eitherOr: [idOrSymbol]
                    }
                }
            }
        },
        "exchange": {
            "info": {
                eitherOr: [idOrSlug],
                resources: {}
            },
            "map": {
                optional: ["listing_status", "slug", "start", "limit"],
                resources: {}
            },
            "latest": {
                optional: ["convert"],
                resources: {
                    "listings": {
                        required: ["sort_dir"],
                        optional: ["start", "limit", "sort", "market_type"],
                    },
                    "market-pairs": {
                        optional: ["start", "limit"],
                        eitherOr: [idOrSlug]
                    },
                    "quotes": {
                        eitherOr: [idOrSlug]
                    }
                }
            },
            "historical": {
                resources: {
                    "quotes": {
                        optional: ["time_start", "time_end", "count", "interval", "convert"],
                        eitherOr: [idOrSlug]
                    }
                }
            }
        },
        "global-metrics": {
            "latest": {
                resources: {
                    "quotes": {
                        optional: ["convert"],
                    }
                }
            },
            "historical": {
                resources: {
                    "quotes": {
                        optional: ["time_start", "time_end", "count", "interval", "convert"],
                    }
                }
            }
        },
        "tools": {
            "price-conversion": {
                required: ["amount"],
                optional: ["time", "convert"],
                eitherOr: [idOrSymbol]
            }
        }
    };

    if (!endpoints.hasOwnProperty(data.endpoint)) {
        callback(400, {
            jobRunID: data.jobId,
            status: "errored",
            error: "Not a valid endpoint"
        });
        return;
    }

    if (!endpoints[data.endpoint].hasOwnProperty(data.path)) {
        callback(400, {
            jobRunID: data.jobId,
            status: "errored",
            error: "Path is not valid for this endpoint"
        });
        return;
    }

    if (data.resource != "" && !endpoints[data.endpoint][data.path].resources.hasOwnProperty(data.resource)) {
        callback(400, {
            jobRunID: data.jobId,
            status: "errored",
            error: "Resource is not valid for this endpoint/path"
        });
        return;
    }

    let required = endpoints[data.endpoint][data.path].required || [];
    let optional = endpoints[data.endpoint][data.path].optional || [];
    let eitherOr = endpoints[data.endpoint][data.path].eitherOr || [];

    if (data.resource != "") {
        required = required.concat(endpoints[data.endpoint][data.path].resources[data.resource].required || []);
        optional = optional.concat(endpoints[data.endpoint][data.path].resources[data.resource].optional || []);
        eitherOr = eitherOr.concat(endpoints[data.endpoint][data.path].resources[data.resource].eitherOr || []);
    }

    var requestObj = {};

    for (var i = 0; i < required.length; i++) {
        if (data[required[i]] == "") {
            callback(400, {
                jobRunID: data.jobId,
                status: "errored",
                error: "Missing required parameter"
            });
            return;
        }
        requestObj[required[i]] = data[required[i]];
    }

    for (var i = 0; i < optional.length; i++) {
        if (data[optional[i]] != "") {
            requestObj[optional[i]] = data[optional[i]];
        }
    }

    for (var i = 0; i < eitherOr.length; i++) {
        let options = eitherOr[i];
        let selected = false;
        for (var j = 0; j < options.length; j++) {
            if (data[options[j]] != "") {
                requestObj[options[j]] = data[options[j]];
                selected = true;
                break;
            }
        }
        if (!selected) {
            callback(400, {
                jobRunID: data.jobId,
                status: "errored",
                error: "Missing required either-or parameter"
            });
            return;
        }
    }

    let options = {
        method: 'GET',
        uri: url,
        qs: requestObj,
        headers: {
            'X-CMC_PRO_API_KEY': data.apiKey
        },
        json: true
    };

    request(options, (error, response, body) => {
        if (error || response.statusCode >= 400) {
            callback(response.statusCode, {
                jobRunID: data.jobId,
                status: "errored",
                error: error
            });
        } else {
            callback(response.statusCode, {
                jobRunID: data.jobId,
                data: body
            });
        }
    });
};

exports.handler = (event, context, callback) => {
    let data = {
        jobId: event.id,
        apiKey: process.env.API_KEY || "",
        endpoint: event.data.endpoint || "",
        resource: event.data.resource || "",
        path: event.data.path || "",
        id: event.data.id || "",
        symbol: event.data.symbol || "",
        listing_status: event.data.listing_status || "",
        start: event.data.start || "",
        limit: event.data.limit || "",
        convert: event.data.convert || "",
        sort: event.data.sort || "",
        sort_dir: event.data.sort_dir || "",
        cryptocurrency_type: event.data.cryptocurrency_type || "",
        time_start: event.data.time_start || "",
        time_end: event.data.time_end || "",
        time_period: event.data.time_period || "",
        count: event.data.count || "",
        interval: event.data.interval || "",
        slug: event.data.slug || "",
        market_type: event.data.market_type || "",
        amount: event.data.amount || "",
    };

    handle(data, (statusCode, responseData) => {
        callback(null, responseData);
    });
};

exports.gcpservice = (req, res) => {
    let data = {
        jobId: req.body.id,
        apiKey: process.env.API_KEY || "",
        endpoint: req.body.data.endpoint || "",
        resource: req.body.data.resource || "",
        path: req.body.data.path || "",
        id: req.body.data.id || "",
        symbol: req.body.data.symbol || "",
        listing_status: req.body.data.listing_status || "",
        start: req.body.data.start || "",
        limit: req.body.data.limit || "",
        convert: req.body.data.convert || "",
        sort: req.body.data.sort || "",
        sort_dir: req.body.data.sort_dir || "",
        cryptocurrency_type: req.body.data.cryptocurrency_type || "",
        time_start: req.body.data.time_start || "",
        time_end: req.body.data.time_end || "",
        time_period: req.body.data.time_period || "",
        count: req.body.data.count || "",
        interval: req.body.data.interval || "",
        slug: req.body.data.slug || "",
        market_type: req.body.data.market_type || "",
        amount: req.body.data.amount || "",
    };

    handle(data, (statusCode, responseData) => {
        res.status(statusCode).send(responseData);
    });
};
