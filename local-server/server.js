import express from 'express'
import cors from 'cors'
import userRouter from './Routes/UserRoutes'

const app = express()
const port = 8080;
app.use(express.json())

//Routes API
app.use('/api/users', userRouter)

const option = {
    origin: 'http://localhost:8081',
    method: 'POST, PUT, GET, DELETE'
}

app.use(cors(option))

app.listen(port, ()=>{console.log(`Listening on port: ${port}`)})