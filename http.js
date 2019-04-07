require('isomorphic-fetch')

async function get(url, headers) {
    return request('GET', url, null, headers)
}

async function post(url, body, headers) {
    return request('POST', url, body, headers)
}

async function request(method, url, body, headers) {
    const req = createRequest(method, url, body, headers)
    const res = await fetch(req)
    return handleResponse(res)
}

function createRequest(method, url, body, headers) {
    // convert headers to Headers object
    headers = headers || {}
    headers = new Headers(headers)

    // set Content-Type for body
    if (body !== null && !headers.has('Content-Type')) {
        let type = 'text/plain'
        if (typeof body === 'object') {
            type = 'application/json; charset=utf-8'
            body = JSON.stringify(body)
        }
        headers.set('Content-Type', type)
    }

    return new Request(url, {method, headers, body})
}

async function handleResponse(res) {
    const result = {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
    }
    const type = res.headers.get('Content-Type') || 'text/plain'
    if (type.match(/^application\/json[;$]/)) {
        result.body = await res.json()
    }
    else {
        // TODO: could check for text/*
        result.body = await res.text()
    }
    return result
}

module.exports = {
    get,
    post,
}