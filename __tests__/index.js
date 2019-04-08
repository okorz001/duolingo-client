const {DuolingoClient} = require('../index')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
const withAuth = DUOLINGO_USERNAME && DUOLINGO_PASSWORD ? it : it.skip
if (withAuth == it.skip) {
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('login/logout', async () => {
    const client = new DuolingoClient()
    expect(client.auth).toEqual({})

    await client.login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
    expect(client.auth).toMatchObject({
        username: DUOLINGO_USERNAME,
        userId: expect.anything(),
        headers: {
            authorization: expect.stringMatching(/^Bearer /),
        }
    })

    client.logout()
    expect(client.auth).toEqual({})
})

it('login failure', async () => {
    const client = new DuolingoClient()
    await expect(client.login('someuser', 'somepass')).rejects.toThrow()
})
