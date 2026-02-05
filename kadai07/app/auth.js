// auth-test.mjs などの名前で保存
import path from 'node:path';
import fs from 'node:fs/promises';
import process from 'node:process';
import {authenticate} from '@google-cloud/local-auth';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json'); // トークン保存先

async function getAccessToken() {
  const auth = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
    port: 3000
  });

  if (auth.credentials) {
    // 取得したトークンをファイルに書き出す
    await fs.writeFile(TOKEN_PATH, JSON.stringify(auth.credentials));
    console.log('Token saved to:', TOKEN_PATH);
  }
}

getAccessToken();