# Argentina 🐂 o 🐻 (Bull or Bear)

## Project Overview

This project is a web application that provides a simplified economic index for Argentina. It aims to help users understand the current economic situation of the country through easy-to-interpret indicators and a custom "Bull or Bear" index.

Live version: [https://datita.0xkoller.me/](https://datita.0xkoller.me/)

## Features

- Real-time economic indicators including:
  - Monthly Inflation
  - Year-over-year Inflation
  - Country Risk
  - 30-day Deposit Rate
  - Blue Dollar Rate
  - Official Dollar Rate
  - Exchange Rate Gap
- Custom "Bull or Bear" index calculated from various economic factors
- Dark mode support
- Responsive design for various screen sizes

## Index Calculation

The Bull/Bear index is based on several key economic indicators, each with a specific weight:

- Country Risk (20%)
- Year-over-year Inflation (20%)
- Monthly Inflation (15%)
- 30-day Fixed Term Deposit Rate (15%)
- Previous Month's 30-day Fixed Term Deposit Rate (15%)
- Exchange Rate Gap (Blue Dollar vs. Official) (15%)

Data is obtained from official and reliable sources, including INDEC, BCRA, and financial data provider APIs. If data is not updated, the latest available data is used. Each indicator is normalized on a scale of 0 to 100, where 0 represents the worst historical situation and 100 the best. The weights are then applied to calculate the final index, which ranges from 0 (extremely bearish) to 100 (extremely bullish).

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion for animations

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/argentina-bull-or-bear.git
   ```
2. Navigate to the project directory:
   ```
   cd argentina-bull-or-bear
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Usage

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Routes

- `/api/datita`: Fetches and processes economic data from various sources.

## Components

- `EconomicIndicatorsGrid`: Displays the main economic indicators and the Bull/Bear index.
- `Footer`: Renders the page footer with project information and credits.

## Customization

The project uses custom fonts (Geist Sans and Geist Mono) and a custom color scheme. You can modify these in the `app/layout.tsx` and `tailwind.config.js` files.

## Contributing

Contributions are welcome and appreciated! Here's how you can contribute:

1. **Code Contributions**: If you have an improvement or new feature to suggest, please submit a Pull Request with the implemented changes. All contributions with correct implementation will be greatly appreciated.

2. **Suggestions without Implementation**: For ideas, suggestions, or feedback without code implementation, please reach out via X (formerly Twitter) to [@0xKoller](https://twitter.com/0xKoller).

We value all forms of contribution and look forward to improving this project together!

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

Developed by [0xKoller](https://twitter.com/0xKoller)

## Disclaimer

This project is for informational purposes only. Please refer to the [Legal Disclaimer](https://datita.0xkoller.me/legal) for more information.
