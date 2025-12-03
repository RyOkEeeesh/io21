import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';
import { Data, DataKey } from '@/types/data';

const CSV_PATH = path.join('/data', 'kadai06.csv');

export async function GET() {
  try {
    const fileContent = await fs.readFile(CSV_PATH, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length <= 1)
      return NextResponse.json({ data: [] }, { status: 200 });

    const data: Data = {
      time: [],
      temperature: [],
      humidity: [],
    };
    const headers: DataKey[] = lines[0]
      .split(',')
      .map(h => h.trim()) as DataKey[];

    lines
      .slice(1)
      .slice(-60)
      .forEach(line => {
        const values = line.split(',');

        headers.forEach((header, index) => {
          const valueString = values[index]?.trim() ?? '';

          if (header === 'time') {
            data.time.push(valueString);
            return;
          }
          const valNam = Number(valueString);
          data[header].push(isNaN(valNam) ? null : valNam);
        });
      });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'ENOENT')
      return NextResponse.json({ status: 404 });

    console.error('Failed to read or parse CSV:', error);
    return NextResponse.json({ status: 500 });
  }
}