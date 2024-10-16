import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const TIME = 60 * 60; // Every hour after 1 hour

type DepositoData = {
  fecha: string;
  valor: number;
};

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
      dolarHistorico,
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
      fetchData("https://api.argentinadatos.com/v1/cotizaciones/dolares"),
    ]);

    let depositoData = { current: 0, previous: 0 };

    depositoData = calculateDepositoA30Dias(depositoA30Dias);
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
      depositoA30Dias: depositoData.current,
      depositoA30DiasPrevio: depositoData.previous,
      dolarOficial: dolarOficial.venta,
      dolarBlue: dolarBlue.venta,
      dolarHistorico: dolarHistorico,
      lastUpdated: new Date().toISOString(),
    };
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

export async function POST(request: Request) {
  const body = await request.json();
  if (body.revalidate === true) {
    revalidateTag("economic-data");
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }
  return NextResponse.json({ revalidated: false });
}

function calculateDepositoA30Dias(
  data: DepositoData[],
  isAnnualRate: boolean = false
): {
  current: number;
  previous: number;
} {
  if (!Array.isArray(data) || data.length < 2) {
    console.error("Invalid or insufficient data for calculateDepositoA30Dias");
    return { current: 0, previous: 0 };
  }

  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateB.getTime() - dateA.getTime();
  });

  const [currentMonth, previousMonth] = sortedData.slice(0, 2);

  if (!currentMonth || !previousMonth) {
    console.error("Insufficient data for two months");
    return { current: 0, previous: 0 };
  }

  const calculateRate = (valor: number) => {
    if (isAnnualRate) {
      return (Math.pow(1 + valor, 30 / 365) - 1) * 100;
    } else {
      return valor * 100;
    }
  };

  const currentRate = calculateRate(currentMonth.valor);
  const previousRate = calculateRate(previousMonth.valor);

  return {
    current: currentRate,
    previous: previousRate,
  };
}
