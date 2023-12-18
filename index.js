require('dotenv').config();
const axios = require('axios');
const exchangeSetup = require('./exchangeSetup');
const websocketSetup = require('./websocketSetup')
const exchange = exchangeSetup();
const express = require('express')
const app = express();
const port= process.env.PORT;

//define the current trading pair
let tradingPair = process.env.TRADING_PAIR
let wsAccount;
let wsMarketData;
let lastTradedPrice
websocketSetup()
app.use(express.json())
app.use( async (req,res,next) =>{
    const balance = await exchange.fetchBalance();
    data=balance.USDT;
    console.log(data)
    next()
})
app.get('/',(req,res)=>{
   res.sendFile(__dirname+'/index.html')
})
app.post('/open',(req,res)=>{
  const message = req.body;
  console.log(message)
  res.send('Message Received')
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
    console.log(exchange.urls)
})
let balance
async function getOpenPositions(){
  console.log(balance)
}
getOpenPositions()
setInterval(async()=>{
  
  console.log('-----------------------------------')
  console.log(balance?balance:'Loading...')
},1000)
process.on('SIGINT', () => {
  if (wsAccount) {
    wsAccount.close();
  }
  if(wsMarketData){
    wsMarketData.close()
  }
  process.exit();
});