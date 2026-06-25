const http = require('http');

const data = JSON.stringify({
  email: 'test@university.edu',
  fullName: 'Test User',
  major: 'CS',
  gradYear: '2026',
  bio: '',
  avatar: '🎓',
  teachSkills: [],
  learnSkills: [],
  contactInfo: {},
  password: 'password123',
  isGoogle: false
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
