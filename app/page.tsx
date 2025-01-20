import { EconomicIndicatorsGrid } from "@/components/economic-indicators-grid";
import Footer from "@/components/footer";

export const revalidate = 24 * 60 * 60; // 1 hour

export default function Home() {
  return (
    <div className='grid grid-rows-[auto_1fr_auto_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <header className='text-center'>
        <h1 className='text-5xl font-bold mb-2'>¿Argentina 🐂 o 🐻?</h1>
        <p className=' text-muted-foreground max-w-2xl'>
          Una guía simple para entender la situación del país, por ahora en
          terminos unicamente economicos, diseñada para aquellos que no tienen
          el tiempo o el conocimiento para investigar o interpretar los datos
          por sí mismos.
        </p>
      </header>
      <main className='flex flex-col gap-8 items-center sm:items-start w-full '>
        <EconomicIndicatorsGrid />
      </main>

      <div className='flex flex-col gap-4 items-center sm:items-start w-full max-w-2xl'>
        <h2 className='text-3xl font-bold mb-2'>¿Cómo calculamos el índice?</h2>
        <p className='text-muted-foreground'>
          Nuestro índice se basa en varios indicadores económicos clave, cada
          uno con un peso específico:
        </p>
        <ul className='list-disc pl-6 text-muted-foreground'>
          <li>Riesgo país (20%)</li>
          <li>Inflación interanual (20%)</li>
          <li>Inflación mensual (5%)</li>
          <li>Tasa de plazo fijo a 30 días (15%)</li>
          <li>Brecha cambiaria (Dólar Blue vs. Oficial) (20%)</li>
          <li>Tasa de crecimiento del PIB per cápita (10%)</li>
          <li>Tasa de endeudamiento del gobierno (10%)</li>
        </ul>
        <p className='text-muted-foreground mt-2'>
          Los datos se obtienen de fuentes oficiales y confiables, incluyendo el
          INDEC, BCRA, FMI (Fondo Monetario Internacional), y APIs de
          proveedores de datos financieros, si no se actualizan, se utilizan los
          ultimos datos disponibles. Normalizamos cada indicador en una escala
          de 0 a 100, donde 0 representa la peor situación histórica y 100 la
          mejor. Luego aplicamos los pesos correspondientes para calcular el
          índice final, que oscila entre 0 (extremadamente bearish) y 100
          (extremadamente bullish).
        </p>
      </div>
      <Footer />
    </div>
  );
}
