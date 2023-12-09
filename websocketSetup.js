require('dotenv').config();

const exchangeSetup = require('./exchangeSetup');
const exchange = exchangeSetup();
const restEndpoint = exchange.urls.api.fapiPrivate
async function websocketSetup(){
    const axios = require('axios');
    const WebSocket = require('ws');
    const webSocketBaseURL = process.env.EXCHANGE_WEBSOCKET_BASE
    const authWebSocketBaseURL = process.env.AUTH_WEBSOCKET_BASE
    const websocketPair = process.env.TRADING_PAIR.toLowerCase()
    const websocketStream = '@aggTrade'
    

    async function createUserDataStream() {
        try {
          const response = await axios.post(
            `${restEndpoint+process.env.LISTENKEY_ENDPOINT}`,
            null,
            {
              headers: {
                'X-MBX-APIKEY': process.env.API_KEY,
              },
            }
          );
      
          const listenKey = response.data.listenKey;
          console.log('Listen Key:', listenKey);
          return listenKey
          // Now you can use this listen key for managing the user data stream (e.g., listen for account updates)
        } catch (error) {
          console.error('Error creating user data stream:', error.response ? error.response.data : error.message);
        }
      }
      
    let listenKey = await createUserDataStream();
    const exchangeWebsocketMarketDataEndpoint = webSocketBaseURL+websocketPair+websocketStream;
    const authenticadeWebsocketEndpoint = `${authWebSocketBaseURL}/${listenKey}?listenKey=${listenKey}`
    async function refreshUserDataStream(){
        try {
            const response = await axios.put(
                `${restEndpoint+process.env.LISTENKEY_ENDPOINT}`,
                null,
                {
                    headers: {
                      'X-MBX-APIKEY': process.env.API_KEY,
                    },
                  }
            )
            if (response.status === 200){
                console.log('ListenKey refreshed') 
            }
        } catch(error){
            console.error('Error trying to refresh ListenKey',error.response? error.response.data : error.message)
        }
    }

    function connectWebSockets() {

        wsAccount = new WebSocket(authenticadeWebsocketEndpoint);
        wsMarketData =new WebSocket(exchangeWebsocketMarketDataEndpoint)
        
        wsAccount.on('open', () => {
            console.log('Account WebSocket connection opened');
            wsAccount.send(JSON.stringify({
                "method": "REQUEST",
                "params":
                [
                `${listenKey}@account`, // request name 1
                `${listenKey}@balance`, // request name 2, if existing
                ],
                "id": 15 // request ID.
            }))        

        });
        wsAccount.on('message', (data) => {
            data=data.toString()
            console.log(data)
        const message = JSON.parse(data);

        if (message.ping) {
            console.log('Received PING, sending PONG')            
            wsAccount.pong();
        } else {
            console.log(message.result[0].res);
            
        }
        });
    
        wsAccount.on('pong', () => {
        console.log('Received Pong response');
        });
    
        wsAccount.on('error', (error) => {
        console.error('WebSocket error:', error);
        });
    
        wsAccount.on('close', (code, reason) => {
        console.log(`WebSocket connection closed, code: ${code}, reason: ${reason}`);
        // Reconnect on close
        connectWebSockets();
        });

        wsMarketData.on('open', () => {
            console.log('Market Data WebSocket connection opened');          

        });
        wsMarketData.on('message', (data) => {
            data=data.toString()
            const message = JSON.parse(data);
            
             if (message.ping) {
            console.log('Received PING, sending PONG')            
            wsMarketData.pong();
            } else {
                console.log(message.p);
                lastTradedPrice = message.p                
            }
        });
    
        wsMarketData.on('pong', () => {
            console.log('Received Pong response');
        });
    
        wsMarketData.on('error', (error) => {
            console.error('WebSocket Market Data error:', error);
        });
    
        wsMarketData.on('close', (code, reason) => {
             console.log(`WebSocket Market Data connection closed, code: ${code}, reason: ${reason}`);
        // Reconnect on close
        connectWebSockets();
        });
    }

    // Initial connection
    connectWebSockets();
}
module.exports= websocketSetup;
// Gracefully close the WebSocket connection when the Node.js process is terminated
