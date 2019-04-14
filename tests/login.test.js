const jsonHttpFetch = require('../src/json-http-fetch')
const login = require('../src/login')

jest.mock('../src/json-http-fetch')

beforeEach(() => {
    jsonHttpFetch.mockReset()
})

it('login', async () => {
    jsonHttpFetch.mockResolvedValue({
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

it('login failure', async () => {
    jsonHttpFetch.mockResolvedValue({
        body: {
            failure: "oops",
            message: "PC LOAD LETTER",
        },
    })
    await expect(login('someuser', 'somepass')).rejects.toThrow()
})
