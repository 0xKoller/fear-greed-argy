import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const TIME = 10 * 1000; // 10 seconds in milliseconds

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
      depositoA30Dias,
      dolarOficial,
      dolarBlue,
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
      fetchData(
        "https://api.argentinadatos.com/v1/finanzas/tasas/depositos30Dias"
      ),
      fetchData("https://dolarapi.com/v1/dolares/oficial"),
      fetchData("https://dolarapi.com/v1/dolares/blue"),
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
      riesgoPaisPrevio:
        riesgoPaisPrevio.length > 0
          ? riesgoPaisPrevio[riesgoPaisPrevio.length - 2].valor
          : undefined,
      inflacionPrevio:
        inflacion.length > 0
          ? inflacion[inflacion.length - 2].valor
          : undefined,
      depositoA30Dias: depositoA30Dias.length > 0 ? depositoA30Dias : undefined,
      dolarOficial: dolarOficial.venta,
      dolarBlue: dolarBlue.venta,
    };
    // Add a revalidation tag
    revalidateTag("economic-data");

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

// New function to trigger revalidation
export async function POST(request: Request) {
  const body = await request.json();
  if (body.revalidate === true) {
    revalidateTag("economic-data");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }
  return NextResponse.json({ revalidated: false });
}
