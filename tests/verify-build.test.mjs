import { BuildVerifier } from '../scripts/verify-build.mjs'
import fs from 'fs'

describe('BuildVerifier', () => {
  test('checkDistDirectory should detect missing dist', () => {
    const verifier = new BuildVerifier()
    verifier.checkDistDirectory()
    expect(verifier.errors.length).toBeGreaterThan(0)
  })

  test('verify should return false when errors exist', () => {
    const verifier = new BuildVerifier()
    const result = verifier.verify()
    expect(result).toBe(false)
  })
})
