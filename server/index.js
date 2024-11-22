

const express=require('express');

// const Redis = require("ioredis");
// exports.redis =new Redis({
//     password: '0yScEXMAufjYd75gKQtVTTV25JSK0jcB',
    
//         host: 'redis-12089.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
//         port: 12089
    
// });

const app=express();

const  userRoutes = require("./routes/userRoutes")
const  meetRoutes = require("./routes/meetingRoutes")

// const userRoutes=require('./routes/User');
// const paymentRoutes=require('./routes/Payments');
// const profileRoutes=require('./routes/Profile');
// const CourseRoutes=require('./routes/Course');

const database=require('./config/database');
// const cookieParser=require("cookie-parser")

const cors=require('cors');
// const fileUpload=require("express-fileupload");
// const {cloudnairyconnect}=require('./config/cloudinary');

const dotenv=require("dotenv")
dotenv.config();

const PORT=process.env.PORT || 5000;
database.connect();

app.use(express.json());
// app.use(cookieParser());

app.use(cors(
    {
        origin: ["https://study-notion-eta.vercel.app","http://localhost:3000","www.studynotion.fun","studynotion.fun","https://studynotion.fun","https://www.studynotion.fun","http://127.0.0.1:3000"],
        credentials: true,
    }
));

// app.use(fileUpload(
//     {
//         useTempFiles: true,
//         tempFileDir: "/tmp"
//     }
// ));

// cloudnairyconnect();


// const  {rateLimit }= require('express-rate-limit')

// const limiter = rateLimit({
// 	windowMs: 7 * 60 * 1000, // 15 minutes
// 	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
// 	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
// 	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// 	// store: ... , // Redis, Memcached, etc. See below.
// })

// app.use(limiter)
// const{ rateLimiter} = require("./middlewares/rateLimitRedis.js")

// // app.use(limiter)
// app.use(rateLimiter(2,20));

// app.use('/api/v1/auth',userRoutes);

// app.use('/api/v1/payment',paymentRoutes);

// app.use('/api/v1/profile',profileRoutes);

// app.use('/api/v1/course',CourseRoutes);

// app.use('/api/v1/contact',require('./routes/ContactUs'));


app.use('/api/v1',userRoutes);
app.use("/api/meetings", meetRoutes);

app.get("/",(req, res)=>{
    res.status(200).json({
        message:"Welcome to the API"
    })});

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})