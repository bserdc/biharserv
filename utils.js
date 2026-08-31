// Pure helpers extracted from script.js so they can be unit-tested without a DOM.

const slugify = (value) => {
  return String(value || 'applicant')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'applicant';
};

const DEFAULT_BACKEND_MESSAGE = 'Your application has been received and is now under review.';

// Parses the raw response body from the Google Apps Script endpoint into a
// human-readable message. Returns the fallback when nothing useful is found.
const parseBackendMessage = (text, fallback = DEFAULT_BACKEND_MESSAGE) => {
  if (!text) return fallback;

  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.message) {
      return parsed.message;
    }
  } catch (error) {
    if (String(text).toLowerCase().includes('success')) {
      return text;
    }
  }

  return fallback;
};

// Support both ESM (vitest) and plain <script> usage.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { slugify, parseBackendMessage, DEFAULT_BACKEND_MESSAGE };
}
if (typeof window !== 'undefined') {
  window.bservHelpers = { slugify, parseBackendMessage, DEFAULT_BACKEND_MESSAGE };
}
