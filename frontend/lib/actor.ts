import { api } from "@/lib/api";

export type Role = "ADMIN" | "CONSULTANT" | "ENGINEER";

export type Actor = {
  user_id: number | null;
  email: string;
  name: string;
  role: Role | null;
};

export async function fetchActor(): Promise<Actor> {
  const { data } = await api.get<Actor>("/auth/me");
  return data;
}
