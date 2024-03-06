import { NextResponse } from 'next/server';

export async function GET(req: Request, res: Response) {
  return new NextResponse(JSON.stringify({ message: 'Hello, World!' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
