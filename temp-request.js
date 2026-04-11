import https from 'https';

const data = JSON.stringify({ email: 'test@example.com', password: 'test1234' });

const options = {
  hostname: 'expense-tracker-omega-lyart-45.vercel.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  console.log('status', res.statusCode);
  console.log('headers', JSON.stringify(res.headers));
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('body', body); });
});

req.on('error', (error) => {
  console.error('error', error);
});

req.write(data);
req.end();
