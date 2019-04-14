const login = require('../src/login')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
let withAuth = it
if (!DUOLINGO_USERNAME || !DUOLINGO_PASSWORD) {
    withAuth = it.skip
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('login', async () => {
    const {jwt, userId} = await login(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
    expect(typeof jwt).toEqual('string')
    expect(typeof userId).toEqual('number')
})

it('login failure', async () => {
    await expect(login('someuser', 'somepass')).rejects.toThrow()
})
