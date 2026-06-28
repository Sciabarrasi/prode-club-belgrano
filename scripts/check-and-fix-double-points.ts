import { prisma } from "@/lib/prisma"

const DOUBLE_POINTS_MATCHES = [13, 21, 32, 39, 46, 54, 66]

async function checkAndFix() {
  console.log("🔍 Verificando puntos dobles...\n")

  const allPredictions = await prisma.prediction.findMany({
    where: {
      matchId: { in: DOUBLE_POINTS_MATCHES },
    },
    include: {
      user: true
    }
  })

  console.log(`📊 Total predicciones en partidos dobles: ${allPredictions.length}`)

  const with0Points = allPredictions.filter(p => p.pointsEarned === 0)
  const with1Point = allPredictions.filter(p => p.pointsEarned === 1)
  const with2Points = allPredictions.filter(p => p.pointsEarned === 2)

  console.log(`\n📋 Estado actual:`)
  console.log(`   - 0 puntos: ${with0Points.length}`)
  console.log(`   - 1 punto: ${with1Point.length}`)
  console.log(`   - 2 puntos: ${with2Points.length}`)

  if (with1Point.length > 0) {
    console.log(`\n🔧 Usuarios con 1 punto en partidos dobles (deberían tener 2):`)
    for (const p of with1Point) {
      console.log(`   - ${p.user.firstName} ${p.user.lastName} - Partido ${p.matchId}`)
    }

    console.log(`\n🔄 Corrigiendo...`)
    let fixed = 0
    for (const p of with1Point) {
      await prisma.$transaction([
        prisma.prediction.update({
          where: { id: p.id },
          data: { pointsEarned: 2 }
        }),
        prisma.user.update({
          where: { id: p.userId },
          data: { points: { increment: 1 } }
        })
      ])
      fixed++
    }
    console.log(`✅ Corregidos ${fixed} usuarios`)
  } else {
    console.log(`\n✅ No hay predicciones con 1 punto que corregir`)
  }

  const unscored = with0Points.filter(p => p.scored === false)
  if (unscored.length > 0) {
    console.log(`\n⚠️ Predicciones sin procesar (scored=false): ${unscored.length}`)
    console.log(`   Ejecuta "Refrescar resultados" para procesarlas`)
  }

  console.log(`\n✅ Verificación completada`)
}

checkAndFix()
  .catch(console.error)
  .finally(() => prisma.$disconnect())