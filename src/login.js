const jsonHttpFetch = require('./json-http-fetch')

/**
 * @typedef LoginResult
 * @prop {string} jwt The JWT secret for the user.
 * @prop {integer} userId The user's id.
 */
/**
 * Gets a JWT secret for calling APIs that require authentication. This also
 * returns their user id which is needed for some API calls.
 * @param {string} username The username to login as.
 * @param {string} password The user's password.
 * @return {Promise<LoginResult>} A JWT for the user and their user id.
 * @memberof! module:duolingo-client
 */
async function login(username, password) {
    const res = await jsonHttpFetch('POST',
                                    'https://www.duolingo.com/login',
                                    {},
                                    {login: username, password})
    if (!res.ok) {
        throw new Error(res.statusText)
    }
    // Authentication failure stills returns 200, but sets failure in body
    if (res.body.failure) {
        throw new Error(res.body.message)
    }
    return {
        jwt: res.headers.get('jwt'),
        userId: +res.body.user_id,
    }
}

module.exports = login
