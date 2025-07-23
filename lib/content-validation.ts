/**
 * Content Validation Utility
 * 
 * This module provides functions to validate and sanitize chat messages
 * to prevent users from sharing phone numbers and email addresses.
 * This helps keep all communication within the platform for security
 * and moderation purposes.
 */

// Phone number patterns - covers various formats
const PHONE_PATTERNS = [
  // Norwegian phone numbers
  /(\+47\s?)?[4-9]\d{7}/g,
  // International formats
  /(\+\d{1,3}\s?)?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
  // US format
  /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g,
  // Generic patterns
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{10,14}\b/g
]

// Email pattern
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g

export interface ValidationResult {
  isValid: boolean
  blockedContent: string[]
  message?: string
}

/**
 * Validates message content for blocked patterns (phone numbers and emails)
 */
export function validateMessageContent(content: string): ValidationResult {
  const blockedContent: string[] = []
  
  // Check for phone numbers
  PHONE_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      blockedContent.push(...matches.map(match => `Phone number: ${match}`))
    }
  })
  
  // Check for emails
  const emailMatches = content.match(EMAIL_PATTERN)
  if (emailMatches) {
    blockedContent.push(...emailMatches.map(match => `Email: ${match}`))
  }
  
  const isValid = blockedContent.length === 0
  
  return {
    isValid,
    blockedContent,
    message: isValid 
      ? undefined 
      : 'Message blocked: Phone numbers and email addresses are not allowed in chat. Please keep all communication within the platform.'
  }
}

/**
 * Sanitizes message content by removing blocked patterns
 */
export function sanitizeMessageContent(content: string): string {
  let sanitized = content
  
  // Remove phone numbers
  PHONE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[PHONE NUMBER BLOCKED]')
  })
  
  // Remove emails
  sanitized = sanitized.replace(EMAIL_PATTERN, '[EMAIL BLOCKED]')
  
  return sanitized
}