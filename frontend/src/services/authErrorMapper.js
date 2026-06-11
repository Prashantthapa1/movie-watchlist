// Shared utility to map backend auth errors to field errors or general errors
// Returns: { fieldErrors: {username?, email?, password?}, generalError?: string }
export function mapAuthError(message, { context = 'login', duplicateUsernameGeneral = true } = {}) {
  const result = { fieldErrors: {} };
  if (!message) return result;
  const lower = String(message).toLowerCase();

  const isDuplicate = lower.includes('exist') || lower.includes('already');
  const mentionsEmail = lower.includes('email');
  const mentionsUsername = lower.includes('username') || lower.includes('name');
  const mentionsPassword = lower.includes('password');
  const userNotFound = lower.includes('not found') || lower.includes("doesn't exist") || lower.includes('no user');

  if (mentionsPassword && !isDuplicate) {
    result.fieldErrors.password = message;
    return result;
  }

  if (context === 'login') {
    if (userNotFound || mentionsUsername || mentionsEmail) {
      result.fieldErrors.username = message;
      return result;
    }
  }

  if (context === 'register') {
    if (mentionsEmail && isDuplicate) {
      result.fieldErrors.email = message;
      return result;
    }
    if (mentionsEmail) {
      result.fieldErrors.email = message;
      return result;
    }
    if (mentionsUsername && isDuplicate && duplicateUsernameGeneral) {
      result.generalError = message;
      return result;
    }
    if (mentionsUsername) {
      result.fieldErrors.username = message;
      return result;
    }
  }

  // fallback general
  result.generalError = message;
  return result;
}
