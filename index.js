require('dotenv').config();
const axios = require('axios');
const exchangeSetup = require('./exchangeSetup');
const websocketSetup = require('./websocketSetup')
const exchange = exchangeSetup();

const app = require('express')();
const port= process.env.PORT;

//define the current trading pair
let tradingPair = process.env.TRADING_PAIR
let wsAccount;
let wsMarketData;
let lastTradedPrice
websocketSetup()

app.use( async (req,res,next) =>{
    const balance = await exchange.fetchBalance();
    data=balance.USDT;
    console.log(data)
    next()
})
app.get('/',(req,res)=>{
   res.send('Nuevo enfoque')
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
    console.log(exchange.urls)
})
process.on('SIGINT', () => {
  if (wsAccount) {
    wsAccount.close();
  }
  if(wsMarketData){
    wsMarketData.close()
  }
  process.exit();
});