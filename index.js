const https = require('https')
const express = require('express');
const database = require('./config/db.js')
const router = require('./routes/routes.js');
const router_controller  = require('./routes/second_router.js');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const redis = require('./config/redis.connection.js');
const PORT = Number(process.env.PORT) || 8000;
const app = express();


app.set("trust proxy",true);


// const allowedIPs = ["14.97.108.130", "127.0.0.1","172.16.0.20", "::1"];
// app.use((req, res, next) => {
//     let clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

//     if (clientIP) {
//         clientIP = clientIP.split(",")[0]; // Take first IP if multiple exist
//     }

//     console.log("Raw client IP:", req.headers["x-forwarded-for"]);
//     console.log("Remote address:", req.socket.remoteAddress);
//     console.log("Final Client IP:", clientIP);

//     if (!allowedIPs.includes(clientIP)) {
//         return res.status(403).json({ message: "Access Denied: Your IP is not whitelisted." });
//     }
//     next();
// });




// app.use(cors({
//     'https://crm-frontend-gyc8.vercel.app',
//   'https://crm-frontend-gyc8-git-dev-credit-klicks-projects.vercel.app',

//     methods: ['GET', 'POST', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }))
// app.options('*',cors());


const allowedOrigins = [
  'https://crm-frontend-gyc8.vercel.app',
  'https://crm-frontend-gyc8-git-dev-credit-klicks-projects.vercel.app',
];

// Apply CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],

  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Optional: handle preflight for all routes
app.options('*', cors());





// ------------------------------------------------------------------------------------------


app.use(express.json());
app.use(bodyParser.json());




async function RunRedis(){
    try{
            await redis.set("key","Hello Redis for crm");
            const response =  await redis.get("key");
            console.log("Response from redis is ",response);
    }
    catch(error){
           console.log("Error in Connection of Redis ",error);
    }
}


RunRedis();
app.use('/searchapp',router);


app.use('/alphaselector',router_controller);


https.get('https://api64.ipify.org?format=json', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Render IP:', JSON.parse(data).ip));
});

app.get('/', (req, res) => {
    return  res.json({success : true , message : "Backend for crm is start"})
})


app.listen(PORT,'0.0.0.0', () => {
    console.log("Server start on port ", `${PORT}`);
})

//end//







