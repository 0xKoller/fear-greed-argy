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
  dolarBlueHistorico: number | null;
  dolarOficialHistorico: number | null;
  depositoA30Dias: number | null;
  depositoA30DiasPrevio: number | null;
  dolarHistorico: DolarHistorico[];
  lastUpdated: string | null;
};

const CACHE_KEY = "economicData";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export function useEconomicData() {
  const [data, setData] = useState<EconomicData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data: storedData, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setData(storedData);
            return;
          }
        }

        const response = await fetch("/api/datita");
        const result = await response.json();
        // Add a check for depositoA30Dias
        if (!result.depositoA30Dias) {
          console.warn("API response is missing depositoA30Dias data");
          result.depositoA30Dias = []; // Set a default empty array
        }

        setData(result);

        // Cache the new data
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: result,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      }
    }
    fetchData();
  }, []);

  return {
    riesgoPais: data?.riesgoPais ?? null,
    inflacion: data?.inflacion ?? null,
    inflacionInteranual: data?.inflacionInteranual ?? null,
    plazoFijo: data?.plazoFijo ?? null,
    mercadoDinero: data?.mercadoDinero ?? null,
    rentaVariable: data?.rentaVariable ?? null,
    riesgoPaisPrevio: data?.riesgoPaisPrevio ?? null,
    inflacionPrevio: data?.inflacionPrevio ?? null,
    depositoA30Dias: data?.depositoA30Dias ?? null,
    depositoA30DiasPrevio: data?.depositoA30DiasPrevio ?? null,
    dolarOficial: data?.dolarOficial ?? null,
    dolarBlue: data?.dolarBlue ?? null,
    dolarHistorico: data?.dolarHistorico ?? null,
    lastUpdated: data?.lastUpdated ?? null,
    isLoading: !error && !data,
    isError: error,
  };
}

function normalize(value: number, min: number, max: number): NormalizedScore {
  return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
}

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
    dolarBreach: 0,
  };

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
    lastUpdated: data.lastUpdated,
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
