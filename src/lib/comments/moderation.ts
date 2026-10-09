export type CommentModerationResult = {
  allowed: boolean;
  reason?: string;
};

const PROFANITY_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "idiot",
  "stupid",
];

const SPAM_PATTERNS = [
  "click here",
  "free money",
  "free gift",
  "win money",
  "you won",
  "visit my channel",
  "subscribe to my channel",
  "make money fast",
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function containsProfanity(text: string): boolean {
  const normalized = normalizeText(text);

  return PROFANITY_WORDS.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(normalized);
  });
}

function containsSpam(text: string): boolean {
  const normalized = normalizeText(text);

  return SPAM_PATTERNS.some((pattern) =>
    normalized.includes(pattern)
  );
}

function containsLink(text: string): boolean {
  return /(https?:\/\/|www\.|t\.me\/|bit\.ly\/|tinyurl\.com\/)/i.test(
    text
  );
}

function hasExcessiveSpecialCharacters(text: string): boolean {
  if (text.length < 10) {
    return false;
  }

  const specialCharacters = text.match(
    /[^a-zA-Z0-9\s.,!?'"()@#&%+\-:;]/g
  );

  if (!specialCharacters) {
    return false;
  }

  return specialCharacters.length / text.length > 0.35;
}

function hasExcessiveRepeatedCharacters(text: string): boolean {
  return /(.)\1{7,}/i.test(text);
}

function hasExcessiveRepeatedWords(text: string): boolean {
  const words = normalizeText(text)
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 4) {
    return false;
  }

  const counts = new Map<string, number>();

  for (const word of words) {
    counts.set(word, (counts.get(word) || 0) + 1);
  }

  return Array.from(counts.values()).some(
    (count) => count >= 4
  );
}

export function moderateComment(
  text: string
): CommentModerationResult {
  const normalized = normalizeText(text);

  if (!normalized) {
    return {
      allowed: false,
      reason: "Comment cannot be empty",
    };
  }

  if (normalized.length < 1) {
    return {
      allowed: false,
      reason: "Comment cannot be empty",
    };
  }

  if (normalized.length > 1000) {
    return {
      allowed: false,
      reason: "Comment cannot exceed 1000 characters",
    };
  }

  if (containsProfanity(normalized)) {
    return {
      allowed: false,
      reason: "Please remove inappropriate language from your comment",
    };
  }

  if (containsSpam(normalized)) {
    return {
      allowed: false,
      reason: "This comment appears to contain spam",
    };
  }

  if (containsLink(normalized)) {
    return {
      allowed: false,
      reason: "Links are not allowed in comments",
    };
  }

  if (hasExcessiveSpecialCharacters(normalized)) {
    return {
      allowed: false,
      reason: "Too many special characters",
    };
  }

  if (hasExcessiveRepeatedCharacters(normalized)) {
    return {
      allowed: false,
      reason: "Too many repeated characters",
    };
  }

  if (hasExcessiveRepeatedWords(normalized)) {
    return {
      allowed: false,
      reason: "Too many repeated words",
    };
  }

  return {
    allowed: true,
  };
}