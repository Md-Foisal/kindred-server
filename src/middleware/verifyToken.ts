import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../lib/config.js";
import type { AuthUser } from "../lib/types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// better auth (jwt plugin) on the client app signs the token,
// we only need its public keys to check it
const jwks = createRemoteJWKSet(new URL(`${config.clientUrl}/api/auth/jwks`));

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const { payload } = await jwtVerify(header.slice(7), jwks, {
      issuer: config.clientUrl,
      audience: config.clientUrl,
    });

    if (typeof payload.email !== "string") {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    req.user = {
      id: String(payload.sub ?? payload.id ?? ""),
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : "",
      image: typeof payload.image === "string" ? payload.image : undefined,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}
