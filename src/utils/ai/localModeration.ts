const bannedWords = [
  "kill",
  "murder",
  "burn",
  "rape",
  "fuck",
  "shit",
  "idiot",
  "terrorist",
  "bomb"
];

export const localModeration = (text: string) => {
  const lower = text.toLowerCase();

  const matched = bannedWords.filter(word =>
    lower.includes(word)
  );

  return {
    allowed: matched.length === 0,
    categories: matched,
  };
};
