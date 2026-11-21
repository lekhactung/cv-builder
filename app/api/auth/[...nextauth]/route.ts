import { NextRequest } from "next/server";
import { handlers } from "@/auth";

export async function GET(req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) {
  const params = await props.params;
  return (handlers.GET as any)(req, { params });
}

export async function POST(req: NextRequest, props: { params: Promise<{ nextauth: string[] }> }) {
  const params = await props.params;
  return (handlers.POST as any)(req, { params });
}
