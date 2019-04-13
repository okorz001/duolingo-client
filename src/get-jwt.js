const jsonHttpFetch = require('./json-http-fetch')

/**
 * Gets a JWT secret for calling APIs that require authentication.
 * @param {string} login The username to login as.
 * @param {string} password The user's password.
 * @return {Promise<string>} A JWT for the user.
 */
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
