import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  try {
    // We use the tw-ob client parameter as it usually returns a pure mp3 without captcha
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=th&client=tw-ob`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });

    if (!response.ok) {
      throw new Error(`Google TTS responded with ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year to avoid spamming the API
      },
    });
  } catch (error) {
    console.error('TTS Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

