import { createToken } from "../utils/jwt.js";
import { generateOAuthState, verifyOAuthState } from "../utils/oauth.js";
import {
  findUserByEmail,
  findUserByGoogleId,
  findUserByGithubId,
  createOAuthUser,
  linkOAuthProvider
} from "../repositories/userRepository.js";
import { seedDefaultCategories } from "./categoryService.js";
import { loadEnv } from "../utils/env.js";

function getFrontendUrl() {
  loadEnv();
  return (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
}

function getBackendUrl() {
  loadEnv();
  return (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, "");
}

function getGoogleConfig() {
  loadEnv();
  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    loadEnv(true);
    clientId = process.env.GOOGLE_CLIENT_ID;
    clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  }

  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL || `${getBackendUrl()}/api/auth/google/callback`;

  return { clientId, clientSecret, callbackUrl };
}

function getGithubConfig() {
  loadEnv();
  let clientId = process.env.GITHUB_CLIENT_ID;
  let clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    loadEnv(true);
    clientId = process.env.GITHUB_CLIENT_ID;
    clientSecret = process.env.GITHUB_CLIENT_SECRET;
  }

  const callbackUrl =
    process.env.GITHUB_CALLBACK_URL || `${getBackendUrl()}/api/auth/github/callback`;

  return { clientId, clientSecret, callbackUrl };
}

export function buildFrontendRedirect(token) {
  return `${getFrontendUrl()}/login?token=${encodeURIComponent(token)}`;
}

export function buildFrontendErrorRedirect(errorMessage) {
  return `${getFrontendUrl()}/login?oauth_error=${encodeURIComponent(errorMessage)}`;
}

/**
 * Generates the Google OAuth 2.0 authorization URL.
 */
export function getGoogleAuthUrl() {
  const { clientId, callbackUrl } = getGoogleConfig();

  if (!clientId) {
    throw new Error(
      "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in your environment."
    );
  }

  const state = generateOAuthState("google");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Handles the Google OAuth callback, code exchange, profile fetch, and user linking/creation.
 */
export async function handleGoogleCallback({ code, state, error, error_description }) {
  if (error) {
    if (error === "access_denied") {
      throw new Error("Google sign-in was cancelled. You can try again or use email and password.");
    }
    throw new Error(error_description || `Google authorization failed: ${error}`);
  }

  if (!code) {
    throw new Error("Authorization code not provided by Google.");
  }

  verifyOAuthState(state, "google");

  const { clientId, clientSecret, callbackUrl } = getGoogleConfig();

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth client credentials are not configured on the server.");
  }

  // 1. Exchange authorization code for tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code"
    })
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to exchange authorization code with Google.");
  }

  const tokens = await tokenResponse.json();
  const accessToken = tokens.access_token;

  if (!accessToken) {
    throw new Error("No access token received from Google.");
  }

  // 2. Fetch user profile from OpenID UserInfo endpoint
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to retrieve user profile from Google.");
  }

  const profile = await profileResponse.json();
  const { sub: googleId, email, email_verified, name, picture } = profile;

  if (!email) {
    throw new Error("No email address provided by your Google account.");
  }

  const isEmailVerified = email_verified === true || email_verified === "true";
  if (!isEmailVerified) {
    throw new Error("Your Google email address is unverified. Please verify your email with Google.");
  }

  // 3. User Resolution and Account Linking
  let user = null;

  // Check if user already exists with this Google ID
  const existingGoogleUser = await findUserByGoogleId(googleId);
  if (existingGoogleUser) {
    user = existingGoogleUser.toJSON();
  } else {
    // Check if an existing account has the same verified email
    const existingEmailUser = await findUserByEmail(email);
    if (existingEmailUser) {
      // Safely link Google ID to existing account
      const updates = { googleId };
      if (!existingEmailUser.avatarUrl && picture) {
        updates.avatarUrl = picture;
      }
      user = await linkOAuthProvider(existingEmailUser._id, updates);
    } else {
      // Create new user
      const displayName = (name || email.split("@")[0]).trim().slice(0, 50);
      user = await createOAuthUser({
        name: displayName.length >= 2 ? displayName : `${displayName} User`,
        email,
        googleId,
        avatarUrl: picture || "",
        authProvider: "google"
      });

      // Seed default expense and income categories for new user
      await seedDefaultCategories(user.id);
    }
  }

  const token = createToken({
    sub: user.id,
    email: user.email
  });

  return { token, user };
}

