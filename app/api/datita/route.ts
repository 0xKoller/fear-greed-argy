import { NextResponse } from "next/server";

const TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

async function fetchData(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const [
      riesgoPais,
      riesgoPaisPrevio,
      inflacion,
      inflacionInteranual,
      plazoFijo,
      mercadoDinero,
      rentaVariable,
    ] = await Promise.all([
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo"
      ),
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/"
      ),
      fetchData("https://api.argentinadatos.com/v1/finanzas/indices/inflacion"),
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/indices/inflacionInteranual"
      ),
      fetchData("https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo"),
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo"
      ),
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/ultimo"
      ),
    ]);

    const economicData = {
      riesgoPais: riesgoPais.valor,
      inflacion:
        inflacion.length > 0
          ? inflacion[inflacion.length - 1].valor
          : undefined,
      inflacionInteranual:
        inflacionInteranual.length > 0
          ? inflacionInteranual[inflacionInteranual.length - 1].valor
          : undefined,
      plazoFijo,
      mercadoDinero: mercadoDinero.length > 0 ? mercadoDinero : undefined,
      rentaVariable: rentaVariable.length > 0 ? rentaVariable : undefined,
      riesgoPaisPrevio:
        riesgoPaisPrevio.length > 0
          ? riesgoPaisPrevio[riesgoPaisPrevio.length - 2].valor
          : undefined,
      inflacionPrevio:
        inflacion.length > 0
          ? inflacion[inflacion.length - 2].valor
          : undefined,
    };

    return NextResponse.json(economicData, {
      headers: {
        "Cache-Control": `s-maxage=${TIME}, stale-while-revalidate`,
      },
    });
  } catch (error) {
    console.error("Error fetching economic data:", error);
    return NextResponse.json(
      { error: "Failed to fetch economic data" },
      { status: 500 }
    );
  }
}
