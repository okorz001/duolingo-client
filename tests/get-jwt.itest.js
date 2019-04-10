const getJwt = require('../src/get-jwt')

const {DUOLINGO_USERNAME, DUOLINGO_PASSWORD} = process.env
let withAuth = it
if (!DUOLINGO_USERNAME || !DUOLINGO_PASSWORD) {
    withAuth = it.skip
    console.warn('DUOLINGO_USERNAME or DUOLINGO_PASSWORD is undefined,',
                 'skipping authed tests')
}

withAuth('getJwt', async () => {
    const jwt = await getJwt(DUOLINGO_USERNAME, DUOLINGO_PASSWORD)
    expect(typeof jwt).toEqual('string')
})

it('login failure', async () => {
    await expect(getJwt('someuser', 'somepass')).rejects.toThrow()
})
