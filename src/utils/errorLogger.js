import ErrorLog from '../models/error_log.js';

export async function logError(api, error, response) {
  try {
    await ErrorLog.create({ api, error, response });
  } catch (e) {
    // Optionally log to console or file if DB fails
    console.error('Failed to log error:', e);
  }
}
