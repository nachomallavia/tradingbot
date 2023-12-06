require('dotenv').config();
const exchangeSetup = require('./exchangeSetup');
const exchange = exchangeSetup();

const app = require('express')();
const port= process.env.PORT;
let data;
let klines;
async function getKlineData(symbol) {
    try {        

      const timeframes = ['5m', '15m', '1h', '4h', '1d'];
      const limit = 200; // Set the limit to the desired number of Klines

      // Map timeframes to an array of promises
      const promises = timeframes.map(async (timeframe) => {
        try {
          // Fetch Kline data for the current timeframe
          const klines = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
  
          // Log the Kline data
          console.log(`Kline data for ${symbol} - ${timeframe}:`, klines);
  
          // Return an object for each timeframe
          return { symbol, timeframe, klines };
        } catch (error) {
          console.error(`Error fetching Kline data for ${symbol} - ${timeframe}:`, error.message);
          throw error; // Throw the error to ensure Promise.all catches it
        }
      });
  
      // Wait for all promises to resolve
      const allKlineObjects = await Promise.all(promises);
  
      // Log the array of objects
      
      console.log(allKlineObjects);
      klines = allKlineObjects;
    } catch (error) {
      console.error('Error fetching Kline data:', error.message);
    }
  }
getKlineData('BTC/USDT');
app.use( async (req,res,next) =>{
    const balance = await exchange.fetchBalance();
    data=balance.USDT;
    console.log(data)
    next()
})
app.get('/',(req,res)=>{
    res.send(klines[0])
    // res.send(`HOLIS NODE ${klines[0].timeframe}`)
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})