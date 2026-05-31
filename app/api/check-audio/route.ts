import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  try {
    // Prevent directory traversal
    if (file.includes('..')) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    // Le fichier vient sous la forme "/sound/mot-men.mp3"
    const relativePath = file.startsWith('/') ? file.slice(1) : file;
    const filePath = path.join(process.cwd(), 'public', relativePath);
    
    const exists = fs.existsSync(filePath);
    
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('Check Audio Error:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
