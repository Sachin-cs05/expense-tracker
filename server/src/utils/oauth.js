import crypto from "crypto";

const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required to sign OAuth state.");
  }
  return secret;
}

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const base64 = `${normalized}${padding ? "=".repeat(4 - padding) : ""}`;
  return Buffer.from(base64, "base64").toString("utf8");
}

function sign(payload, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Generates a signed, tamper-proof state parameter containing provider, timestamp, and random nonce.
 */
export function generateOAuthState(provider) {
  const secret = getSecret();
  const stateData = {
    provider,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString("hex")
  };

  const payload = base64UrlEncode(JSON.stringify(stateData));
  const signature = sign(payload, secret);

  return `${payload}.${signature}`;
}

/**
 * Validates a signed OAuth state parameter against the expected provider.
 */
export function verifyOAuthState(state, expectedProvider) {
  if (!state || typeof state !== "string") {
    throw new Error("Missing or invalid OAuth state parameter.");
  }

  const [payload, signature] = state.split(".");
  if (!payload || !signature) {
    throw new Error("Malformed OAuth state format.");
  }

  const secret = getSecret();
  const expectedSignature = sign(payload, secret);

  if (signature.length !== expectedSignature.length) {
    throw new Error("Invalid OAuth state signature.");
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid OAuth state signature.");
  }

  let stateData;
  try {
    stateData = JSON.parse(base64UrlDecode(payload));
  } catch {
    throw new Error("Failed to parse OAuth state payload.");
  }

  if (stateData.provider !== expectedProvider) {
    throw new Error(`OAuth state provider mismatch (expected ${expectedProvider}, got ${stateData.provider}).`);
  }

  if (Date.now() - stateData.timestamp > STATE_MAX_AGE_MS) {
    throw new Error("OAuth state has expired. Please try logging in again.");
  }

  return stateData;
}
