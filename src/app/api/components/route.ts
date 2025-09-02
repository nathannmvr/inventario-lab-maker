import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import {
  getComponents,
  addComponent,
  updateStock,
  deleteComponent
} from "../../../lib/db";

// GET (Público)
export async function GET() {
  try {
    const components = await getComponents();
    return NextResponse.json(components);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST (Protegido)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // CORREÇÃO: Adicionamos 'defective' aqui
    const { name, available, defective } = await request.json();
    const newComponent = await addComponent(name, available, defective); // Passa o valor para o addComponent
    return NextResponse.json(newComponent, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT (Protegido)
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { componentId, action } = await request.json();
        const updatedComponent = await updateStock(componentId, action);
        return NextResponse.json(updatedComponent);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

// DELETE (Protegido)
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { componentId } = await request.json();
        await deleteComponent(componentId);
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}