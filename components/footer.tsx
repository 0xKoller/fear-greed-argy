import Link from "next/link";
import React from "react";

function footer() {
  return (
    <footer className='text-center text-muted-foreground text-sm max-w-xl mx-auto'>
      <p className='flex items-center gap-2 w-full justify-center'>
        Hecho con ❤️ por{" "}
        <a href='https://twitter.com/0xKoller' className='relative'>
          <svg
            id='Capa_2'
            data-name='Capa 2'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 940.81 181.67'
            width='52'
            height='52'
            fill='currentColor'
            className='footer-logo-animation'
          >
            <g id='Capa_1-2' data-name='Capa 1'>
              <g>
                <path d='m24.39,177.52l-20.24-20.24c-2.86-2.85-4.15-6.49-4.15-10.38V34.78c0-3.89,1.3-7.53,4.15-10.38L24.39,4.15c2.6-2.6,6.23-4.15,10.12-4.15h72.15c3.89,0,7.53,1.56,10.12,4.15l20.24,20.24c2.85,2.86,4.15,6.49,4.15,10.38v112.12c0,3.89-1.3,7.53-4.15,10.38l-20.24,20.24c-2.59,2.59-6.23,4.15-10.12,4.15H34.52c-3.89,0-7.53-1.56-10.12-4.15Zm5.19-19.2h82.01c3.37,0,5.97-2.6,5.97-5.71V29.07c0-3.11-2.6-5.71-5.97-5.71H29.58c-3.37,0-5.97,2.59-5.97,5.71v123.53c0,3.11,2.6,5.71,5.97,5.71Zm26.99-78.64c0-1.82,1.3-3.11,3.11-3.11h21.8c1.82,0,3.11,1.3,3.11,3.11v22.32c0,1.82-1.3,3.11-3.11,3.11h-21.8c-1.82,0-3.11-1.3-3.11-3.11v-22.32Z' />
                <path d='m279.76,0h23.62v181.67h-23.62V0Zm79.29,148.45h-14.53l-16.09.26c-2.25-1.13-3.89-1.04-5.19-2.34l-20.24-20.24c-1.82-1.82-2.86-4.15-2.86-6.49s1.04-4.67,2.86-6.49l62.55-62.29,16.09,16.35-58.13,57.88h30.62c3.89,0,7.53,1.56,10.12,4.15l20.24,20.24c2.85,2.85,4.15,6.49,4.15,10.38v21.8h-23.62v-27.51c0-3.12-2.6-5.71-5.97-5.71Z' />
                <path d='m435.24,177.52l-20.24-20.24c-2.86-2.85-4.15-6.49-4.15-10.38v-61.51c0-3.89,1.3-7.53,4.15-10.38l20.24-20.24c2.6-2.59,6.23-4.15,10.12-4.15h55.54c3.89,0,7.53,1.56,10.12,4.15l20.24,20.24c2.85,2.85,4.15,6.49,4.15,10.38v61.51c0,3.89-1.3,7.53-4.15,10.38l-20.24,20.24c-2.59,2.59-6.23,4.15-10.12,4.15h-55.54c-3.89,0-7.53-1.56-10.12-4.15Zm5.19-19.2h65.4c3.37,0,5.97-2.6,5.97-5.71v-72.93c0-3.11-2.6-5.71-5.97-5.71h-65.4c-3.37,0-5.97,2.59-5.97,5.71v72.93c0,3.11,2.6,5.71,5.97,5.71Z' />
                <path d='m585.77,177.52l-20.24-20.24c-2.86-2.85-4.15-6.49-4.15-10.38V0h23.62v152.6c0,3.11,2.59,5.71,5.97,5.71h25.69v23.36h-20.76c-3.89,0-7.53-1.56-10.12-4.15Z' />
                <path d='m656.62,177.52l-20.24-20.24c-2.85-2.85-4.15-6.49-4.15-10.38V0h23.62v152.6c0,3.11,2.6,5.71,5.97,5.71h25.69v23.36h-20.76c-3.89,0-7.53-1.56-10.12-4.15Z' />
                <path d='m727.48,177.52l-20.24-20.24c-2.85-2.85-4.15-6.49-4.15-10.38v-61.51c0-3.89,1.3-7.53,4.15-10.38l20.24-20.24c2.59-2.59,6.23-4.15,10.12-4.15h56.84c2.08,0,3.89,1.04,5.19,2.34l20.24,20.24c1.82,1.82,2.85,4.15,2.85,6.49s-1.04,4.67-2.85,6.49l-60.99,60.99-16.35-16.09,57.1-57.1h-66.96c-3.37,0-5.97,2.59-5.97,5.71v72.93c0,3.11,2.6,5.71,5.97,5.71h84.09v23.36h-79.15c-3.89,0-7.53-1.56-10.12-4.15Z' />
                <path d='m847.64,75l20.24-20.24c2.59-2.59,6.23-4.15,10.12-4.15h62.81v23.36h-67.74c-3.37,0-5.97,2.59-5.97,5.71v101.99h-23.62v-96.28c0-3.89,1.3-7.53,4.15-10.38Z' />
                <path d='m263.43,78.89l-42.44,51.39,42.44,51.39h-22.46l-30.83-37.5-29.69,37.5h-22.65l42.06-50.82-42.06-51.96h20.75l32.17,38.45,32.17-38.45h20.56Z' />
              </g>
            </g>
          </svg>
        </a>
      </p>
      <div className='flex flex-col gap-2 font-light text-xs'>
        <p className='text-muted-foreground mt-2'>
          Datita es un proyecto que tiene como fin, tener una guia simple para
          entender la economia y poder interpretar mejor los datos economicos,
          creandose un indice que nos permita tener una idea general de la
          situacion economica del pais.
          <Link target='_blank' href='/legal' className='underline'>
            Descargo de Responsabilidad Legal
          </Link>
        </p>
        <p className='text-muted-foreground'>
          El índice por el momento está siendo calculado con los valores
          recientes, hasta el momento de la consulta. Por lo tanto, al cambiar a
          valores de otros periodos el índice no se verá afectado.
        </p>
      </div>
    </footer>
  );
}

export default footer;
