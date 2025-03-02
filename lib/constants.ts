/**
 * Define whether enterprise features are enabled
 * This should be set to true only for customers with Enterprise Edition
 */
export const SERVER_SIDE_ONLY__PAID_ENTERPRISE_FEATURES_ENABLED =
  process.env.ENABLE_ENTERPRISE_FEATURES === "true"

// Additional feature flags can be defined here
export const ENABLE_DOCUMENT_MANAGEMENT =
  process.env.ENABLE_DOCUMENT_MANAGEMENT === "true"

export const ENABLE_ADVANCED_ANALYTICS =
  process.env.ENABLE_ADVANCED_ANALYTICS === "true"

export const ENABLE_WHITELABELING = process.env.ENABLE_WHITELABELING === "true"
