// Pulls a JSON array/object out of Claude's text reply, tolerating any
// stray prose around it, so a slightly off-format reply doesn't crash the route.
export function extractJson(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/[[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through
      }
    }
    return fallback;
  }
}
