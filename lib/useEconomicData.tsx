import { useEffect, useState } from "react";

type NormalizedScore = number;

// Add type for the economic data
type EconomicData = {
  riesgoPais: number | null;
  inflacion: number | null;
  inflacion90Days: number | null;
  inflacionYear: number | null;
  inflacionInteranual: number | null;
  inflacionInteranualYear: number | null;
  inflacionInteranualPrevio: number | null;
  inflacionInteranual90Days: number | null;
  plazoFijo: number | null;
  mercadoDinero: number | null;
  rentaVariable: number | null;
  riesgoPaisPrevio: number | null;
  riesgoPaisYear: number | null;
  riesgoPais90Days: number | null;
  inflacionPrevio: number | null;
  dolarOficial: number | null;
  dolarBlue: number | null;
  dolarBlueHistorico: number | null;
  dolarOficialHistorico: number | null;
  depositoA30Dias: number | null;
  depositoA30DiasPrevio: number | null;
  dolarOficialPrevio: number | null;
  dolarBluePrevio: number | null;
  dolarOficial90Days: number | null;
  dolarBlue90Days: number | null;
  dolarOficialYear: number | null;
  dolarBlueYear: number | null;
  lastUpdated: string | null;
  imf: {
    NGDP_RPCH?: number; // Real GDP growth
    PCPIPCH?: number; // Inflation, average consumer prices
    LUR?: number; // Unemployment rate
    BCA_NGDPD?: number; // Current account balance (% of GDP)
    GGXWDG_NGDP?: number; // General government gross debt (% of GDP)
    GGXCNL_NGDP?: number; // General government net lending/borrowing (% of GDP)
    NGDPDPC?: number; // GDP per capita, current prices
    NID_NGDP?: number; // Total investment (% of GDP)
    NGSD_NGDP?: number; // Gross national savings (% of GDP)
    PPPEX?: number; // Implied PPP conversion rate
  };
};

