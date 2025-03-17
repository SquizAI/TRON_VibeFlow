import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers)
expect.extend({ toHaveNoViolations })

// Extend types for Vitest
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T
    toHaveTextContent(text: string): T
    toBeVisible(): T
    toHaveAttribute(attr: string, value?: string): T
    toHaveStyle(css: Record<string, any>): T
    toHaveClass(className: string): T
  }
}

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})
