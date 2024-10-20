import { NextResponse } from "next/server";

type DepositoData = {
  fecha: string;
  valor: number;
};

async function fetchData(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function GET() {
  try {
    const [
      riesgoPais,
      riesgoPaisHistorico,
      inflacion,
      inflacionInteranualHistorico,
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

    const dolarHistoricoYear = dolarHistorico.slice(-2625);
    const dolarHistorico90Days = dolarHistorico.slice(-651);
    const dolarPrevio = dolarHistorico.slice(-14);
    const dolarOficialPrevio = dolarPrevio[0].venta;
    const dolarBluePrevio = dolarPrevio[1].venta;
    const dolarOficial90Days = dolarHistorico90Days[0].venta;
    const dolarBlue90Days = dolarHistorico90Days[1].venta;
    const dolarOficialYear = dolarHistoricoYear[0].venta;
    const dolarBlueYear = dolarHistoricoYear[1].venta;

    let riesgoPaisYear = riesgoPaisHistorico.slice(-367);
    let riesgoPaisPrevio = riesgoPaisHistorico.slice(-2);
    let riesgoPais90Days = riesgoPaisHistorico.slice(-93);

    const inflacionInteranual =
      inflacionInteranualHistorico[inflacionInteranualHistorico.length - 1]
        .valor;

    let inflacionInteranualYear = inflacionInteranualHistorico.slice(-12);
    inflacionInteranualYear = inflacionInteranualYear[0].valor;
    let inflacionInteranualPrevio = inflacionInteranualHistorico.slice(-2);
    inflacionInteranualPrevio = inflacionInteranualPrevio[0].valor;
    let inflacionInteranual90Days = inflacionInteranualHistorico.slice(-3);
    inflacionInteranual90Days = inflacionInteranual90Days[0].valor;

    let depositoData = { current: 0, previous: 0 };

    depositoData = calculateDepositoA30Dias(depositoA30Dias);
    const economicData = {
      riesgoPais: riesgoPais.valor,
      riesgoPaisYear: riesgoPaisYear[0].valor,
      riesgoPaisPrevio: riesgoPaisPrevio[0].valor,
      riesgoPais90Days: riesgoPais90Days[0].valor,
      inflacion:
        inflacion.length > 0
          ? inflacion[inflacion.length - 1].valor
          : undefined,
      inflacionInteranual: inflacionInteranual,
      inflacionInteranualYear: inflacionInteranualYear,
      inflacionInteranualPrevio: inflacionInteranualPrevio,
      inflacionInteranual90Days: inflacionInteranual90Days,
      inflacionPrevio:
        inflacion.length > 0
          ? inflacion[inflacion.length - 2].valor
          : undefined,
      depositoA30Dias: depositoData.current,
      depositoA30DiasPrevio: depositoData.previous,
      dolarOficial: dolarOficial.venta,
      dolarBlue: dolarBlue.venta,
      dolarOficialPrevio: dolarOficialPrevio,
      dolarBluePrevio: dolarBluePrevio,
      dolarOficial90Days: dolarOficial90Days,
      dolarBlue90Days: dolarBlue90Days,
      dolarOficialYear: dolarOficialYear,
      dolarBlueYear: dolarBlueYear,
    };
    return NextResponse.json(economicData);
  } catch (error) {
    console.error("Error fetching economic data:", error);
    return NextResponse.json(
      { error: "Failed to fetch economic data" },
      { status: 500 }
    );
  }
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
