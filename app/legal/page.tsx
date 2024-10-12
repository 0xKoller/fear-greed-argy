import React from "react";

function page() {
  return (
    <main className='max-w-3xl mx-auto px-4 py-8 font-sans'>
      <h1 className='text-3xl font-bold text-gray-800 border-b-2 border-gray-300 pb-2 mb-6'>
        Descargo de Responsabilidad Legal
      </h1>
      <section className='bg-gray-50 p-6 rounded-lg shadow-md'>
        <h2 className='text-2xl font-semibold text-gray-700 mt-6 mb-4'>
          Naturaleza Informativa del Sitio
        </h2>
        <p className='mb-4'>
          Este sitio web es de naturaleza meramente informativa. No proporciona
          ni debe interpretarse como:
          <ul className='list-disc list-inside'>
            <li>Consejo financiero</li>
            <li>Recomendación de inversión</li>
            <li>Asesoramiento legal o financiero</li>
            <li>Invitación para realizar operaciones de cualquier tipo</li>
            <li>Los datos presentados</li>
            <li>Las fuentes de información utilizadas</li>
          </ul>
        </p>
        <p className='mb-4'>
          Se deslindan de toda responsabilidad respecto a posibles faltas en la
          información proporcionada.
        </p>
        <h2 className='text-2xl font-semibold text-gray-700 mt-6 mb-4'>
          Uso de la Información
        </h2>
        <p className='mb-4'>
          Los colaboradores y operadores de este sitio: No se responsabilizan
          por el uso que los visitantes puedan dar a la información y datos
          incluidos en este sitio. No asumen responsabilidad por eventuales
          daños patrimoniales o perjuicios que pudieran resultar de decisiones
          tomadas basadas en la información de este sitio.
        </p>
        <h2 className='text-2xl font-semibold text-gray-700 mt-6 mb-4'>
          Recomendación a los Visitantes
        </h2>
        <p className='mb-4'>
          Se recomienda encarecidamente a todos los visitantes:
          <ul className='list-disc list-inside'>
            <li>Realizar su propia investigación independiente.</li>
            <li>
              Buscar asesoramiento profesional antes de tomar cualquier decisión
              basada en la información proporcionada en este sitio.
            </li>
          </ul>
        </p>
        <h2 className='text-2xl font-semibold text-gray-700 mt-6 mb-4'>
          Índice de Fear & Greed
        </h2>
        <p className='mb-4'>
          El índice de "Fear & Greed" (Miedo y Codicia) presentado en este
          sitio:
        </p>
        <p>
          <ul className='list-disc list-inside'>
            <li>Es un indicador basado en datos públicamente disponibles.</li>
            <li>
              No debe interpretarse como una predicción del futuro estado
              económico o financiero del país.
            </li>
            <li>
              No constituye una recomendación de inversión o desinversión.
            </li>
          </ul>
        </p>
      </section>
    </main>
  );
}

export default page;
