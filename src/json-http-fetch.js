require('isomorphic-fetch')

async function jsonHttpFetch(method, url, headers, body) {
    const req = createRequest(method, url, headers, body)
    const res = await fetch(req)
    return processResponse(res)
}

function createRequest(method, url, headers = {}, body = null) {
    // convert headers to Headers object
    headers = new Headers(headers)

    // only accept JSON responses
    headers.set('Accept', 'application/json')

    // set Content-Type for body and convert to JSON
    if (body != null) {
        body = JSON.stringify(body)
        headers.set('Content-Type', 'application/json; charset=utf-8')
        headers.set('Content-Length', body.length)
    }

    return new Request(url, {method, headers, body})
}

async function processResponse(res) {
    return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        body: await res.json(),
    }
}

module.exports = jsonHttpFetch
// for testing
module.exports.createRequest = createRequest
module.exports.processResponse = processResponse
