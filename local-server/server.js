import express from 'express'
import cors from 'cors'
import userRouter from './Routes/UserRoutes.js'
import sequelize from './database.js'
import 'dotenv/config';

const app = express()

// const option = {
//     origin: process.env.SERVER_URL,
//     methods: 'POST, PUT, GET, DELETE'
// }

app.use(cors())
app.use(express.json())

//Routes API
const port = 8080
app.use('/api/users', userRouter)

app.listen(port, async ()=>{
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log(`Listening on port: ${port}`)
        console.log('Database connected');
    } catch (error) {
        console.error('Cannot connent to the database:', error);
    }
})