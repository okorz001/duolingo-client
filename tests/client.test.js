const fs = require('fs')

const DuolingoClient = require('../src/client')
const getJwt = require('../src/get-jwt')
const jsonHttpFetch = require('../src/json-http-fetch')

// 'npm test' runs in repo root, so this is relative to that
const MOCK_DIR = 'mocks'

jest.mock('../src/get-jwt')
jest.mock('../src/json-http-fetch')

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

function mockFetch(filename) {
    const text = fs.readFileSync(`${MOCK_DIR}/${filename}`, 'utf8')
    const body = JSON.parse(text)
    jsonHttpFetch.mockResolvedValue({body})
}

it('getUser', async () => {
    mockFetch('users-unauth.json')
    const client = new DuolingoClient()
    const user = await client.getUser('racsoTest1')
    expect(user).toMatchObject({
        id: 491392036,
        username: 'racsoTest1',
        displayName: 'Racso',
        streak: {
            length: 1,
            extended: false,
            freeze: false,
        },
        languages: [
            {
                id: 'vi',
                name: 'Vietnamese',
                level: 1,
                points: 30,
            }
        ],
        activeLanguage: 'vi',
    })
})
