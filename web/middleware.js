import { NextRequest, NextResponse } from 'next/server';

const logstahshUrl = 'http://localhost:1234'; // TODO: add env var

export async function middleware(req) {
  // Disable middleware in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }
  const response = await NextResponse.next();
  if (req.url.includes('api')) {
    var headers = {};
    for (const pair of req.headers.entries()) {
      headers[pair[0]] = pair[1];
    }
    var body = {};
    if (headers['content-type'] === 'application/json') {
      body = await req.json();
    } else {
      //for streams
      body['data'] = await req.text();
    }
    const logData = {
      route: req.nextUrl.pathname,
      body: body,
      headers: headers,
      ip: headers['x-real-ip'] || req.ip,
      userAgent: req.userAgent,
      response: response,
    };
    fetch(logstahshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    })
      .then(response => {
        if (response.ok) {
          console.log('Data sent successfully!');
        } else {
          console.error('Error sending data:', response.status);
        }
      })
      .catch(error => {
        console.error('Error sending data:', error);
      });
  }
  return response;
}
