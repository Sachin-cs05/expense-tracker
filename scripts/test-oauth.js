import assert from "node:assert";
import { generateOAuthState, verifyOAuthState } from "../server/src/utils/oauth.js";

// Set test environment
process.env.JWT_SECRET = "test_super_secret_jwt_key_at_least_32_characters";
process.env.GOOGLE_CLIENT_ID = "test-google-id.apps.googleusercontent.com";
process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";
process.env.GITHUB_CLIENT_ID = "test-github-id";
process.env.GITHUB_CLIENT_SECRET = "test-github-secret";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.BACKEND_URL = "http://localhost:4000";

console.log("▶ Testing OAuth State Generation & Verification...");

// 1. Google State
const googleState = generateOAuthState("google");
assert(typeof googleState === "string", "googleState should be a string");
assert(googleState.includes("."), "googleState should contain signature separator");

const verifiedGoogle = verifyOAuthState(googleState, "google");
assert.strictEqual(verifiedGoogle.provider, "google", "Provider must match");
assert(verifiedGoogle.timestamp <= Date.now(), "Timestamp should be valid");
assert(verifiedGoogle.nonce, "Nonce should be present");
console.log("✔ Google state generation and cryptographic verification passed.");

// 2. GitHub State
const githubState = generateOAuthState("github");
const verifiedGithub = verifyOAuthState(githubState, "github");
assert.strictEqual(verifiedGithub.provider, "github", "Provider must match");
console.log("✔ GitHub state generation and cryptographic verification passed.");

// 3. Provider Mismatch Rejection
assert.throws(
  () => verifyOAuthState(googleState, "github"),
  /OAuth state provider mismatch/,
  "Should reject when state is submitted to wrong provider"
);
console.log("✔ Provider mismatch rejection passed.");

// 4. Tamper Detection
const [payload, signature] = googleState.split(".");
const tamperedPayload = Buffer.from(JSON.stringify({ provider: "google", timestamp: Date.now(), nonce: "fake" })).toString("base64url");
assert.throws(
  () => verifyOAuthState(`${tamperedPayload}.${signature}`, "google"),
  /Invalid OAuth state signature/,
  "Should reject tampered state payloads"
);
console.log("✔ Tamper detection passed.");

// 5. URL Generation Tests
import {
  getGoogleAuthUrl,
  getGithubAuthUrl,
  buildFrontendRedirect,
  buildFrontendErrorRedirect
} from "../server/src/services/oauthService.js";

const googleUrl = getGoogleAuthUrl();
assert(googleUrl.startsWith("https://accounts.google.com/o/oauth2/v2/auth"), "Google URL must use v2 auth endpoint");
assert(googleUrl.includes("client_id=test-google-id.apps.googleusercontent.com"), "Google URL must contain client_id");
assert(googleUrl.includes("redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Fgoogle%2Fcallback"), "Google URL must contain encoded callback URI");
assert(googleUrl.includes("openid"), "Google URL must request openid scope");
console.log("✔ Google OAuth URL generation passed:", googleUrl);

const githubUrl = getGithubAuthUrl();
assert(githubUrl.startsWith("https://github.com/login/oauth/authorize"), "GitHub URL must use OAuth authorize endpoint");
assert(githubUrl.includes("client_id=test-github-id"), "GitHub URL must contain client_id");
assert(githubUrl.includes("redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2Fgithub%2Fcallback"), "GitHub URL must contain encoded callback URI");
console.log("✔ GitHub OAuth URL generation passed:", githubUrl);

// 6. Frontend Redirect Formats
const successRedirect = buildFrontendRedirect("fake-jwt-token-123");
assert.strictEqual(successRedirect, "http://localhost:5173/login?token=fake-jwt-token-123", "Redirect URL must match");

const errorRedirect = buildFrontendErrorRedirect("Google sign-in was cancelled.");
assert.strictEqual(errorRedirect, "http://localhost:5173/login?oauth_error=Google%20sign-in%20was%20cancelled.", "Error redirect must match");
console.log("✔ Frontend redirect helpers passed.");

console.log("\n All OAuth Unit and Security Verification Checks Passed!");
