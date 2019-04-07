const {DuolingoClient} = require('../index')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
const withAuth = DUOLINGO_USERNAME && DUOLINGO_PASSWORD ? it : it.skip
if (withAuth == it.skip) {
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('login', async () => {
    const client = new DuolingoClient()
    await client.login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
})

it('login failure', async () => {
    const client = new DuolingoClient()
    await expect(client.login('someuser', 'somepass')).rejects.toThrow()
})
