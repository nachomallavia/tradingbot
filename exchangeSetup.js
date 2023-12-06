require('dotenv').config();
function exchangeSetup(){
    const ccxt = require('ccxt');
    let apiKey="";
    let apiSecret="";
    if( (process.env.TESTNET === "true") ){
        apiKey=process.env.TESTNET_API_KEY
        apiSecret=process.env.TESTNET_SECRET
    } else{
        apiKey=process.env.API_KEY;
        apiSecret=process.env.SECRET
    }

    const exchange = new ccxt[process.env.EXCHANGE]({
    apiKey:apiKey,
    secret:apiSecret,    
    })
    exchange.setSandboxMode((process.env.TESTNET==="true"))   
    return exchange;
}
module.exports = exchangeSetup;