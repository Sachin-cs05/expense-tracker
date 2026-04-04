import crypto from "crypto";

const HASH_ALGORITHM = "sha256";
const JWT_HEADER = { alg: "HS256", typ: "JWT" };

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const base64 = `${normalized}${padding ? "=".repeat(4 - padding) : ""}`;
  return Buffer.from(base64, "base64").toString("utf8");
}

function signSegment(segment, secret) {
  return crypto
    .createHmac(HASH_ALGORITHM, secret)
    .update(segment)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function parseDuration(value) {
  const match = String(value).trim().match(/^(\d+)([smhd])$/i);

  if (!match) {
    throw new Error("JWT expiration must look like 15m, 12h, or 7d.");
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24
  };

  return amount * multipliers[unit];
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is required.");
  }

  return secret;
}

export function createToken(payload) {
  const secret = getJwtSecret();
  const expiresIn = parseDuration(process.env.JWT_EXPIRES_IN || "7d");
  const issuedAt = Math.floor(Date.now() / 1000);
  const completePayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresIn
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(JWT_HEADER));
  const encodedPayload = base64UrlEncode(JSON.stringify(completePayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = signSegment(signingInput, secret);

  return `${signingInput}.${signature}`;
}

export function verifyToken(token) {
  const secret = getJwtSecret();
  const [encodedHeader, encodedPayload, signature] = String(token || "").split(".");

  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token.");
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signSegment(signingInput, secret);

  if (signature.length !== expectedSignature.length) {
    throw new Error("Invalid token signature.");
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new Error("Invalid token signature.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));

  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired.");
  }

  return payload;
}
