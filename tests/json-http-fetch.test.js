require('isomorphic-fetch')

const jsonHttpFetch = require('../src/json-http-fetch')
const {createRequest, processResponse} = jsonHttpFetch

it.each([
    ['GET', 'http://www.google.com'],
    ['OPTIONS', 'http://www.yahoo.com'],
])('createRequest simple %s', (method, url) => {
    const req = createRequest(method, url)
    expect(req.method).toEqual(method)
    expect(req.url).toEqual(url)
    const headers = new Headers({
        Accept: 'application/json',
    })
    expect(req.headers).toEqual(headers)
    expect(req.body).toBeUndefined()
})

it('createRequest merge headers', () => {
    const headersIn = {
        'X-My-Cool-Header': 'foo',
    }
    const req = createRequest('GET', 'http://www.google.com', headersIn)
    const headersOut = new Headers({
        Accept: 'application/json',
        'X-My-Cool-Header': 'foo',
    })
    expect(req.headers).toEqual(headersOut)
})

it('createRequest body', async () => {
    const body = {foo: 'bar'}
    const req = createRequest('POST', 'http://api.google.com', {}, body)
    const headers = new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': '13',
    })
    expect(req.headers).toEqual(headers)
    expect(await req.json()).toEqual(body)
})

it('processResponse', async () => {
    const resIn = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({Foo: 'bar'}),
        json: async () => ({spam: 'eggs'}),
    }
    const res = await processResponse(resIn)
    expect(res.ok).toBe(true)
    expect(res.status).toEqual(200)
    expect(res.statusText).toEqual('OK')
    expect(res.headers).toEqual(new Headers({Foo: 'bar'}))
    expect(res.body).toEqual({spam: 'eggs'})
})
