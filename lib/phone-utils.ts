/**
 * Norwegian Phone Number Detection and Masking Utilities
 */

// Norwegian phone number patterns
const NORWEGIAN_PHONE_PATTERNS = [
  // International format: +47 followed by 8 digits
  /(\+47\s*[2-9]\d{7})/g,
  /(\+47\s*[2-9]\d{3}\s*\d{4})/g,
  /(\+47\s*[2-9]\d{2}\s*\d{2}\s*\d{3})/g,
  
  // Country code without +: 47 followed by 8 digits
  /(^|\s)(47\s*[2-9]\d{7})(\s|$)/g,
  /(^|\s)(47\s*[2-9]\d{3}\s*\d{4})(\s|$)/g,
  
  // Local format: 8 digits starting with 2-9
  /(^|\s)([2-9]\d{7})(\s|$)/g,
  /(^|\s)([2-9]\d{3}\s*\d{4})(\s|$)/g,
  /(^|\s)([2-9]\d{2}\s*\d{2}\s*\d{3})(\s|$)/g,
  
  // With dashes or dots
  /(^|\s)(\+47[-.]?[2-9]\d{3}[-.]?\d{4})(\s|$)/g,
  /(^|\s)(47[-.]?[2-9]\d{3}[-.]?\d{4})(\s|$)/g,
  /(^|\s)([2-9]\d{3}[-.]?\d{4})(\s|$)/g,
  /(^|\s)([2-9]\d{2}[-.]?\d{2}[-.]?\d{3})(\s|$)/g,
  
  // With parentheses
  /(^|\s)(\+47\s*\([2-9]\d{3}\)\s*\d{4})(\s|$)/g,
  /(^|\s)(47\s*\([2-9]\d{3}\)\s*\d{4})(\s|$)/g,
  /(^|\s)(\([2-9]\d{3}\)\s*\d{4})(\s|$)/g,
]

/**
 * Detects if a string contains Norwegian phone numbers
 */
export function containsNorwegianPhoneNumber(text: string): boolean {
  if (!text) return false
  
  return NORWEGIAN_PHONE_PATTERNS.some(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    return pattern.test(text)
  })
}

/**
 * Masks Norwegian phone numbers in text with asterisks
 */
export function maskNorwegianPhoneNumbers(text: string, maskChar: string = '*'): string {
  if (!text) return text
  
  let maskedText = text
  
  NORWEGIAN_PHONE_PATTERNS.forEach(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    maskedText = maskedText.replace(pattern, (match, ...groups) => {
      // Handle different regex group structures
      if (groups.length >= 3) {
        // Pattern with capture groups for whitespace
        const [prefix, phoneNumber, suffix] = groups
        const maskedNumber = phoneNumber.replace(/\d/g, maskChar)
        return `${prefix || ''}${maskedNumber}${suffix || ''}`
      } else if (groups.length === 1) {
        // Simple pattern with one capture group
        const phoneNumber = groups[0]
        return phoneNumber.replace(/\d/g, maskChar)
      } else {
        // Fallback: mask all digits in the match
        return match.replace(/\d/g, maskChar)
      }
    })
  })
  
  return maskedText
}

/**
 * Replaces Norwegian phone numbers with a placeholder message
 */
export function replaceNorwegianPhoneNumbers(
  text: string, 
  replacement: string = '[Telefonnummer fjernet av sikkerhetsgrunner]'
): string {
  if (!text) return text
  
  let replacedText = text
  
  NORWEGIAN_PHONE_PATTERNS.forEach(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    replacedText = replacedText.replace(pattern, (match, ...groups) => {
      if (groups.length >= 3) {
        // Pattern with capture groups for whitespace
        const [prefix, , suffix] = groups
        return `${prefix || ''}${replacement}${suffix || ''}`
      } else {
        return replacement
      }
    })
  })
  
  return replacedText
}

/**
 * Extracts all Norwegian phone numbers from text
 */
export function extractNorwegianPhoneNumbers(text: string): string[] {
  if (!text) return []
  
  const phoneNumbers: string[] = []
  
  NORWEGIAN_PHONE_PATTERNS.forEach(pattern => {
    pattern.lastIndex = 0 // Reset regex state
    let match
    while ((match = pattern.exec(text)) !== null) {
      if (match.length >= 3) {
        // Pattern with capture groups
        const phoneNumber = match[2] || match[1]
        if (phoneNumber && !phoneNumbers.includes(phoneNumber.trim())) {
          phoneNumbers.push(phoneNumber.trim())
        }
      } else if (match[1]) {
        const phoneNumber = match[1]
        if (!phoneNumbers.includes(phoneNumber.trim())) {
          phoneNumbers.push(phoneNumber.trim())
        }
      }
    }
  })
  
  return phoneNumbers
}

/**
 * Main function to sanitize message content
 */
export function sanitizeMessageContent(content: string): {
  sanitized: string
  hadPhoneNumbers: boolean
  phoneNumbersFound: string[]
} {
  if (!content) {
    return {
      sanitized: content,
      hadPhoneNumbers: false,
      phoneNumbersFound: []
    }
  }
  
  const phoneNumbersFound = extractNorwegianPhoneNumbers(content)
  const hadPhoneNumbers = phoneNumbersFound.length > 0
  const sanitized = hadPhoneNumbers 
    ? replaceNorwegianPhoneNumbers(content)
    : content
  
  return {
    sanitized,
    hadPhoneNumbers,
    phoneNumbersFound
  }
} 