/**
 * Generates the GitHub OAuth authorization URL.
 */
export function getGithubAuthUrl() {
  const { clientId, callbackUrl } = getGithubConfig();

  if (!clientId) {
    throw new Error(
      "GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID in your environment."
    );
  }

  const state = generateOAuthState("github");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "read:user user:email",
    state
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Handles the GitHub OAuth callback, code exchange, profile + emails fetch, and user linking/creation.
 */
export async function handleGithubCallback({ code, state, error, error_description }) {
  if (error) {
    if (error === "access_denied") {
      throw new Error("GitHub sign-in was cancelled. You can try again or use email and password.");
    }
    throw new Error(error_description || `GitHub authorization failed: ${error}`);
  }

  if (!code) {
    throw new Error("Authorization code not provided by GitHub.");
  }

  verifyOAuthState(state, "github");

  const { clientId, clientSecret, callbackUrl } = getGithubConfig();

  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth client credentials are not configured on the server.");
  }

  // 1. Exchange authorization code for access token
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl
    })
  });

  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json().catch(() => ({}));
    throw new Error(errorData.error_description || "Failed to exchange authorization code with GitHub.");
  }

  const tokens = await tokenResponse.json();
  if (tokens.error) {
    throw new Error(tokens.error_description || `GitHub token error: ${tokens.error}`);
  }

  const accessToken = tokens.access_token;
  if (!accessToken) {
    throw new Error("No access token received from GitHub.");
  }

  // 2. Fetch GitHub user profile
  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FinTrack-ExpenseTracker"
    }
  });

  if (!profileResponse.ok) {
    throw new Error("Failed to retrieve user profile from GitHub.");
  }

  const profile = await profileResponse.json();
  const githubId = String(profile.id);
  let verifiedEmail = null;

  if (profile.email) {
    verifiedEmail = profile.email;
  }

  // If email is null/private, query the GitHub emails endpoint
  if (!verifiedEmail) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FinTrack-ExpenseTracker"
      }
    });

    if (emailsResponse.ok) {
      const emailsList = await emailsResponse.json();
      if (Array.isArray(emailsList)) {
        // Find primary verified email first, or any verified email
        const primaryVerified = emailsList.find((e) => e.primary && e.verified);
        const anyVerified = emailsList.find((e) => e.verified);
        verifiedEmail = primaryVerified?.email || anyVerified?.email || null;
      }
    }
  }

  if (!verifiedEmail) {
    throw new Error(
      "Unable to retrieve a verified email address from your GitHub account. Please ensure you have a verified email on GitHub or sign in with email and password."
    );
  }

  // 3. User Resolution and Account Linking
  let user = null;

  // Check if user already exists with this GitHub ID
  const existingGithubUser = await findUserByGithubId(githubId);
  if (existingGithubUser) {
    user = existingGithubUser.toJSON();
  } else {
    // Check if an existing account has the same verified email
    const existingEmailUser = await findUserByEmail(verifiedEmail);
    if (existingEmailUser) {
      // Safely link GitHub ID to existing account
      const updates = { githubId };
      if (!existingEmailUser.avatarUrl && profile.avatar_url) {
        updates.avatarUrl = profile.avatar_url;
      }
      user = await linkOAuthProvider(existingEmailUser._id, updates);
    } else {
      // Create new user
      const rawName = (profile.name || profile.login || verifiedEmail.split("@")[0]).trim();
      const displayName = rawName.slice(0, 50);
      user = await createOAuthUser({
        name: displayName.length >= 2 ? displayName : `${displayName} User`,
        email: verifiedEmail,
        githubId,
        avatarUrl: profile.avatar_url || "",
        authProvider: "github"
      });

      // Seed default expense and income categories for new user
      await seedDefaultCategories(user.id);
    }
  }

  const token = createToken({
    sub: user.id,
    email: user.email
  });

  return { token, user };
}
