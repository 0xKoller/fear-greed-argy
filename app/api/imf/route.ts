import { NextResponse } from 'next/server'

const IMF_BASE_URL = 'https://www.imf.org/external/datamapper/api/v1'

const INDICATORS = {
  NGDP_RPCH: 'Real GDP growth',
  PCPIPCH: 'Inflation, average consumer prices',
  LUR: 'Unemployment rate',
  BCA_NGDPD: 'Current account balance (% of GDP)',
  GGXWDG_NGDP: 'General government gross debt (% of GDP)',
  GGXCNL_NGDP: 'General government net lending/borrowing (% of GDP)',
  NGDPDPC: 'GDP per capita, current prices',
  NID_NGDP: 'Total investment (% of GDP)',
  NGSD_NGDP: 'Gross national savings (% of GDP)',
  PPPEX: 'Implied PPP conversion rate'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Fetch data for all indicators in parallel
    const indicatorPromises = Object.keys(INDICATORS).map(async (indicator) => {
      const response = await fetch(`${IMF_BASE_URL}/${indicator}/ARG`)
      
      if (!response.ok) {
        throw new Error(`IMF API responded with status: ${response.status} for indicator ${indicator}`)
      }
      
      const data = await response.json()
      return {
        indicator,
        name: INDICATORS[indicator as keyof typeof INDICATORS],
        data: data
      }
    })

    const results = await Promise.all(indicatorPromises)
    
    // Transform the results into a more readable format
    const formattedData = results.reduce((acc, { indicator, name, data }) => {
      acc[indicator] = {
        name,
        values: data.values,
        unit: data.units?.[0]
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json(formattedData)

  } catch (error) {
    console.error('Error fetching IMF data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IMF data' },
      { status: 500 }
    )
  }
}
