"use client";

import { useEffect, useState } from "react";

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

export default function CargarParticipantePage() {
  const [step, setStep] = useState(1);

  const [nombre, setNombre] = useState("");

  const [apellido, setApellido] = useState("");

  const [carton, setCarton] = useState("");

  const [telefono, setTelefono] = useState("");

  const [groups, setGroups] = useState<Group[]>([]);

  const [matches, setMatches] = useState<Match[]>([]);

  const [selectedGroup, setSelectedGroup] = useState("");

  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const currentMatches = matches.filter(
    (match) => match.group === selectedGroup,
  );

  const handlePrediction = (matchId: string, result: PredictionResult) => {
    setPredictions((prev) => {
      const existing = prev.find((p) => p.matchId === matchId);

      if (existing) {
        return prev.map((p) =>
          p.matchId === matchId
            ? {
                ...p,
                result,
              }
            : p,
        );
      }

      return [
        ...prev,
        {
          matchId,
          result,
        },
      ];
    });
  };

  const getPrediction = (matchId: string) => {
    return predictions.find((p) => p.matchId === matchId);
  };

  const totalMatches = matches.length;

  const allPredictionsDone =
    predictions.length === totalMatches && totalMatches > 0;

  const handleContinue = () => {
    if (!nombre || !apellido || !carton) {
      return;
    }

    setStep(2);
  };

  const handleSubmit = () => {
    const payload = {
      participante: {
        nombre,
        apellido,
        carton,
        telefono,
      },

      predictions,
    };

    console.log(payload);

    alert("Participante y predicciones cargadas correctamente");
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-primary">
            Cargar Participante
          </h1>

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
                step >= 1
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary",
              )}
            >
              1
            </div>

            <span className="text-sm">Datos del participante</span>
          </div>

          <div className="h-[2px] w-16 bg-border" />

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                step >= 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary",
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
                Completa la información básica del participante.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre</label>

                  <Input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Juan"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Apellido</label>

                  <Input
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Número de cartón</label>

                <Input
                  value={carton}
                  onChange={(e) => setCarton(e.target.value)}
                  placeholder="Ej: 152"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Teléfono
                  <span className="text-muted-foreground ml-1">(opcional)</span>
                </label>

                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 3415551234"
                />
              </div>
              <Button className="w-full" onClick={handleContinue}>
                Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {nombre} {apellido}
                    </h2>

                    <p className="text-muted-foreground text-sm">
                      Cartón #{carton}
                    </p>
                    {telefono && (
                        <p>
                            Tel: {telefono}
                        </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Predicciones
                    </p>

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
                  className="min-w-[70px]"
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
                          <div className="text-4xl">{match.homeTeam.flag}</div>

                          <p className="font-semibold mt-2">
                            {match.homeTeam.name}
                          </p>
                        </div>

                        <div className="px-4 text-sm text-muted-foreground">
                          VS
                        </div>

                        <div className="text-center flex-1">
                          <div className="text-4xl">{match.awayTeam.flag}</div>

                          <p className="font-semibold mt-2">
                            {match.awayTeam.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={
                            getPrediction(match.id.toString())?.result ===
                            "home"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handlePrediction(match.id.toString(), "home")
                          }
                        >
                          Local
                        </Button>

                        <Button
                          variant={
                            getPrediction(match.id.toString())?.result ===
                            "draw"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handlePrediction(match.id.toString(), "draw")
                          }
                        >
                          Empate
                        </Button>

                        <Button
                          variant={
                            getPrediction(match.id.toString())?.result ===
                            "away"
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            handlePrediction(match.id.toString(), "away")
                          }
                        >
                          Visitante
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-4">
              <Button
                className="w-full"
                disabled={!allPredictionsDone}
                onClick={handleSubmit}
              >
                {allPredictionsDone
                  ? "Guardar Participante"
                  : `Faltan ${totalMatches - predictions.length} predicciones`}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
