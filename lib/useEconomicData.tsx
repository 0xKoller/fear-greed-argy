import useSWR from "swr";

interface EconomicData {
  valor: number;
}

interface PlazoFijoData {
  tnaClientes: number | null;
}
interface FundData {
  fondo: string;
  fecha: string;
  vcp: number;
  ccp: number | null;
  patrimonio: number | null;
  horizonte?: string;
}

type NormalizedScore = number;

function parseDate(dateString: string): Date {
  // Assuming dateString is in format "YYYY-MM-DD"
  return new Date(dateString);
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useEconomicData() {
  const { data: riesgoPais } = useSWR<EconomicData>(
    "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais/ultimo",
    fetcher
  );
  const { data: inflacion } = useSWR<EconomicData[]>(
    "https://api.argentinadatos.com/v1/finanzas/indices/inflacion",
    fetcher
  );
  const { data: inflacionInteranual } = useSWR<EconomicData[]>(
    "https://api.argentinadatos.com/v1/finanzas/indices/inflacionInteranual",
    fetcher
  );
  const { data: plazoFijo } = useSWR<PlazoFijoData[]>(
    "https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo",
    fetcher
  );
  const { data: mercadoDinero } = useSWR<EconomicData[]>(
    "https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo",
    fetcher
  );
  const { data: rentaVariable } = useSWR<EconomicData[]>(
    "https://api.argentinadatos.com/v1/finanzas/fci/rentaVariable/ultimo",
    fetcher
  );

  return {
    riesgoPais: riesgoPais?.valor,
    inflacion:
      inflacion && inflacion.length > 0
        ? inflacion[inflacion.length - 1].valor
        : undefined,
    inflacionInteranual:
      inflacionInteranual && inflacionInteranual.length > 0
        ? inflacionInteranual[inflacionInteranual.length - 1].valor
        : undefined,
    plazoFijo,
    mercadoDinero:
      mercadoDinero && mercadoDinero.length > 0 ? mercadoDinero : undefined,
    rentaVariable:
      rentaVariable && rentaVariable.length > 0 ? rentaVariable : undefined,
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

// Calculate average TNA for plazo fijo
function calculateAverageTNA(plazoFijoData: PlazoFijoData[]): number {
  if (!plazoFijoData || plazoFijoData.length === 0) return 0;
  const validRates = plazoFijoData
    .filter(
      (item): item is PlazoFijoData & { tnaClientes: number } =>
        item.tnaClientes !== null
    )
    .map((item) => item.tnaClientes);
  if (validRates.length === 0) return 0;
  const sum = validRates.reduce((acc, rate) => acc + rate, 0);
  return sum / validRates.length;
}

function calculateTotalAUM(moneyMarketData: FundData[] | undefined): number {
  if (!moneyMarketData) return 0;
  return moneyMarketData.reduce((total, fund) => {
    return total + (fund.patrimonio || 0);
  }, 0);
}

// Calculate average yield for money market funds
function calculateAverageYield(
  moneyMarketData: FundData[] | undefined
): number {
  if (!moneyMarketData) return 0;
  const fundsWithYield = moneyMarketData.filter(
    (fund) => fund.vcp !== null && fund.horizonte === "corto"
  );
  const totalYield = fundsWithYield.reduce((sum, fund) => sum + fund.vcp, 0);
  return totalYield / fundsWithYield.length;
}

function calculateTotalAUMVariableIncome(
  variableIncomeData: FundData[] | undefined
): number {
  if (!variableIncomeData) return 0;
  return variableIncomeData.reduce((total, fund) => {
    return total + (fund.patrimonio || 0);
  }, 0);
}

// Calculate average VCP for variable income funds
function calculateAverageVCPVariableIncome(
  variableIncomeData: FundData[] | undefined
): number {
  if (!variableIncomeData) return 0;
  const fundsWithVCP = variableIncomeData.filter(
    (fund) => fund.vcp !== null && fund.horizonte === "largo"
  );
  const totalVCP = fundsWithVCP.reduce((sum, fund) => sum + fund.vcp, 0);
  return totalVCP / fundsWithVCP.length;
}

function calculatePerformance(data: FundData[], days: number): number {
  if (!data || data.length === 0) {
    return 0;
  }
  const sortedData = data
    .filter((item) => item.vcp !== null && item.fecha !== null)
    .sort(
      (a, b) => parseDate(b.fecha).getTime() - parseDate(a.fecha).getTime()
    );

  if (sortedData.length < 2) {
    return 0;
  }

  const currentValue = sortedData[0].vcp;
  const currentDate = parseDate(sortedData[0].fecha);

  const targetDate = new Date(
    currentDate.getTime() - days * 24 * 60 * 60 * 1000
  );

  const previousDataPoint = sortedData.find(
    (item) => parseDate(item.fecha) <= targetDate
  );

  if (!previousDataPoint) {
    return 0;
  }

  const previousValue = previousDataPoint.vcp;

  const performance = ((currentValue - previousValue) / previousValue) * 100;

  return performance;
}

export function calculateFearGreedIndex() {
  const data = useEconomicData();
  const weights = {
    inflacion: 0.15,
    inflacionInteranual: 0.15,
    riesgoPais: 0.15,
    plazoFijo: 0.1,
    mercadoDineroAUM: 0.05,
    mercadoDineroYield: 0.05,
    mercadoDineroYTD: 0.05,
    mercadoDinero30Day: 0.05,
    rentaVariableAUM: 0.05,
    rentaVariableVCP: 0.05,
    rentaVariableYTD: 0.05,
    rentaVariable30Day: 0.1,
  };

  const averageTNA = calculateAverageTNA(data.plazoFijo ?? []);
  const totalAUM = calculateTotalAUM(
    data.mercadoDinero as FundData[] | undefined
  );
  const averageYield = calculateAverageYield(
    data.mercadoDinero as FundData[] | undefined
  );
  const totalAUMVariableIncome = calculateTotalAUMVariableIncome(
    data.rentaVariable as FundData[] | undefined
  );
  const averageVCPVariableIncome = calculateAverageVCPVariableIncome(
    data.rentaVariable as FundData[] | undefined
  );

  const mercadoDineroYTD = calculatePerformance(
    (data.mercadoDinero as unknown as FundData[]) ?? [],
    365
  );
  const mercadoDinero30Day = calculatePerformance(
    (data.mercadoDinero as unknown as FundData[]) ?? [],
    30
  );
  const rentaVariableYTD = calculatePerformance(
    (data.rentaVariable as unknown as FundData[]) ?? [],
    365
  );
  const rentaVariable30Day = calculatePerformance(
    (data.rentaVariable as unknown as FundData[]) ?? [],
    30
  );

  const scores: Record<string, NormalizedScore> = {
    inflacion: normalizeAndInvert(data.inflacion || 0, 0, 15),
    inflacionInteranual: normalizeAndInvert(
      data.inflacionInteranual || 0,
      0,
      400
    ),
    riesgoPais: normalizeAndInvert(data.riesgoPais || 0, 0, 2500),
    plazoFijo: normalize(averageTNA, 0.3, 0.6),
    mercadoDineroAUM: normalize(totalAUM, 30e12, 50e12),
    mercadoDineroYield: normalize(averageYield, 15000, 25000),
    mercadoDineroYTD: normalize(mercadoDineroYTD, 0, 400),
    mercadoDinero30Day: normalizeAndInvert(mercadoDinero30Day, -80, 20),
    rentaVariableAUM: normalize(totalAUMVariableIncome, 2e12, 4e12),
    rentaVariableVCP: normalize(averageVCPVariableIncome, 2000000, 4000000),
    rentaVariableYTD: normalize(rentaVariableYTD, -20, 40),
    rentaVariable30Day: normalizeAndInvert(rentaVariable30Day, -30, 10),
  };

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
    mercadoDineroYield: averageYield,
    averageTNA,
    averageVCPVariableIncome,
    mercadoDineroYTD,
    mercadoDinero30Day,
    rentaVariableYTD,
    rentaVariable30Day,
    scores,
  };
}

export function interpretIndex(index: number): string {
  if (index < 0 || index > 100) {
    return "Invalid Index Value";
  } else if (index >= 0 && index < 25) {
    return "La salida es Ezeiza";
  } else if (index >= 25 && index < 45) {
    return "Tal vez me quede";
  } else if (index >= 45 && index < 55) {
    return "Aguantamos";
  } else if (index >= 55 && index < 75) {
    return "Estamos de perlangas";
  } else {
    return "La entrada es Ezeiza";
  }
}
