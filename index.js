import express, { json } from 'express'
const app = express()
import { connect } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import userRoute from './routes/usersRoutes.js'
import authRoute from './routes/authRoutes.js'
import postRoute from './routes/postRoutes.js'
import { createServer } from 'http'

const httpServer = createServer(app);

app.use(cors({
    origin: 'http://localhost:3000'
}));

connect(process.env.MONGO_URL).then(() => {
    console.log("mongoose connected",);
}).catch((err) => {
    console.log("mongoose url error", err);
})
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(json())
app.use(cors())

app.use(morgan('tiny'));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use('/api', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/post', postRoute)

httpServer.listen(3003, () => {
    console.log('server running succesfully');
}) 