import { User } from "../models/User.js";

export async function createUser({ name, email, passwordHash }) {
  const user = await User.create({
    name,
    email,
    passwordHash
  });

  return user.toJSON();
}

export async function findUserByEmail(email) {
  return User.findOne({
    email: email.toLowerCase()
  });
}

export async function findUserByGoogleId(googleId) {
  return User.findOne({ googleId });
}

export async function findUserByGithubId(githubId) {
  return User.findOne({ githubId });
}

export async function createOAuthUser({ name, email, googleId, githubId, avatarUrl, authProvider }) {
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    googleId,
    githubId,
    avatarUrl,
    authProvider
  });

  return user.toJSON();
}

export async function linkOAuthProvider(id, updates) {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  return user ? user.toJSON() : null;
}

export async function findUserById(id) {
  const user = await User.findById(id);
  return user ? user.toJSON() : null;
}

export async function updateUser(id, updates) {
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return user ? user.toJSON() : null;
}

export async function deleteUserById(id) {
  return User.findByIdAndDelete(id);
}

export async function findUserDocumentById(id) {
  return User.findById(id);
}