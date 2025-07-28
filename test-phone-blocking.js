/**
 * Test script for Norwegian phone number blocking functionality
 * Run with: node test-phone-blocking.js
 */

// Import the phone utilities
import { 
  sanitizeMessageContent,
  containsNorwegianPhoneNumber,
  maskNorwegianPhoneNumbers,
  extractNorwegianPhoneNumbers 
} from './lib/phone-utils.js'

console.log('🧪 Testing Norwegian Phone Number Blocking\n')

// Test cases with various Norwegian phone number formats
const testCases = [
  {
    name: 'International format with +47',
    input: 'Ring meg på +47 12345678 så snakker vi!',
    expected: true
  },
  {
    name: 'International format with spaces',
    input: 'Kontakt meg på +47 123 45 678',
    expected: true
  },
  {
    name: 'Country code without +',
    input: 'Send SMS til 47 12345678',
    expected: true
  },
  {
    name: 'Local format 8 digits',
    input: 'Mitt nummer er 12345678',
    expected: true
  },
  {
    name: 'Local format with spaces',
    input: 'Ring 123 45 678',
    expected: true
  },
  {
    name: 'With dashes',
    input: 'Telefon: +47-123-45678',
    expected: true
  },
  {
    name: 'With dots',
    input: 'Tlf: 123.45.678',
    expected: true
  },
  {
    name: 'With parentheses',
    input: 'Ring meg på +47 (123) 45678',
    expected: true
  },
  {
    name: 'Multiple numbers',
    input: 'Ring meg på 12345678 eller send SMS til +47 87654321',
    expected: true
  },
  {
    name: 'No phone numbers',
    input: 'Hei! Kan vi møtes i morgen?',
    expected: false
  },
  {
    name: 'Partial number (should not match)',
    input: 'Prisen er 123456 kroner',
    expected: false
  },
  {
    name: 'Non-Norwegian number',
    input: 'Ring +46 123456789 (Swedish number)',
    expected: false
  }
]

console.log('📱 Testing Phone Number Detection\n')

testCases.forEach((testCase, index) => {
  const detected = containsNorwegianPhoneNumber(testCase.input)
  const status = detected === testCase.expected ? '✅ PASS' : '❌ FAIL'
  
  console.log(`${index + 1}. ${testCase.name}`)
  console.log(`   Input: "${testCase.input}"`)
  console.log(`   Expected: ${testCase.expected ? 'Phone number found' : 'No phone number'}`)
  console.log(`   Actual: ${detected ? 'Phone number found' : 'No phone number'}`)
  console.log(`   Result: ${status}\n`)
})

console.log('🎭 Testing Phone Number Masking\n')

const maskingTests = [
  'Ring meg på +47 12345678',
  'Kontakt 123 45 678 eller +47-87654321',
  'Mitt nummer: 12345678'
]

maskingTests.forEach((input, index) => {
  const masked = maskNorwegianPhoneNumbers(input)
  console.log(`${index + 1}. Original: "${input}"`)
  console.log(`   Masked:   "${masked}"\n`)
})

console.log('🔄 Testing Message Sanitization\n')

const sanitizeTests = [
  'Hei! Ring meg på +47 12345678 så avtaler vi møte.',
  'Kontakt meg på 123 45 678 eller send e-post.',
  'Mitt nummer er +47-123-45678, ring når du vil!',
  'Ingen telefonnumre her, bare vanlig tekst.'
]

sanitizeTests.forEach((input, index) => {
  const result = sanitizeMessageContent(input)
  console.log(`${index + 1}. Original: "${input}"`)
  console.log(`   Sanitized: "${result.sanitized}"`)
  console.log(`   Had phone numbers: ${result.hadPhoneNumbers}`)
  console.log(`   Numbers found: ${result.phoneNumbersFound.length}`)
  if (result.phoneNumbersFound.length > 0) {
    console.log(`   Found numbers: ${result.phoneNumbersFound.join(', ')}`)
  }
  console.log('')
})

console.log('📊 Testing Phone Number Extraction\n')

const extractionTest = 'Ring meg på +47 12345678 eller 876 54 321, alternativt +47-555-5555'
const extracted = extractNorwegianPhoneNumbers(extractionTest)

console.log(`Input: "${extractionTest}"`)
console.log(`Extracted numbers: ${extracted.length}`)
extracted.forEach((number, index) => {
  console.log(`  ${index + 1}. "${number}"`)
})

console.log('\n✨ Phone number blocking test completed!')
console.log('\n📝 To test in the messaging system:')
console.log('1. Start your Next.js development server')
console.log('2. Open the chat/messaging feature')
console.log('3. Try sending messages with Norwegian phone numbers')
console.log('4. Verify that phone numbers are replaced with "[Telefonnummer fjernet av sikkerhetsgrunner]"') 