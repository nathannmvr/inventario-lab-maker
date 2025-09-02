// Caminho completo do NOVO arquivo: src/app/api/admins/route.ts

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getAdmins, addAdmin, removeAdmin } from "../../../lib/db";

// Proteção: Garante que apenas um admin logado possa usar esta API
async function checkAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  // No nosso sistema, qualquer usuário com sessão é um admin, conforme a lógica do NextAuth
  return session;
}

// GET: Retorna a lista de administradores
export async function GET() {
  const session = await checkAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admins = await getAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST: Adiciona um novo administrador
export async function POST(request: Request) {
  const session = await checkAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email provided" }, { status: 400 });
    }
    await addAdmin(email);
    return NextResponse.json({ message: "Admin added successfully" }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE: Remove um administrador
export async function DELETE(request: Request) {
  const session = await checkAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email provided" }, { status: 400 });
    }
    await removeAdmin(email);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Retorna a mensagem de erro específica, como a de não poder remover o admin principal
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}