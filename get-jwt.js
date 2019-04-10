const jsonHttpFetch = require('./json-http-fetch')

async function getJwt(login, password) {
    const res = await jsonHttpFetch('POST',
                                    'https://www.duolingo.com/login',
                                    {},
                                    {login, password})
    // Authentication failure stills returns 200, but sets failure in body
    if (res.body.failure) {
        throw new Error(res.body.message)
    }
    return res.headers.get('jwt')
}

module.exports = getJwt
