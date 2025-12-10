// Application configuration

export const config = {
  // Set to false to disable new user registrations
  isRegistrationAllowed: true,
  // Base URL for payment links
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
}

