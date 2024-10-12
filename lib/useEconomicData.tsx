import { useEffect, useState } from "react";

type NormalizedScore = number;

type DepositoData = {
  fecha: string;
  valor: number;
};

type DolarHistorico = {
  fecha: string;
  venta: number;
};

// Add type for the economic data
type EconomicData = {
  riesgoPais: number | null;
  inflacion: number | null;
  inflacionInteranual: number | null;
  plazoFijo: number | null;
  mercadoDinero: number | null;
  rentaVariable: number | null;
  riesgoPaisPrevio: number | null;
  inflacionPrevio: number | null;
  dolarOficial: number | null;
  dolarBlue: number | null;
  depositoA30Dias: DepositoData[];
  dolarHistorico: DolarHistorico[];
};

function calculateDepositoA30Dias(
  data: DepositoData[],
  isAnnualRate: boolean = false
): {
  current: number;
  previous: number;
} {
  // Check if data is an array and has at least two elements
  if (!Array.isArray(data) || data.length < 2) {
    console.error("Invalid or insufficient data for calculateDepositoA30Dias");
    return { current: 0, previous: 0 };
  }

  // Sort the data by date in descending order
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.fecha);
    const dateB = new Date(b.fecha);
    return dateB.getTime() - dateA.getTime();
  });

  // Get the two most recent entries
  const [currentMonth, previousMonth] = sortedData.slice(0, 2);

  // Ensure we have data for both months
  if (!currentMonth || !previousMonth) {
    console.error("Insufficient data for two months");
    return { current: 0, previous: 0 };
  }

  // Calculate the rate based on whether it's annual or already a 30-day rate
  const calculateRate = (valor: number) => {
    if (isAnnualRate) {
      return (Math.pow(1 + valor, 30 / 365) - 1) * 100;
    } else {
      return valor * 100; // If it's already a 30-day rate, just convert to percentage
    }
  };

  const currentRate = calculateRate(currentMonth.valor);
  const previousRate = calculateRate(previousMonth.valor);

  return {
    current: currentRate,
    previous: previousRate,
  };
}

export function useEconomicData() {
  const [data, setData] = useState<EconomicData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/datita");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      }
    }
    fetchData();
  }, []);

  let depositoData = { current: 0, previous: 0 };
  if (
    data?.depositoA30Dias &&
    Array.isArray(data.depositoA30Dias) &&
    data.depositoA30Dias.length >= 2
  ) {
    const isAnnualRate = false;
    depositoData = calculateDepositoA30Dias(data.depositoA30Dias, isAnnualRate);
  } else {
    console.error("Invalid depositoA30Dias data:", data?.depositoA30Dias);
  }

  return {
    riesgoPais: data?.riesgoPais ?? null,
    inflacion: data?.inflacion ?? null,
    inflacionInteranual: data?.inflacionInteranual ?? null,
    plazoFijo: data?.plazoFijo ?? null,
    mercadoDinero: data?.mercadoDinero ?? null,
    rentaVariable: data?.rentaVariable ?? null,
    riesgoPaisPrevio: data?.riesgoPaisPrevio ?? null,
    inflacionPrevio: data?.inflacionPrevio ?? null,
    depositoA30Dias: depositoData.current,
    depositoA30DiasPrevio: depositoData.previous,
    dolarOficial: data?.dolarOficial ?? null,
    dolarBlue: data?.dolarBlue ?? null,
    dolarHistorico: data?.dolarHistorico ?? null,
    isLoading: !error && !data,
    isError: error,
  };
}

function normalize(value: number, min: number, max: number): NormalizedScore {
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
}

// Invert normalized values (for indicators where higher is worse)
function normalizeAndInvert(
  value: number,
  min: number,
  max: number
): NormalizedScore {
  return 100 - normalize(value, min, max);
}
export function calculateFearGreedIndex() {
  const data = useEconomicData();
  const weights = {
    riesgoPais: 0.2,
    inflacionInteranual: 0.2,
    inflacion: 0.15,
    depositoA30Dias: 0.15,
    depositoA30DiasPrevio: 0.15,
    dolarBreach: 0.15,
  };

  const scores: Record<string, NormalizedScore> = {
    riesgoPais: normalizeAndInvert(data.riesgoPais ?? 0, 0, 2500),
    inflacionInteranual: normalizeAndInvert(
      data.inflacionInteranual ?? 0,
      0,
      400
    ),
    inflacion: normalizeAndInvert(data.inflacion ?? 0, 0, 15),
    depositoA30Dias: normalize(data.depositoA30Dias ?? 0, 0, 1),
    depositoA30DiasPrevio: normalize(data.depositoA30DiasPrevio ?? 0, 0, 1),
    dolarBreach: 0, // We'll calculate this below
  };

  // Calculate the dollar breach score
  if (data.dolarOficial !== null && data.dolarBlue !== null) {
    const breach = (data.dolarBlue - data.dolarOficial) / data.dolarOficial;
    scores.dolarBreach = normalizeAndInvert(breach, 0, 1);
  }

  let index = 0;
  for (const [key, weight] of Object.entries(weights)) {
    index += scores[key as keyof typeof scores] * weight;
  }

  index = Math.min(Math.max(index, 0), 100);
  return {
    index,
    inflacion: data.inflacion,
    inflacionInteranual: data.inflacionInteranual,
    riesgoPais: data.riesgoPais,
    riesgoPaisPrevio: data.riesgoPaisPrevio,
    inflacionPrevio: data.inflacionPrevio,
    depositoA30Dias: data.depositoA30Dias,
    depositoA30DiasPrevio: data.depositoA30DiasPrevio,
    dolarOficial: data.dolarOficial,
    dolarBlue: data.dolarBlue,
    dolarHistorico: data.dolarHistorico,
    scores,
    weights,
  };
}

export function interpretIndex(index: number): string {
  if (index < 0 || index > 100) {
    return "Invalid Index Value";
  } else if (index >= 0 && index < 20) {
    return "La salida es Ezeiza";
  } else if (index >= 20 && index < 40) {
    return "Tal vez me quede";
  } else if (index >= 40 && index < 60) {
    return "Aguantamos";
  } else if (index >= 60 && index < 80) {
    return "Estamos de perlangas";
  } else {
    return "La entrada es Ezeiza";
  }
}
