const getJwt = require('../get-jwt')
const {DuolingoClient} = require('../index')

jest.mock('../get-jwt')

it('login/logout', async () => {
    const client = new DuolingoClient()
    expect(client.auth).toEqual({})

    getJwt.mockReturnValue('JWT')
    await client.login('user', 'password')
    expect(client.auth).toMatchObject({
        username: 'user',
        headers: {
            authorization: 'Bearer JWT',
        }
    })

    client.logout()
    expect(client.auth).toEqual({})
})
