// HMAC token to gate unsubscribe URLs. Prevents bots from iterating emails
// and silently unsubscribing real users, while keeping the URL self-contained
// (no DB lookup before validation).
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = () => {
  // Reuse CRON_SECRET (already a 64-char high-entropy value). If unset we
  // refuse to generate a token rather than fall through to a weak one.
  const s = process.env.CRON_SECRET;
  if (!s) throw new Error("CRON_SECRET is required for unsubscribe tokens");
  return s;
};

export function signUnsubscribe(email, topic = "geral") {
  const payload = `${email.toLowerCase()}:${topic}`;
  return createHmac("sha256", SECRET()).update(payload).digest("hex").slice(0, 32);
}

export function verifyUnsubscribe(email, topic, token) {
  if (!email || !token) return false;
  const expected = signUnsubscribe(email, topic);
  const a = Buffer.from(token, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(a, b); } catch { return false; }
}
