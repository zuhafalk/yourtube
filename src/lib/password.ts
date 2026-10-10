import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Returns whether the password matches, and whether the stored value is an
// old plain-text password that should be upgraded to a hash.
export async function verifyPassword(
  password: string,
  stored: string
): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (stored.startsWith("$2")) {
    return { valid: await bcrypt.compare(password, stored), needsUpgrade: false };
  }

  return { valid: stored === password, needsUpgrade: stored === password };
}