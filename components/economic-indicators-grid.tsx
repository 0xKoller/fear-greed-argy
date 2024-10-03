"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  SunIcon,
  MoonIcon,
  RefreshCcwIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { calculateFearGreedIndex, interpretIndex } from "@/lib/useEconomicData";

export function EconomicIndicatorsGrid() {
  return <EconomicIndicatorsContent />;
}

function EconomicIndicatorsContent() {
  const [darkMode, setDarkMode] = useState(false);
  const economicData = calculateFearGreedIndex();

  // Check if economicData is undefined before destructuring
  if (!economicData) {
    return <div>Loading...</div>;
  }
  const {
    index,
    inflacion,
    inflacionInteranual,
    riesgoPais,
    riesgoPaisPrevio,
    inflacionPrevio,
    depositoA30Dias,
    depositoA30DiasPrevio,
    dolarBlue,
    dolarOficial,
  } = economicData;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const formatPercentage = (num: number | undefined) =>
    num !== undefined ? `${num.toFixed(2)}%` : "N/A";

  const calculateBreach = (blue: number, official: number) => {
    return ((blue - official) / official) * 100;
  };

  return (
    <div className='container mx-auto p-4 dark:bg-gray-900 transition-colors duration-200  rounded-lg'>
      <div className='flex justify-end mb-4 gap-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <SunIcon className='h-[1.2rem] w-[1.2rem]' />
          ) : (
            <MoonIcon className='h-[1.2rem] w-[1.2rem]' />
          )}
        </Button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {/* Monthly Inflation */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Inflación mensual</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                {inflacion ? `${inflacion.toFixed(2)}%` : "Cargando..."}
              </span>
              {inflacion && inflacionPrevio && (
                <ArrowUpIcon className='w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400 animate-pulse' />
              )}
            </div>
            {inflacion && inflacionPrevio && (
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span
                  className={
                    inflacion > inflacionPrevio
                      ? "text-red-500 dark:text-red-400"
                      : "text-green-500 dark:text-green-400"
                  }
                >
                  {(
                    ((inflacion - inflacionPrevio) / inflacionPrevio) *
                    100
                  ).toFixed(2)}
                  % vs mes anterior
                </span>
              </div>
            )}
            {inflacionPrevio && (
              <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Valor anterior: {inflacionPrevio.toFixed(2)}%
              </div>
            )}
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Aumento mensual en el nivel general de precios. Valores óptimos:
            &lt;1%.
          </p>
        </div>

        {/* Year-over-year Inflation */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Inflación interanual</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                {inflacionInteranual
                  ? `${inflacionInteranual.toFixed(2)}%`
                  : "Cargando..."}
              </span>
              {inflacionInteranual && (
                <ArrowUpIcon className='w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400 animate-pulse' />
              )}
            </div>
            {inflacionInteranual && (
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span
                  className={
                    inflacionInteranual > 50
                      ? "text-red-500 dark:text-red-400"
                      : "text-green-500 dark:text-green-400"
                  }
                >
                  {inflacionInteranual > 50 ? "Alta" : "Moderada"}
                </span>{" "}
                inflación en los últimos 12 meses
              </div>
            )}
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Aumento de precios en los últimos 12 meses. Valor óptimo: &lt;3%
            anual.
          </p>
        </div>

        {/* Country Risk */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Riesgo país</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                {riesgoPais}
              </span>
              <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                puntos
              </span>
            </div>
            {riesgoPais && riesgoPaisPrevio && (
              <div className='flex items-center'>
                {riesgoPais > riesgoPaisPrevio ? (
                  <ArrowUpIcon className='w-4 h-4 text-red-500 dark:text-red-400 mr-1' />
                ) : (
                  <ArrowDownIcon className='w-4 h-4 text-green-500 dark:text-green-400 mr-1' />
                )}
                <span
                  className={`text-xs sm:text-sm ${
                    riesgoPais > riesgoPaisPrevio
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {(
                    ((riesgoPais - riesgoPaisPrevio) / riesgoPaisPrevio) *
                    100
                  ).toFixed(2)}
                  % vs ultimo dato
                </span>
              </div>
            )}
            {riesgoPaisPrevio && (
              <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Valor anterior: {riesgoPaisPrevio} puntos
              </div>
            )}
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Diferencial de tasa de los bonos argentinos respecto a los de
            Estados Unidos. Valor óptimo: &lt;200 puntos.
          </p>
        </div>

        {/* Depósito a 30 días */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Depósito a 30 días</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                {depositoA30Dias
                  ? formatPercentage(depositoA30Dias)
                  : "Cargando..."}
              </span>
              {depositoA30Dias &&
                depositoA30DiasPrevio &&
                (depositoA30Dias > depositoA30DiasPrevio ? (
                  <ArrowUpIcon className='w-5 h-5 sm:w-6 sm:h-6 text-green-500 dark:text-green-400 animate-pulse' />
                ) : (
                  <ArrowDownIcon className='w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400 animate-pulse' />
                ))}
            </div>
            {depositoA30Dias && depositoA30DiasPrevio && (
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span
                  className={
                    depositoA30Dias > depositoA30DiasPrevio
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }
                >
                  {(
                    ((depositoA30Dias - depositoA30DiasPrevio) /
                      depositoA30DiasPrevio) *
                    100
                  ).toFixed(2)}
                  % vs tasa anterior
                </span>
              </div>
            )}
            {depositoA30DiasPrevio && (
              <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Tasa anterior: {formatPercentage(depositoA30DiasPrevio)}
              </div>
            )}
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Tasa de interés anual para depósitos a plazo fijo de 30 días.
          </p>
        </div>

        {/* Fear & Greed Indicator */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 col-span-1 sm:col-span-2 lg:col-span-1 row-span-2 flex flex-col justify-between h-full'>
          <h3 className='font-semibold text-2xl mb-4 text-center'>
            Indice Bullish/Bearish
          </h3>
          <div className='flex-grow flex flex-col items-center justify-center'>
            <div
              className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-8 flex items-center justify-center mb-4 ${getBorderColor(
                index
              )}`}
            >
              <span className='text-4xl sm:text-5xl font-bold'>
                {index.toFixed()}
              </span>
            </div>
            <span
              className={`text-lg sm:text-xl font-semibold text-center ${getTextColor(
                index
              )}`}
            >
              {interpretIndex(index)}
            </span>
          </div>
          <div className='mt-auto'>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4 text-center'>
              Mide el sentimiento del mercado. 0 = Miedo extremo, 100 = Codicia
              extrema.
            </p>
            <p className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 text-center'>
              Equilibrio óptimo: 50.
            </p>
          </div>
        </div>

        {/* Dólar Blue */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Dólar Blue</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                ${dolarBlue ? dolarBlue.toFixed(2) : "Cargando..."}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Cotización del dólar en el mercado informal.
          </p>
        </div>

        {/* Dólar Oficial */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Dólar Oficial</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                ${dolarOficial ? dolarOficial.toFixed(2) : "Cargando..."}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Cotización oficial del dólar establecida por el Banco Central.
          </p>
        </div>

        {/* Brecha Cambiaria */}
        <div className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg'>
          <h3 className='font-semibold text-lg mb-2'>Brecha Cambiaria</h3>
          <div className='flex flex-col'>
            <div className='flex items-center mb-2'>
              <span className='text-2xl sm:text-3xl font-bold mr-2'>
                {dolarBlue && dolarOficial
                  ? `${calculateBreach(dolarBlue, dolarOficial).toFixed(2)}%`
                  : "Cargando..."}
              </span>
            </div>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
            Diferencia porcentual entre el Dólar Blue y el Dólar Oficial.
          </p>
        </div>
      </div>
    </div>
  );
}
// Add these functions at the top of your component or in a separate utility file

function getBorderColor(index: number): string {
  if (index < 25) return "border-red-600 dark:border-red-700";
  if (index < 45) return "border-orange-500 dark:border-orange-600";
  if (index < 55) return "border-yellow-400 dark:border-yellow-500";
  if (index < 75) return "border-lime-500 dark:border-lime-600";
  return "border-green-500 dark:border-green-600";
}

function getTextColor(index: number): string {
  if (index < 25) return "text-red-600 dark:text-red-400";
  if (index < 45) return "text-orange-500 dark:text-orange-400";
  if (index < 55) return "text-yellow-600 dark:text-yellow-400";
  if (index < 75) return "text-lime-600 dark:text-lime-400";
  return "text-green-600 dark:text-green-400";
}
