import { useState } from "react";

type Timeframe = "previous" | "90days" | "year";

export function useTimeframe() {
  const [timeframe, setTimeframe] = useState<Timeframe>("previous");

  const handleTimeframeChange = (value: Timeframe) => {
    setTimeframe(value);
  };

  return { timeframe, handleTimeframeChange };
}