export function useEconomicData() {
  const [data, setData] = useState<EconomicData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/datita");
        if (response.status === 500 || response.status === 404) {
          setData(null);
        } else {
          const result = await response.json();
          // Add a check for depositoA30Dias
          if (!result.depositoA30Dias) {
            console.warn("API response is missing depositoA30Dias data");
            result.depositoA30Dias = []; // Set a default empty array
          }

          setData(result);

          // Cache the new data
        }
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
    inflacion90Days: data?.inflacion90Days ?? null,
    inflacionYear: data?.inflacionYear ?? null,
    inflacionInteranual: data?.inflacionInteranual ?? null,
    inflacionInteranualYear: data?.inflacionInteranualYear ?? null,
    inflacionInteranualPrevio: data?.inflacionInteranualPrevio ?? null,
    inflacionInteranual90Days: data?.inflacionInteranual90Days ?? null,
    plazoFijo: data?.plazoFijo ?? null,
    mercadoDinero: data?.mercadoDinero ?? null,
    rentaVariable: data?.rentaVariable ?? null,
    riesgoPaisPrevio: data?.riesgoPaisPrevio ?? null,
    riesgoPaisYear: data?.riesgoPaisYear ?? null,
    riesgoPais90Days: data?.riesgoPais90Days ?? null,
    inflacionPrevio: data?.inflacionPrevio ?? null,
    depositoA30Dias: data?.depositoA30Dias ?? null,
    depositoA30DiasPrevio: data?.depositoA30DiasPrevio ?? null,
    dolarOficial: data?.dolarOficial ?? null,
    dolarBlue: data?.dolarBlue ?? null,
    dolarOficialPrevio: data?.dolarOficialPrevio ?? null,
    dolarBluePrevio: data?.dolarBluePrevio ?? null,
    dolarOficial90Days: data?.dolarOficial90Days ?? null,
    dolarBlue90Days: data?.dolarBlue90Days ?? null,
    dolarOficialYear: data?.dolarOficialYear ?? null,
    dolarBlueYear: data?.dolarBlueYear ?? null,
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
  const { processedData: imfData } = useIMFData();

  //@ts-ignore
  if (data?.status == false) {
    return { status: false };
  }

  const weights = {
    riesgoPais: 0.2,
    inflacionInteranual: 0.2,
    inflacion: 0.05,
    depositoA30Dias: 0.15,
    dolarBreach: 0.2,
    gdpGrowth: 0.1,
    governmentDebt: 0.1,
  };

  const currentYear = new Date().getFullYear().toString();

  const scores: Record<string, NormalizedScore> = {
    riesgoPais: normalizeAndInvert(data.riesgoPais ?? 0, 0, 2500),
    inflacionInteranual: normalizeAndInvert(
      data.inflacionInteranual ?? 0,
      0,
      400
    ),
    inflacion: normalizeAndInvert(data.inflacion ?? 0, 0, 15),
    depositoA30Dias: normalize(data.depositoA30Dias ?? 0, 0, 1),
    dolarBreach: 0,
    gdpGrowth: normalize(imfData?.gdpGrowth?.[currentYear] ?? 0, -10, 10),
    governmentDebt: normalizeAndInvert(
      imfData?.govDebt?.[currentYear] ?? 0,
      0,
      150
    ),
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
    inflacion90Days: data.inflacion90Days,
    inflacionYear: data.inflacionYear,
    inflacionInteranual: data.inflacionInteranual,
    inflacionInteranualYear: data.inflacionInteranualYear,
    inflacionInteranualPrevio: data.inflacionInteranualPrevio,
    inflacionInteranual90Days: data.inflacionInteranual90Days,
    riesgoPais: data.riesgoPais,
    riesgoPaisPrevio: data.riesgoPaisPrevio,
    riesgoPaisYear: data.riesgoPaisYear,
    riesgoPais90Days: data.riesgoPais90Days,
    inflacionPrevio: data.inflacionPrevio,
    depositoA30Dias: data.depositoA30Dias,
    depositoA30DiasPrevio: data.depositoA30DiasPrevio,
    dolarOficial: data.dolarOficial,
    dolarBlue: data.dolarBlue,
    dolarOficialPrevio: data.dolarOficialPrevio,
    dolarBluePrevio: data.dolarBluePrevio,
    dolarOficial90Days: data.dolarOficial90Days,
    dolarBlue90Days: data.dolarBlue90Days,
    dolarOficialYear: data.dolarOficialYear,
    dolarBlueYear: data.dolarBlueYear,
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

type IMFValue = {
  [year: string]: number;
};

type IMFIndicator = {
  name: string;
  values?: {
    [indicator: string]: {
      ARG: IMFValue;
    };
  };
};

type IMFData = {
  NGDP_RPCH: IMFIndicator; // Real GDP growth
  PCPIPCH: IMFIndicator; // Inflation
  LUR: IMFIndicator; // Unemployment rate
  BCA_NGDPD: IMFIndicator; // Current account balance
  GGXWDG_NGDP: IMFIndicator; // Government gross debt
  GGXCNL_NGDP: IMFIndicator; // Government net lending
  NGDPDPC: IMFIndicator; // GDP per capita
  PPPEX: IMFIndicator; // PPP conversion rate
};

type ProcessedIMFData = {
  gdpGrowth: IMFValue;
  inflation: IMFValue;
  unemployment: IMFValue;
  currentAccount: IMFValue;
  govDebt: IMFValue;
  govLending: IMFValue;
  gdpPerCapita: IMFValue;
  pppRate: IMFValue;
};

function processIMFData(data: IMFData): ProcessedIMFData {
  const processed: ProcessedIMFData = {
    gdpGrowth: {},
    inflation: {},
    unemployment: {},
    currentAccount: {},
    govDebt: {},
    govLending: {},
    gdpPerCapita: {},
    pppRate: {},
  };

  // Process GDP Growth
  if (data.NGDP_RPCH.values?.NGDP_RPCH?.ARG) {
    processed.gdpGrowth = data.NGDP_RPCH.values.NGDP_RPCH.ARG;
  }

  // Process Inflation
  if (data.PCPIPCH.values?.PCPIPCH?.ARG) {
    processed.inflation = data.PCPIPCH.values.PCPIPCH.ARG;
  }

  // Process Unemployment
  if (data.LUR.values?.LUR?.ARG) {
    processed.unemployment = data.LUR.values.LUR.ARG;
  }

  // Process Current Account Balance
  if (data.BCA_NGDPD.values?.BCA_NGDPD?.ARG) {
    processed.currentAccount = data.BCA_NGDPD.values.BCA_NGDPD.ARG;
  }

  // Process Government Debt
  if (data.GGXWDG_NGDP.values?.GGXWDG_NGDP?.ARG) {
    processed.govDebt = data.GGXWDG_NGDP.values.GGXWDG_NGDP.ARG;
  }

  // Process Government Lending
  if (data.GGXCNL_NGDP.values?.GGXCNL_NGDP?.ARG) {
    processed.govLending = data.GGXCNL_NGDP.values.GGXCNL_NGDP.ARG;
  }

  // Process GDP per capita
  if (data.NGDPDPC.values?.NGDPDPC?.ARG) {
    processed.gdpPerCapita = data.NGDPDPC.values.NGDPDPC.ARG;
  }

  // Process PPP Rate
  if (data.PPPEX.values?.PPPEX?.ARG) {
    processed.pppRate = data.PPPEX.values.PPPEX.ARG;
  }

  return processed;
}

export function useIMFData() {
  const [data, setData] = useState<IMFData | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch("/api/imf");
      const result = await response.json();
      setData(result);
    }
    fetchData();
  }, []);
  console.log("data", data);
  const processedData = data ? processIMFData(data) : null;
  console.log("processedData", processedData);
  return {
    data,
    error,
    processedData,
  };
}
