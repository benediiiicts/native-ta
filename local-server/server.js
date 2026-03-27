import express from 'express'
import cors from 'cors'
import db from './database'

const app = express()
const port = 8080;
const option = {
    origin: 'http://localhost:8081',
    method: 'POST, PUT, GET, DELETE'
}

app.use(cors(option))

app.listen(port, ()=>{console.log(`connected on port: ${port}`)})