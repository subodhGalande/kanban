import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getUserId() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.id) return null;

  return payload.id as string;
}
