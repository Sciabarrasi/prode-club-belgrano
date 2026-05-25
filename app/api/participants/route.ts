import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createParticipantSchema = z.object({
  firstName: z.string().min(1, "El nombre es obligatorio"),
  lastName: z.string().min(1, "El apellido es obligatorio"),
  ticketNumber: z
    .number({ invalid_type_error: "El número de cartón debe ser un número" })
    .int()
    .positive("El número de cartón debe ser positivo"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const parsed = createParticipantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { firstName, lastName, ticketNumber, email, phone } = parsed.data;

  const existingTicket = await prisma.user.findUnique({
    where: { ticketNumber },
  });
  if (existingTicket) {
    return NextResponse.json(
      { error: `El cartón #${ticketNumber} ya está registrado.` },
      { status: 409 }
    );
  }

  const normalizedEmail = email && email.trim() !== "" ? email.trim() : null;
  if (normalizedEmail) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return NextResponse.json(
        { error: "El email ya está registrado." },
        { status: 409 }
      );
    }
  }

  const temporaryPassword = `carton${ticketNumber}`;
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        ticketNumber,
        email: normalizedEmail ?? `carton${ticketNumber}@sin-email.local`,
        phone: phone?.trim() ?? "",
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        ticketNumber: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Participante registrado correctamente.",
        user: newUser,
        temporaryPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/participants] Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      ticketNumber: true,
      email: true,
      phone: true,
      points: true,
      createdAt: true,
    },
    orderBy: { ticketNumber: "asc" },
  });

  return NextResponse.json({ users });
}