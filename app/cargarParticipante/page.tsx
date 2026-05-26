"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchGroups, fetchMatches, Group, Match } from "@/lib/matches-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PredictionResult = "home" | "draw" | "away";

interface Prediction {
  matchId: string;
  result: PredictionResult;
}

interface FormState {
  firstName: string;
  lastName: string;
  ticketNumber: string;
  email: string;
  phone: string;
}

interface CreatedUser {
  id: string;
  firstName: string;
  lastName: string;
  ticketNumber: number;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  ticketNumber: "",
  email: "",
  phone: "",
};

export default function CargarParticipantePage() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  const [savingPredictions, setSavingPredictions] = useState(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [groupsData, matchesData] = await Promise.all([
          fetchGroups(),
          fetchMatches(),
        ]);
        setGroups(groupsData);
        setMatches(matchesData);
        setSelectedGroup(groupsData[0]?.name ?? "");
      } finally {
        setLoadingMatches(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRegister = async () => {
    setError(null);
    setFieldErrors({});

    if (!form.firstName.trim() || !form.lastName.trim() || !form.ticketNumber.trim()) {
      setError("Nombre, apellido y número de cartón son obligatorios.");
      return;
    }

    const ticketNumber = parseInt(form.ticketNumber, 10);
    if (isNaN(ticketNumber) || ticketNumber <= 0) {
      setFieldErrors({ ticketNumber: ["El número de cartón debe ser un número positivo."] });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          ticketNumber,
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          setError(data.error ?? "Error al registrar el participante.");
        }
        return;
      }

      setCreatedUser(data.user);
      setStep(2);
    } catch {
      setError("Error de red. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentMatches = matches.filter((m) => m.group === selectedGroup);
  const totalMatches = matches.length;
  const allPredictionsDone = predictions.length === totalMatches && totalMatches > 0;

  const handlePrediction = (matchId: string, result: PredictionResult) => {
    setPredictions((prev) => {
      const existing = prev.find((p) => p.matchId === matchId);
      if (existing) {
        return prev.map((p) => (p.matchId === matchId ? { ...p, result } : p));
      }
      return [...prev, { matchId, result }];
    });
  };

  const getPrediction = (matchId: string) =>
    predictions.find((p) => p.matchId === matchId);

  const handleSubmit = async () => {
    if (!createdUser) return;

    setSavingPredictions(true);
    setPredictionsError(null);

    try {
      const res = await fetch("/api/admin/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: createdUser.id,
          predictions: predictions.map((p) => ({
            matchId: parseInt(p.matchId, 10),
            result: p.result,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPredictionsError(data.error ?? "Error al guardar predicciones.");
        return;
      }

      setStep(1);
      setForm(EMPTY_FORM);
      setCreatedUser(null);
      setPredictions([]);
      setSelectedGroup(groups[0]?.name ?? "");
      alert(
        `✓ ${createdUser.firstName} ${createdUser.lastName} registrado con ${data.saved} predicciones.`
      );
    } catch {
      setPredictionsError("Error de red. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setSavingPredictions(false);
    }
  };

  if (loadingMatches) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold text-primary">Cargar Participante</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro y carga de predicciones
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              1
            </div>
            <span className="text-sm">Datos del participante</span>
          </div>
          <div className="h-0.5 w-16 bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary",
              )}
            >
              2
            </div>
            <span className="text-sm">Predicciones</span>
          </div>
        </div>

        {step === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Datos del participante</CardTitle>
              <CardDescription>
                Nombre, apellido y cartón son obligatorios. Los demás campos son opcionales.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Juan"
                    disabled={submitting}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-destructive">{fieldErrors.firstName[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Apellido <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Pérez"
                    disabled={submitting}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-destructive">{fieldErrors.lastName[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Número de cartón <span className="text-destructive">*</span>
                </label>
                <Input
                  name="ticketNumber"
                  value={form.ticketNumber}
                  onChange={handleChange}
                  placeholder="Ej: 152"
                  type="number"
                  min={1}
                  disabled={submitting}
                />
                {fieldErrors.ticketNumber && (
                  <p className="text-xs text-destructive">{fieldErrors.ticketNumber[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Email{" "}
                  <span className="text-muted-foreground text-xs">(opcional)</span>
                </label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                  type="email"
                  disabled={submitting}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Teléfono{" "}
                  <span className="text-muted-foreground text-xs">(opcional)</span>
                </label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Ej: 3415551234"
                  type="tel"
                  disabled={submitting}
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
                )}
              </div>

              <Button className="w-full" onClick={handleRegister} disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Registrando...
                  </span>
                ) : (
                  "Continuar"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && createdUser && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {createdUser.firstName} {createdUser.lastName}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Cartón #{createdUser.ticketNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Predicciones</p>
                    <p className="text-2xl font-bold text-primary">
                      {predictions.length}/{totalMatches}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {groups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.name ? "default" : "outline"}
                  onClick={() => setSelectedGroup(group.name)}
                  className="min-w-17.5"
                >
                  {group.name}
                </Button>
              ))}
            </div>

            <div className="grid gap-4">
              {currentMatches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between">
                        <div className="text-center flex-1">
                          <Image
                            src={match.homeTeam.flagUrl}
                            alt={match.homeTeam.name}
                            width={40}
                            height={28}
                            className="object-cover rounded mx-auto"
                          />
                          <p className="font-semibold mt-2">{match.homeTeam.name}</p>
                        </div>
                        <div className="px-4 text-sm text-muted-foreground">VS</div>
                        <div className="text-center flex-1">
                          <Image
                            src={match.awayTeam.flagUrl}
                            alt={match.awayTeam.name}
                            width={40}
                            height={28}
                            className="object-cover rounded mx-auto"
                          />
                          <p className="font-semibold mt-2">{match.awayTeam.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(["home", "draw", "away"] as const).map((result) => (
                          <Button
                            key={result}
                            variant={
                              getPrediction(match.id.toString())?.result === result
                                ? "default"
                                : "outline"
                            }
                            onClick={() => handlePrediction(match.id.toString(), result)}
                          >
                            {result === "home"
                              ? "Local"
                              : result === "draw"
                              ? "Empate"
                              : "Visitante"}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4 space-y-2">
              {predictionsError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {predictionsError}
                </div>
              )}
              <Button
                className="w-full"
                disabled={!allPredictionsDone || savingPredictions}
                onClick={handleSubmit}
              >
                {savingPredictions ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : allPredictionsDone ? (
                  "Guardar Participante"
                ) : (
                  `Faltan ${totalMatches - predictions.length} predicciones`
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}