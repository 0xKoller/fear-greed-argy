"use client";

import { ArrowDownIcon, ArrowUpIcon, SunIcon, MoonIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  calculateFearGreedIndex,
  interpretIndex,
  useIMFData,
} from "@/lib/useEconomicData";
import { getBrechaCambiariaColor, getTextColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/hooks/useTheme";
import { useTimeframe } from "@/hooks/useTimeframe";

export function EconomicIndicatorsGrid() {
  return <EconomicIndicatorsContent />;
}

function EconomicIndicatorsContent() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { timeframe, handleTimeframeChange } = useTimeframe();
  const economicData = calculateFearGreedIndex();
  const { processedData: imfData } = useIMFData();
  const currentYear = new Date().getFullYear().toString();
  const previousYear = (new Date().getFullYear() - 1).toString();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (economicData.status === false) {
    return (
      <div className='container mx-auto p-4 dark:bg-gray-900 transition-colors duration-200 rounded-lg'>
        <div className='text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
          <svg
            className='mx-auto h-12 w-12 text-red-400 dark:text-red-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='mt-2 text-lg font-medium text-gray-900 dark:text-gray-100'>
            Error en la obtención de datos
          </h3>
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            Hubo un problema al obtener los indicadores económicos. Por favor,
            inténtelo de nuevo más tarde.
          </p>
          <div className='mt-6'>
            <button
              type='button'
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              onClick={() => {
                document.cookie = "economicData=; Max-Age=0; path=/;";
                localStorage.removeItem("economicData");
                window.location.reload();
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    index,
    inflacion,
    inflacion90Days,
    inflacionYear,
    inflacionInteranual,
    inflacionInteranualYear,
    inflacionInteranualPrevio,
    inflacionInteranual90Days,
    riesgoPais,
    riesgoPaisPrevio,
    riesgoPais90Days,
    riesgoPaisYear,
    inflacionPrevio,
    depositoA30Dias,
    depositoA30DiasPrevio,
    dolarBlue,
    dolarOficial,
    dolarBluePrevio,
    dolarOficialPrevio,
    dolarOficial90Days,
    dolarBlue90Days,
    dolarOficialYear,
    dolarBlueYear,
  } = economicData;

  const formatPercentage = (num: number | undefined) =>
    num !== undefined ? `${num.toFixed(2)}%` : "N/A";

  const calculateBreach = (blue: number, official: number) => {
    return ((blue - official) / official) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const hoverVariants = {
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
    },
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const calculateVariation = (
    current: number,
    previous: number | undefined,
    timeframe: string
  ) => {
    if (!previous) return null;
    const variation = ((current - previous) / previous) * 100;
    const isPositive = variation > 0;
    const color =
      variation === 0
        ? "text-gray-500 dark:text-gray-400"
        : isPositive
        ? "text-red-500 dark:text-red-400"
        : "text-green-500 dark:text-green-400";
    const arrow =
      variation === 0 ? null : isPositive ? (
        <ArrowUpIcon className='w-full h-full' />
      ) : (
        <ArrowDownIcon className='w-full h-full' />
      );
    const timeframeText =
      timeframe === "previous"
        ? "vs valor anterior."
        : timeframe === "90days"
        ? "en los últimos 90 días."
        : "en el último año.";

    return {
      variation,
      color,
      arrow,
      text:
        variation === 0
          ? `Sin cambios ${timeframeText}`
          : `${Math.abs(variation).toFixed(2)}% ${timeframeText}`,
    };
  };

  // Helper function to calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive,
      symbol: isPositive ? "↑" : "↓",
    };
  };

  return (
    <motion.div
      className='container mx-auto p-4 dark:bg-gray-900 transition-colors duration-200 rounded-lg'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <div className='flex justify-end items-center mb-4'>
        <div className='flex items-center space-x-2'>
          <Select
            onValueChange={handleTimeframeChange}
            defaultValue={timeframe}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Seleccionar período' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='previous'>Valor anterior</SelectItem>
              <SelectItem value='90days'>Últimos 90 días</SelectItem>
              <SelectItem value='year'>Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='icon'
            onClick={toggleDarkMode}
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <SunIcon className='h-[1.2rem] w-[1.2rem]' />
            ) : (
              <MoonIcon className='h-[1.2rem] w-[1.2rem]' />
            )}
          </Button>
        </div>
      </div>
      <motion.div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
        variants={containerVariants}
      >
        {/* Monthly Inflation */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Inflación mensual</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    {inflacion ? `${inflacion.toFixed(2)}%` : "Cargando..."}
                  </span>
                  {inflacion && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        calculateVariation(
                          inflacion,
                          timeframe === "previous"
                            ? inflacionPrevio ?? 0
                            : timeframe === "90days"
                            ? inflacion90Days ?? 0
                            : inflacionYear ?? 0,
                          timeframe
                        )?.color
                      } animate-pulse`}
                    >
                      {
                        calculateVariation(
                          inflacion,
                          timeframe === "previous"
                            ? inflacionPrevio ?? 0
                            : timeframe === "90days"
                            ? inflacion90Days ?? 0
                            : inflacionYear ?? 0,
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {inflacion && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              inflacion,
                              timeframe === "previous"
                                ? inflacionPrevio ?? 0
                                : timeframe === "90days"
                                ? inflacion90Days ?? 0
                                : inflacionYear ?? 0,
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              inflacion,
                              timeframe === "previous"
                                ? inflacionPrevio ?? 0
                                : timeframe === "90days"
                                ? inflacion90Days ?? 0
                                : inflacionYear ?? 0,
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" &&
                      inflacionPrevio !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Anterior: {inflacionPrevio?.toFixed(2) ?? "N/A"}%
                        </div>
                      )}
                    {timeframe === "90days" &&
                      inflacion90Days !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace 90 días: {inflacion90Days?.toFixed(2) ?? "N/A"}%
                        </div>
                      )}
                    {timeframe === "year" && inflacionYear !== undefined && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace un año: {inflacionYear?.toFixed(2) ?? "N/A"}%
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Aumento mensual en el nivel general de precios. Valores óptimos:
              &lt;1%.
            </p>
          </div>
        </motion.div>

        {/* Year-over-year Inflation */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>
                Inflación interanual
              </h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    {inflacionInteranual
                      ? `${inflacionInteranual.toFixed(2)}%`
                      : "Cargando..."}
                  </span>
                  {inflacionInteranual && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        calculateVariation(
                          inflacionInteranual,
                          timeframe === "previous"
                            ? inflacionInteranualPrevio ?? 0
                            : timeframe === "90days"
                            ? inflacionInteranual90Days ?? 0
                            : inflacionInteranualYear ?? 0,
                          timeframe
                        )?.color
                      } animate-pulse`}
                    >
                      {
                        calculateVariation(
                          inflacionInteranual,
                          timeframe === "previous"
                            ? inflacionInteranualPrevio ?? 0
                            : timeframe === "90days"
                            ? inflacionInteranual90Days ?? 0
                            : inflacionInteranualYear ?? 0,
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {inflacionInteranual && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              inflacionInteranual,
                              timeframe === "previous"
                                ? inflacionInteranualPrevio ?? 0
                                : timeframe === "90days"
                                ? inflacionInteranual90Days ?? 0
                                : inflacionInteranualYear ?? 0,
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              inflacionInteranual,
                              timeframe === "previous"
                                ? inflacionInteranualPrevio ?? 0
                                : timeframe === "90days"
                                ? inflacionInteranual90Days ?? 0
                                : inflacionInteranualYear ?? 0,
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" &&
                      inflacionInteranualPrevio !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Anterior:{" "}
                          {inflacionInteranualPrevio?.toFixed(2) ?? "N/A"}%
                        </div>
                      )}
                    {timeframe === "90days" &&
                      inflacionInteranual90Days !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace 90 días:{" "}
                          {inflacionInteranual90Days?.toFixed(2) ?? "N/A"}%
                        </div>
                      )}
                    {timeframe === "year" &&
                      inflacionInteranualYear !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace un año:{" "}
                          {inflacionInteranualYear?.toFixed(2) ?? "N/A"}%
                        </div>
                      )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Aumento de precios en los últimos 12 meses. Valor óptimo: &lt;7%
              anual.
            </p>
          </div>
        </motion.div>

        {/* Country Risk */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Riesgo país</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    {riesgoPais}
                  </span>
                  <span className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                    puntos
                  </span>
                  {riesgoPais && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ml-2 ${
                        calculateVariation(
                          riesgoPais,
                          timeframe === "previous"
                            ? riesgoPaisPrevio ?? 0
                            : timeframe === "90days"
                            ? riesgoPais90Days ?? 0
                            : riesgoPaisYear ?? 0,
                          timeframe
                        )?.color
                      } animate-pulse`}
                    >
                      {
                        calculateVariation(
                          riesgoPais,
                          timeframe === "previous"
                            ? riesgoPaisPrevio ?? 0
                            : timeframe === "90days"
                            ? riesgoPais90Days ?? 0
                            : riesgoPaisYear ?? 0,
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {riesgoPais && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              riesgoPais,
                              timeframe === "previous"
                                ? riesgoPaisPrevio ?? 0
                                : timeframe === "90days"
                                ? riesgoPais90Days ?? 0
                                : riesgoPaisYear ?? 0,
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              riesgoPais,
                              timeframe === "previous"
                                ? riesgoPaisPrevio ?? 0
                                : timeframe === "90days"
                                ? riesgoPais90Days ?? 0
                                : riesgoPaisYear ?? 0,
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" &&
                      riesgoPaisPrevio !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Anterior: {riesgoPaisPrevio} puntos
                        </div>
                      )}
                    {timeframe === "90days" &&
                      riesgoPais90Days !== undefined && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace 90 días: {riesgoPais90Days} puntos
                        </div>
                      )}
                    {timeframe === "year" && riesgoPaisYear !== undefined && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace un año: {riesgoPaisYear} puntos
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Diferencial de tasa de los bonos argentinos respecto a los de
              Estados Unidos. Valor óptimo: &lt;200 puntos.
            </p>
          </div>
        </motion.div>

        {/* Depósito a 30 días */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Depósito a 30 días</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    {depositoA30Dias
                      ? formatPercentage(depositoA30Dias)
                      : "Cargando..."}
                  </span>
                  {depositoA30Dias && depositoA30DiasPrevio && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        depositoA30Dias > depositoA30DiasPrevio
                          ? "text-green-500 dark:text-green-400"
                          : depositoA30Dias < depositoA30DiasPrevio
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-400"
                      } ${
                        depositoA30Dias !== depositoA30DiasPrevio
                          ? "animate-pulse"
                          : ""
                      }`}
                    >
                      {depositoA30Dias > depositoA30DiasPrevio ? (
                        <ArrowUpIcon />
                      ) : depositoA30Dias < depositoA30DiasPrevio ? (
                        <ArrowDownIcon />
                      ) : null}
                    </span>
                  )}
                </div>
                {depositoA30Dias && depositoA30DiasPrevio && (
                  <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                    <span
                      className={
                        depositoA30Dias > depositoA30DiasPrevio
                          ? "text-green-500 dark:text-green-400"
                          : depositoA30Dias < depositoA30DiasPrevio
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-400"
                      }
                    >
                      {depositoA30Dias === depositoA30DiasPrevio
                        ? "Sin cambios"
                        : `${(
                            ((depositoA30Dias - depositoA30DiasPrevio) /
                              depositoA30DiasPrevio) *
                            100
                          ).toFixed(2)}% vs tasa anterior.`}
                    </span>
                  </div>
                )}
                {depositoA30DiasPrevio && (
                  <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                    Tasa anterior: {formatPercentage(depositoA30DiasPrevio)}
                  </div>
                )}
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Tasa de interés anual para depósitos a plazo fijo de 30 días.
            </p>
          </div>
        </motion.div>

        {/* Fear & Greed Indicator - Special styling for the featured card */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 col-span-1 sm:col-span-2 lg:col-span-1 row-span-2 flex flex-col justify-between hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <h3 className='font-semibold text-2xl mb-6 text-center'>
            Indice Bullish/Bearish
          </h3>
          <div className='flex-grow flex flex-col items-center justify-center'>
            <div
              className={`w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[10px] flex items-center justify-center mb-6 transition-colors duration-300 ${getBorderColor(
                index ?? 0
              )}`}
            >
              <span className='text-5xl sm:text-6xl font-bold'>
                {index ? index.toFixed() : "Cargando..."}
              </span>
            </div>
            <span
              className={`text-xl sm:text-2xl font-semibold text-center mb-4 ${getTextColor(
                index ?? 0
              )}`}
            >
              {interpretIndex(index ?? 0)}
            </span>
          </div>
          <div className='mt-auto'>
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center'>
              Mide el sentimiento del mercado. 0 = Miedo extremo, 100 = Codicia
              extrema.
            </p>
            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2 text-center'>
              Equilibrio óptimo: 50.
            </p>
          </div>
        </motion.div>

        {/* Dólar Blue */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Dólar Blue</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    ${dolarBlue ? dolarBlue.toFixed(2) : "Cargando..."}
                  </span>
                  {dolarBlue && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        calculateVariation(
                          dolarBlue,
                          timeframe === "previous"
                            ? dolarBluePrevio ?? 0
                            : timeframe === "90days"
                            ? dolarBlue90Days ?? 0
                            : dolarBlueYear ?? 0,
                          timeframe
                        )?.color
                      } ${
                        calculateVariation(
                          dolarBlue,
                          timeframe === "previous"
                            ? dolarBluePrevio ?? 0
                            : timeframe === "90days"
                            ? dolarBlue90Days ?? 0
                            : dolarBlueYear ?? 0,
                          timeframe
                        )?.variation !== 0
                          ? "animate-pulse"
                          : ""
                      }`}
                    >
                      {
                        calculateVariation(
                          dolarBlue,
                          timeframe === "previous"
                            ? dolarBluePrevio ?? 0
                            : timeframe === "90days"
                            ? dolarBlue90Days ?? 0
                            : dolarBlueYear ?? 0,
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {dolarBlue && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              dolarBlue,
                              timeframe === "previous"
                                ? dolarBluePrevio ?? 0
                                : timeframe === "90days"
                                ? dolarBlue90Days ?? 0
                                : dolarBlueYear ?? 0,
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              dolarBlue,
                              timeframe === "previous"
                                ? dolarBluePrevio ?? 0
                                : timeframe === "90days"
                                ? dolarBlue90Days ?? 0
                                : dolarBlueYear ?? 0,
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" && dolarBluePrevio && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Anterior: ${dolarBluePrevio.toFixed(2)}
                      </div>
                    )}
                    {timeframe === "90days" && dolarBlue90Days && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace 90 días: ${dolarBlue90Days.toFixed(2)}
                      </div>
                    )}
                    {timeframe === "year" && dolarBlueYear && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace un año: ${dolarBlueYear.toFixed(2)}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Cotización del dólar en el mercado informal.
            </p>
          </div>
        </motion.div>

        {/* Dólar Oficial */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Dólar Oficial</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                    ${dolarOficial ? dolarOficial.toFixed(2) : "Cargando..."}
                  </span>
                  {dolarOficial && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        calculateVariation(
                          dolarOficial,
                          timeframe === "previous"
                            ? dolarOficialPrevio ?? 0
                            : timeframe === "90days"
                            ? dolarOficial90Days ?? 0
                            : dolarOficialYear ?? 0,
                          timeframe
                        )?.color
                      } ${
                        calculateVariation(
                          dolarOficial,
                          timeframe === "previous"
                            ? dolarOficialPrevio ?? 0
                            : timeframe === "90days"
                            ? dolarOficial90Days ?? 0
                            : dolarOficialYear ?? 0,
                          timeframe
                        )?.variation !== 0
                          ? "animate-pulse"
                          : ""
                      }`}
                    >
                      {
                        calculateVariation(
                          dolarOficial,
                          timeframe === "previous"
                            ? dolarOficialPrevio ?? 0
                            : timeframe === "90days"
                            ? dolarOficial90Days ?? 0
                            : dolarOficialYear ?? 0,
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {dolarOficial && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              dolarOficial,
                              timeframe === "previous"
                                ? dolarOficialPrevio ?? 0
                                : timeframe === "90days"
                                ? dolarOficial90Days ?? 0
                                : dolarOficialYear ?? 0,
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              dolarOficial,
                              timeframe === "previous"
                                ? dolarOficialPrevio ?? 0
                                : timeframe === "90days"
                                ? dolarOficial90Days ?? 0
                                : dolarOficialYear ?? 0,
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" && dolarOficialPrevio && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Anterior: ${dolarOficialPrevio.toFixed(2)}
                      </div>
                    )}
                    {timeframe === "90days" && dolarOficial90Days && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace 90 días: ${dolarOficial90Days.toFixed(2)}
                      </div>
                    )}
                    {timeframe === "year" && dolarOficialYear && (
                      <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                        Hace un año: ${dolarOficialYear.toFixed(2)}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Cotización oficial del dólar establecida por el Banco Central.
              Crawling Peg del 1% mensual.
            </p>
          </div>
        </motion.div>

        {/* Brecha Cambiaria */}
        <motion.div
          className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
          variants={itemVariants}
          whileHover={hoverVariants}
        >
          <div className='flex flex-col h-full justify-between'>
            <div>
              <h3 className='font-semibold text-lg mb-4'>Brecha Cambiaria</h3>
              <div className='flex flex-col'>
                <div className='flex items-center mb-3'>
                  {dolarBlue && dolarOficial ? (
                    <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                      {`${calculateBreach(dolarBlue, dolarOficial).toFixed(
                        2
                      )}%`}
                    </span>
                  ) : (
                    <span className='text-3xl sm:text-4xl font-bold mr-3 tracking-tight'>
                      Cargando...
                    </span>
                  )}
                  {dolarBlue && dolarOficial && (
                    <span
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${
                        calculateVariation(
                          calculateBreach(dolarBlue, dolarOficial),
                          timeframe === "previous"
                            ? calculateBreach(
                                dolarBluePrevio ?? 0,
                                dolarOficialPrevio ?? 0
                              )
                            : timeframe === "90days"
                            ? calculateBreach(
                                dolarBlue90Days ?? 0,
                                dolarOficial90Days ?? 0
                              )
                            : calculateBreach(
                                dolarBlueYear ?? 0,
                                dolarOficialYear ?? 0
                              ),
                          timeframe
                        )?.color
                      } animate-pulse`}
                    >
                      {
                        calculateVariation(
                          calculateBreach(dolarBlue, dolarOficial),
                          timeframe === "previous"
                            ? calculateBreach(
                                dolarBluePrevio ?? 0,
                                dolarOficialPrevio ?? 0
                              )
                            : timeframe === "90days"
                            ? calculateBreach(
                                dolarBlue90Days ?? 0,
                                dolarOficial90Days ?? 0
                              )
                            : calculateBreach(
                                dolarBlueYear ?? 0,
                                dolarOficialYear ?? 0
                              ),
                          timeframe
                        )?.arrow
                      }
                    </span>
                  )}
                </div>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={timeframe}
                    initial='hidden'
                    animate='visible'
                    exit='exit'
                    variants={fadeVariants}
                    transition={{ duration: 0.2 }}
                  >
                    {dolarBlue && dolarOficial && (
                      <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span
                          className={
                            calculateVariation(
                              calculateBreach(dolarBlue, dolarOficial),
                              timeframe === "previous"
                                ? calculateBreach(
                                    dolarBluePrevio ?? 0,
                                    dolarOficialPrevio ?? 0
                                  )
                                : timeframe === "90days"
                                ? calculateBreach(
                                    dolarBlue90Days ?? 0,
                                    dolarOficial90Days ?? 0
                                  )
                                : calculateBreach(
                                    dolarBlueYear ?? 0,
                                    dolarOficialYear ?? 0
                                  ),
                              timeframe
                            )?.color
                          }
                        >
                          {
                            calculateVariation(
                              calculateBreach(dolarBlue, dolarOficial),
                              timeframe === "previous"
                                ? calculateBreach(
                                    dolarBluePrevio ?? 0,
                                    dolarOficialPrevio ?? 0
                                  )
                                : timeframe === "90days"
                                ? calculateBreach(
                                    dolarBlue90Days ?? 0,
                                    dolarOficial90Days ?? 0
                                  )
                                : calculateBreach(
                                    dolarBlueYear ?? 0,
                                    dolarOficialYear ?? 0
                                  ),
                              timeframe
                            )?.text
                          }
                        </span>
                      </div>
                    )}
                    {timeframe === "previous" &&
                      dolarBluePrevio &&
                      dolarOficialPrevio && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Anterior:{" "}
                          {calculateBreach(
                            dolarBluePrevio,
                            dolarOficialPrevio
                          ).toFixed(2)}
                          %
                        </div>
                      )}
                    {timeframe === "90days" &&
                      dolarBlue90Days &&
                      dolarOficial90Days && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace 90 días:{" "}
                          {calculateBreach(
                            dolarBlue90Days,
                            dolarOficial90Days
                          ).toFixed(2)}
                          %
                        </div>
                      )}
                    {timeframe === "year" &&
                      dolarBlueYear &&
                      dolarOficialYear && (
                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                          Hace un año:{" "}
                          {calculateBreach(
                            dolarBlueYear,
                            dolarOficialYear
                          ).toFixed(2)}
                          %
                        </div>
                      )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-4'>
              Diferencia porcentual entre el Dólar Blue y el Dólar Oficial.
            </p>
          </div>
        </motion.div>

        {/* IMF Indicators */}
        <motion.div
          className='col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          variants={containerVariants}
        >
          {/* GDP Growth */}
          <motion.div
            className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
            variants={itemVariants}
            whileHover={hoverVariants}
          >
            <h3 className='font-semibold text-lg mb-4'>
              Crecimiento del PBI Real
            </h3>
            <div className='flex flex-col'>
              <div className='flex items-baseline gap-2 mb-3'>
                <span className='text-4xl font-bold'>
                  {imfData?.gdpGrowth?.[currentYear]
                    ? `${imfData.gdpGrowth[currentYear].toFixed(2)}%`
                    : "Cargando..."}
                </span>
              </div>
              <span
                className={`text-sm ${
                  imfData?.gdpGrowth?.[previousYear] &&
                  imfData?.gdpGrowth?.[previousYear] > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {imfData?.gdpGrowth?.[previousYear]?.toFixed(2)}% vs{" "}
                {previousYear}
              </span>
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span>
                  Valor anterior:{" "}
                  {imfData?.gdpGrowth?.[previousYear]?.toFixed(2)}
                </span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Crecimiento anual del Producto Bruto Interno real. Valor óptimo:{" "}
                {">"}2%.
              </p>
            </div>
          </motion.div>

          {/* Unemployment */}
          <motion.div
            className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
            variants={itemVariants}
            whileHover={hoverVariants}
          >
            <h3 className='font-semibold text-lg mb-4'>Desempleo</h3>
            <div className='flex flex-col'>
              <div className='flex items-baseline gap-2 mb-3'>
                <span className='text-4xl font-bold'>
                  {imfData?.unemployment?.[currentYear]
                    ? `${imfData.unemployment[currentYear].toFixed(2)}%`
                    : "Cargando..."}
                </span>
              </div>
              <span
                className={`text-sm ${
                  imfData?.unemployment?.[previousYear] &&
                  imfData?.unemployment?.[previousYear] > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {imfData?.unemployment?.[previousYear]?.toFixed(2)}% vs{" "}
                {previousYear}
              </span>
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span>
                  Valor anterior:{" "}
                  {imfData?.unemployment?.[previousYear]?.toFixed(2)}
                </span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Tasa de desempleo. Valor óptimo: &lt;5%.
              </p>
            </div>
          </motion.div>

          {/* Government Debt */}
          <motion.div
            className='bg-card text-card-foreground dark:bg-gray-800 dark:text-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700'
            variants={itemVariants}
            whileHover={hoverVariants}
          >
            <h3 className='font-semibold text-lg mb-4'>Deuda Pública</h3>
            <div className='flex flex-col'>
              <div className='flex items-baseline gap-2 mb-3'>
                <span className='text-4xl font-bold'>
                  {imfData?.govDebt?.[currentYear]
                    ? `${imfData.govDebt[currentYear].toFixed(2)}%`
                    : "Cargando..."}
                </span>
              </div>
              <span
                className={`text-sm ${
                  imfData?.govDebt?.[previousYear] &&
                  imfData?.govDebt?.[previousYear] > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {imfData?.govDebt?.[previousYear]?.toFixed(2)}% vs{" "}
                {previousYear}
              </span>
              <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                <span>
                  Valor anterior: {imfData?.govDebt?.[previousYear]?.toFixed(2)}
                </span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Deuda pública bruta como % del PBI. Valor óptimo: &lt;60%.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function getBorderColor(index: number): string {
  if (index < 25) return "border-red-600 dark:border-red-700";
  if (index < 45) return "border-orange-500 dark:border-orange-600";
  if (index < 55) return "border-yellow-400 dark:border-yellow-500";
  if (index > 70) return "border-lime-500 dark:border-lime-600";
  return "border-green-500 dark:border-green-600";
}
