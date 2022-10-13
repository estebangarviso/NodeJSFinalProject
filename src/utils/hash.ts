import { createHash } from 'node:crypto'
import { nanoid } from 'nanoid'

/**
 * It takes a string and a salt, and returns an object with the salt and the
 * hashed string
 *
 * @param str - The string to hash.
 * @param salt - A random string of characters that is used
 * to make the hash more secure.
 * @returns An object with two properties: salt and result.
 */
export const hashString = (str: string, salt = '') => {
  const newSalt = !salt ? nanoid(30) : salt
  const hash = createHash('sha256')

  hash.update(`${str}${newSalt}`)

  const result = hash.digest('hex')

  return { salt: newSalt, result }
}
