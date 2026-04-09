import express from 'express'
import cors from 'cors'
import userRouter from './Routes/UserRoutes.js'
import tagRouter from './Routes/TagRoutes.js'
import sequelize from './database.js'
import 'dotenv/config';
import setupAssociations from './Models/associations.js';

const app = express()

// const option = {
//     origin: process.env.SERVER_URL,
//     methods: 'POST, PUT, GET, DELETE'
// }

app.use(cors())
app.use(express.json())

//setup asosiasi sequelize
setupAssociations();

//Routes API
const port = 8080
app.use('/api/users', userRouter)
app.use('/api/tags', tagRouter)

app.use('/uploads', express.static('uploads'));

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