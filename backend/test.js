const axios = require('axios');

async function run() {
  try {
    const incRes = await axios.post('http://localhost:4000/api/incomes', {
      amount: 150,
      description: 'Sueldo prueba',
      date: '2026-06-09'
    });
    console.log('Income added, id:', incRes.data.id);

    const list = await axios.get('http://localhost:4000/api/incomes');
    console.log('Current incomes count:', list.data.length);
    console.log('Sample payload:', list.data[0]);
  } catch (e) {
    console.error('API test failed:', e.message);
  }
}

run();
