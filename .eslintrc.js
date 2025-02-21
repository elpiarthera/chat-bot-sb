module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    // Add other rules as needed
  },
  // Add ignores if needed for specific files
  ignorePatterns: ['*.d.ts']
} 