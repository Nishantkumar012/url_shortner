import type { Request, Response } from "express";
import type { z } from "zod";
import { registerUser } from "./authService";
import { registerSchema } from "./authSchema";

type RegisterInput = z.infer<typeof registerSchema>;

export async function register(req: Request, res: Response) {
  // req.body is already validated + parsed by the `validateBody` middleware,
  // so we can trust its shape here.
  const input = req.body as RegisterInput;

  const user = await registerUser(input);

  res.status(201).json({ status: "success", data: user });
}
