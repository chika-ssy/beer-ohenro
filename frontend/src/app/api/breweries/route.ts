// src/app/api/breweries/route.ts
import { NextResponse } from 'next/server';
// JSONを直接インポートする（Next.jsがビルド時に最適化してくれます）
import breweriesData from '@/data/breweries_with_geo.json';

export async function GET() {
  try {
    const seenIds = new Set();
    
    // インポートしたデータに対してフィルタリングを行う
    const validBreweries = breweriesData.filter((brewery: any, i: number) => {
      const isValidGeo = typeof brewery.lat === 'number' && typeof brewery.lng === 'number';
      if (!isValidGeo) return false;

      let originalId = brewery.id || `brewery_${i}`;
      let uniqueId = originalId;
      let counter = 1;
      
      while (seenIds.has(uniqueId)) {
        uniqueId = `${originalId}_${counter}`;
        counter++;
      }
      
      seenIds.add(uniqueId);
      brewery.id = uniqueId;
      
      return true;
    });

    return NextResponse.json(validBreweries);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
}