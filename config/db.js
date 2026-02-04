const mongoose = require('mongoose')

const dbUrl = 'mongodb://0.0.0.0:27017/Restuarant'

mongoose.connect(dbUrl,{
   
}).catch(err=>console.error('Connection Error:', err))

mongoose.connection.on('connected', () => console.log('MongoDB Connected'));

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});
