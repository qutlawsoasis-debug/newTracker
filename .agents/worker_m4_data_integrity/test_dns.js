const dns = require('dns');

dns.lookup('duajmoeuumbqncoftzpu.supabase.co', (err, address, family) => {
  console.log('dns.lookup result:', err, address, family);
});

dns.resolve4('duajmoeuumbqncoftzpu.supabase.co', (err, addresses) => {
  console.log('dns.resolve4 result:', err, addresses);
});
