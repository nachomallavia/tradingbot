require('dotenv').config();
const express = require('express')
const axios = require('axios');
const exchangeSetup = require('./exchangeSetup');
const websocketSetup = require('./websocketSetup')
const exchange = exchangeSetup();
const app = express();
const port= process.env.PORT;
const allowedIpString = process.env.ALLOWED_IPS
const allowedIpArray = allowedIpString.split(',')

let positionSize = 10;

//define the current trading pair
let tradingPair = process.env.TRADING_PAIR
let wsAccount;
let wsMarketData;
let lastTradedPrice
websocketSetup()
app.use(express.json())
app.use( async (req,res,next) =>{
    
    let data = await exchange.fetchPositionsRisk();
    data = data.filter((position,index)=>{
      return position.contracts != 0;
    })
    console.log(data)
    next()
})
app.use(async(req,res,next)=>{
  const allowedIp = allowedIpArray.indexOf(req.ip)
  if(allowedIp > -1){
    next()
  } else{
    console.log(req.ip)
    res.send('IP NOT ALLOWED')
  }
})
app.get('/',(req,res)=>{
   res.sendFile(__dirname+'/index.html')
})
app.post('/open',async(req,res)=>{
  const body = req.body;
  

  if(body.password === process.env.BOT_PASSWORD ){
    console.log(body)
    console.log(req.ip)
    let symbol = body.symbol?body.symbol:undefined;
    let type = body.type?body.type:undefined;
    let side = body.side?body.side:undefined;
    let amount = body.amount?body.amount:undefined;
    let price = body.price?body.price:undefined;
    let quoteOrderQty = body.params.quoteOrderQty?body.params.quoteOrderQty:positionSize;
    let order = undefined
    let timestamp = new Date.getTime()
    let orderParams = {
      symbol,
      type,
      side,
      amount,
      price,
      params:{
        quoteOrderQty,
      },
      timestamp
    }
    // order = await exchange.createOrder(orderParams);
    wsAccount.send()
    if(order != undefined){
      res.send('ORDER CREATED')
    }else{
      res.send('Order not created')
    }

  } 
  
})
app.listen(port,()=>{
    console.log(`listening on port ${port}`)
    // console.log(exchange.urls)
})
let balance
async function getOpenPositions(){
  console.log(balance)
}
// getOpenPositions()
// setInterval(async()=>{
  
//   console.log('-----------------------------------')
//   console.log(balance?balance:'Loading...')
// },1000)
process.on('SIGINT', () => {
  if (wsAccount) {
    wsAccount.close();
  }
  if(wsMarketData){
    wsMarketData.close()
  }
  process.exit();
});