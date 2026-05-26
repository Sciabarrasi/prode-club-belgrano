import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const resultEncoding = {
  home: { predictedHome: 1, predictedAway: 0 },
  draw: { predictedHome: 0, predictedAway: 0 },
  away: { predictedHome: 0, predictedAway: 1 },
} as const;

const schema = z.object({
  userId: z.string().min(1),
  predictions: z
    .array(
      z.object({
        matchId: z.number().int().positive(),
        result: z.enum(["home", "draw", "away"]),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(
      await cookies(),
      sessionOptions
    );

    if (!session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { userId, predictions } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "El participante no existe." }, { status: 404 });
    }

    if (targetUser.role !== "USER") {
      return NextResponse.json(
        { error: "Solo se pueden cargar predicciones a participantes USER." },
        { status: 400 }
      );
    }

    const results = await prisma.$transaction(
      predictions.map((p) => {
        const encoded = resultEncoding[p.result];
        return prisma.prediction.upsert({
          where: { userId_matchId: { userId, matchId: p.matchId } },
          create: { userId, matchId: p.matchId, ...encoded },
          update: { ...encoded },
        });
      })
    );

    return NextResponse.json({ ok: true, saved: results.length }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN PREDICTIONS POST ERROR]", error);
    return NextResponse.json(
      { error: "Error interno al guardar predicciones." },
      { status: 500 }
    );
  }
}