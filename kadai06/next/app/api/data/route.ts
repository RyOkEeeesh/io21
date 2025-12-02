import { NextResponse } from 'next/server';
import * as fs from 'fs/promises'; // 👈 非同期操作のため fs/promises を使用
import path from 'path';

// センサーデータの型定義
interface SensorRecord {
  time: string;
  temperature: number;
  humidity: number;
  [key: string]: string | number;
}

// Dockerボリュームから共有されるCSVファイルのパス
const CSV_PATH = path.join('/data', 'kadai06.csv');

/**
 * GETリクエストを処理し、CSVファイルから最新のセンサーデータを取得します。
 */
// 修正: 名前付きエクスポートとして定義 (App Routerの仕様)
export async function GET() { 
  try {
    // ⚠️ fs.existsSync は同期関数であるため、代わりに readFile の try/catch でエラーを捕捉します。

    // 1. ファイルの読み込み (非同期)
    const fileContent = await fs.readFile(CSV_PATH, 'utf-8');
    
    // 改行で分割し、空行をフィルタリング
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');

    if (lines.length <= 1) {
      // ヘッダーのみ、またはファイルが空の場合
      return NextResponse.json({ data: [], error: "CSVファイルにデータが見つかりません。" }, { status: 200 });
    }

    // 2. ヘッダーとレコードのパース
    const headers = lines[0].split(',').map(h => h.trim());

    const records: SensorRecord[] = lines.slice(1).map(line => {
      const values = line.split(',');
      const record: { [key: string]: string | number } = {};

      headers.forEach((header, index) => {
        // オプショナルチェイニングとNull合体演算子で安全に値を取得
        const value = values[index]?.trim() ?? '';
        
        // 'time' カラム、または数値に変換できないものは文字列のまま
        record[header] = header === 'time' || isNaN(Number(value))
          ? value
          : Number(value);
      });

      return record as SensorRecord;
    });

    // 3. 末尾60行に制限
    const latestRecords = records.slice(-60);

    return NextResponse.json({ data: latestRecords }, { status: 200 });

  } catch (error: any) {
    // ファイルが見つからなかった場合（ENOENT）を含むエラー処理
    if (error.code === 'ENOENT') {
         return NextResponse.json({
            error: 'Data file not found or Python not started yet.'
         }, { status: 404 });
    }
    
    console.error("Failed to read or parse CSV:", error);
    return NextResponse.json({ 
      error: `Internal Server Error during file reading/parsing: ${error.message}`
    }, { status: 500 });
  }
}