export type Data = {
  time: string[];
  temperature: (number | null)[];
  humidity: (number | null)[];
}

export type DataKey = keyof Data