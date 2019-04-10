const getJwt = require('../src/get-jwt')
const jsonHttpFetch = require('../src/json-http-fetch')

jest.mock('../src/json-http-fetch')

beforeEach(() => {
    jsonHttpFetch.mockReset()
})

it('getJwt', async () => {
    jsonHttpFetch.mockResolvedValue({
        headers: new Headers({
            jwt: 'secret',
        }),
        body: {},
    })
    const jwt = await getJwt('someuser', 'somepass')
    expect(jwt).toEqual('secret')
})

it('login failure', async () => {
    jsonHttpFetch.mockResolvedValue({
        body: {
            failure: "oops",
            message: "PC LOAD LETTER",
        },
    })
    await expect(getJwt('someuser', 'somepass')).rejects.toThrow()
})
