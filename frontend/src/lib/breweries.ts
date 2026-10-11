import breweriesData from "@/data/breweries_with_geo.json";
import type { Brewery } from "@/lib/checkin";

export function getValidBreweries(): Brewery[] {
  const seenIds = new Set<string>();

  return breweriesData.flatMap((brewery, i) => {
    if (
      typeof brewery.lat !== "number" ||
      !Number.isFinite(brewery.lat) ||
      typeof brewery.lng !== "number" ||
      !Number.isFinite(brewery.lng) ||
      brewery.lat < -90 ||
      brewery.lat > 90 ||
      brewery.lng < -180 ||
      brewery.lng > 180
    ) {
      return [];
    }

    const originalId = String(brewery.id || `brewery_${i}`);
    let uniqueId = originalId;
    let counter = 1;

    while (seenIds.has(uniqueId)) {
      uniqueId = `${originalId}_${counter}`;
      counter++;
    }

    seenIds.add(uniqueId);

    return [{
      ...brewery,
      id: uniqueId,
    } as Brewery];
  });
}
