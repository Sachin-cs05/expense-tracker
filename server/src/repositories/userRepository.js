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

export async function findUserById(id) {
  const user = await User.findById(id);
  return user ? user.toJSON() : null;
}