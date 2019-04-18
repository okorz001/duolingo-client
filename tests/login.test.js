const jsonHttpFetch = require('../src/json-http-fetch')
const login = require('../src/login')

jest.mock('../src/json-http-fetch')

beforeEach(() => {
    jsonHttpFetch.mockReset()
})

it('login', async () => {
    jsonHttpFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({
            jwt: 'secret',
        }),
        body: {
            /* eslint-disable-next-line camelcase */
            user_id: '123',
        },
    })
    const result = await login('someuser', 'somepass')
    expect(result).toMatchObject({
        jwt: 'secret',
        userId: 123,
    })
})

it('login failure body', async () => {
    jsonHttpFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        body: {
            failure: "oops",
            message: "PC LOAD LETTER",
        },
    })
    await expect(login('someuser', 'somepass')).rejects.toThrow()
})

it('login failure status', async () => {
    jsonHttpFetch.mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
    })
    await expect(login('someuser', 'somepass')).rejects.toThrow()
})
