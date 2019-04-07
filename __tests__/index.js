const {DuolingoClient} = require('../index')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
const withAuth = DUOLINGO_USERNAME && DUOLINGO_PASSWORD ? it : it.skip
if (withAuth == it.skip) {
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('login/logout', async () => {
    const client = new DuolingoClient()
    expect(client.jwt).toBeNull()
    await client.login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
    expect(client.jwt).not.toBeNull()
    client.logout()
    expect(client.jwt).toBeNull()
})

it('login failure', async () => {
    const client = new DuolingoClient()
    await expect(client.login('someuser', 'somepass')).rejects.toThrow()
})
