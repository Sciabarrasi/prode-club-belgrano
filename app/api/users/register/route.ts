import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { ticketNumber, firstName, lastName, email, phone, password, role } = await req.json();

    if (!ticketNumber || !firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (typeof ticketNumber !== "number" || ticketNumber <= 0) {
      return NextResponse.json(
        { error: "El número de cartón debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (password.length <= 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener más de 8 caracteres" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    const existingTicket = await prisma.user.findUnique({ where: { ticketNumber } });
    if (existingTicket) {
      return NextResponse.json(
        { error: "El número de cartón ya está registrado" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        ticketNumber,
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        role: role ?? "USER",
      },
      select: {
        id: true,
        ticketNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario creado exitosamente", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}