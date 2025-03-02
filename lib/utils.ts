import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}

export function getMediaTypeFromDataURL(dataURL: string): string | null {
  const matches = dataURL.match(/^data:([A-Za-z-+\/]+);base64/)
  return matches ? matches[1] : null
}

export function getBase64FromDataURL(dataURL: string): string | null {
  const matches = dataURL.match(/^data:[A-Za-z-+\/]+;base64,(.*)$/)
  return matches ? matches[1] : null
}

// Generate a secure random password
export function generateSecurePassword(length: number = 12): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-="
  let password = ""

  // Ensure at least one character from each category
  password += getRandomChar("ABCDEFGHIJKLMNOPQRSTUVWXYZ") // Uppercase
  password += getRandomChar("abcdefghijklmnopqrstuvwxyz") // Lowercase
  password += getRandomChar("0123456789") // Digit
  password += getRandomChar("!@#$%^&*()_+~`|}{[]:;?><,./-=") // Special char

  // Fill the rest of the password
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleString(password)
}

// Get a random character from a string
function getRandomChar(str: string): string {
  const randomIndex = Math.floor(Math.random() * str.length)
  return str[randomIndex]
}

// Shuffle a string
function shuffleString(str: string): string {
  const array = str.split("")
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array.join("")
}

// Add a function to hash passwords if you need it
export async function hashPassword(password: string): Promise<string> {
  // Implement password hashing using bcrypt or similar
  // This is a placeholder - in a real app, you'd use a proper hashing library
  return password // Replace with actual implementation
}
