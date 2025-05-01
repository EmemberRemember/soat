import { DailyPerformances } from "@/types/enrollment";

export default function getLastPerformanceDate(
  performances: DailyPerformances
) {
  const dates = Object.keys(performances).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );
  const lastDateStr = dates[dates.length - 1];

  return new Date(lastDateStr).getTime();
}
