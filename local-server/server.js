import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import fs from 'fs/promises';
import userRouter from './Routes/UserRoutes.js'
import tagRouter from './Routes/TagRoutes.js'
import reportRouter from './Routes/ReportRoutes.js';
import adminRouter from './Routes/AdminRoutes.js'
import notificationRouter from './Routes/NotificationRoutes.js';
import sequelize from './database.js'
import 'dotenv/config';
import setupAssociations from './Models/associations.js';
import { countRelevanceScore } from './Services/TagService.js'
import { fetchStatistic } from './Services/AdminService.js'

const app = express()

app.use(cors())
app.use(express.json())

setupAssociations();

cron.schedule('0 0 * * *', () => {
    countRelevanceScore();
});

let allRoads = []

async function loadRoad(){
    try{
        console.log("Membaca data jalan dari file JSON (Native)...");
        
        // 1. Baca seluruh isi file sebagai string
        const rawData = await fs.readFile('./Static/bandung_raya_roads.json', 'utf8');
        
        // 2. Ubah string menjadi objek JSON
        const parsedData = JSON.parse(rawData);

        // 3. Ambil array elements dan filter hanya yang bertipe 'way'
        if (parsedData.elements) {
            allRoads = parsedData.elements.filter(value => value.type === 'way');
        }

        console.log(`Roads data successfully loaded! Total: ${allRoads.length} ruas jalan.`);
    }
    catch(error){
        console.error(`Error while loading road data: ${error}`);
        throw error; // Lempar error agar server membatalkan startup jika file tidak ditemukan
    }
}
// ------------------------------------------------

//Routes API
const port = 8080
app.use('/api/users', userRouter)
app.use('/api/tags', tagRouter)
app.use('/api/reports', reportRouter)
app.use('/api/admin', adminRouter)
app.use('/api/notifications', notificationRouter)

app.use('/uploads', express.static('uploads'));

app.get('/api/roads', (req,res)=>{
    const s = parseFloat(req.query.s)
    const w = parseFloat(req.query.w)
    const n = parseFloat(req.query.n)
    const e = parseFloat(req.query.e)

    if(isNaN(s) || isNaN(w) || isNaN(n) || isNaN(e)){
        return res.status(400).json({
            message: "Bounding box parameters not valid"
        })
    }

    const visibleRoads = allRoads.filter((way)=>{
        if(!way.geometry) return false
        return way.geometry.some((pos)=>
            (pos.lat >= s && pos.lat <= n) &&
            (pos.lon >= w && pos.lon <= e)
        )
    })

    return res.json(visibleRoads)
})

async function startServer(){
    try{
        console.log('==============================================')
        console.log('Starting server initialization...')
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('Database connected')
        console.log('==============================================')
        
        // Menunggu file JSON selesai dibaca dan diparsing
        await loadRoad() 
        
        console.log('==============================================')
        countRelevanceScore()
        app.listen(port, ()=>{
            console.log(`listening on port: ${port}`)
        })
    }
    catch(error){
        console.error('Cannot start the server:', error)
    }
}

startServer()