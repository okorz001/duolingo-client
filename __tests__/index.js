const {DuolingoClient} = require('../index')

it('login', async () => {
    const client = new DuolingoClient()
    // TODO: need VCS safe way to test login... environment variables?
    //await client.login(username, password)
})

it('login failure', async () => {
    const client = new DuolingoClient()
    await expect(client.login('someuser', 'somepass')).rejects.toThrow()
})
