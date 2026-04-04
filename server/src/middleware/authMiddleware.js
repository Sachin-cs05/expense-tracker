import { findUserById } from "../repositories/userRepository.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(request, response, next) {
  try {
    const authorization = request.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = verifyToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    request.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token." });
  }
}
