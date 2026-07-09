// Used only as a fallback icon when a real photo can't be found (Pexels
// has no match, request fails, or no API key is configured).
const KEYWORD_EMOJI = [
  [/egg|omelet|frittata/i, '🍳'],
  [/salad/i, '🥗'],
  [/soup|stew|chowder/i, '🍲'],
  [/pasta|spaghetti|noodle/i, '🍝'],
  [/chicken|turkey|poultry/i, '🍗'],
  [/fish|salmon|tuna|shrimp|seafood/i, '🐟'],
  [/rice|risotto/i, '🍚'],
  [/sandwich|wrap|toast|burger/i, '🥪'],
  [/pizza/i, '🍕'],
  [/cake|dessert|cookie|sweet|muffin/i, '🍰'],
  [/smoothie|shake|juice/i, '🥤'],
  [/taco|burrito/i, '🌮'],
  [/curry/i, '🍛'],
];

export function recipeEmoji(name = '') {
  const match = KEYWORD_EMOJI.find(([pattern]) => pattern.test(name));
  return match ? match[1] : '🍽️';
}
