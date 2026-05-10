import fs from 'fs'
import * as readline from 'readline'
import { stdin as input, stdout as output } from 'process'

const rl = readline.createInterface({ 
    input: fs.createReadStream('input1.txt'),
    output,
    crlfDelay: Infinity
})

const gravitation = 1.5
const results = []

function timeDecay(){
    for(let i = 0; i < results.length; i++){
        if(results[i].verified){
            results[i].score = 9999;
        } else {
            const baseVote = Math.max(0, (results[i].approve - results[i].reject)) + 1;
            const divisor = Math.pow(results[i].days + 1, gravitation);
            results[i].score = baseVote / divisor;
        }
    }
}

(async () => {
    for await(const line of rl){
        if (!line.trim()) continue;
        
        const parts = line.split(' ');
        const name = parts[0];
        const approve = parseInt(parts[1]);
        const reject = parseInt(parts[2]);
        const days = parseInt(parts[3]);
        const verified = parts[4] === 'true';

        results.push({name, approve, reject, days, verified});
    }
    
    timeDecay();

    // Urutkan berdasarkan skor tertinggi
    results.sort((a, b) => b.score - a.score);

    console.log("=== TIME DECAY SCORES ===");
    for(let i = 0; i < results.length; i++){
        console.log(`[Rank ${i+1}] ${results[i].name}`);
        console.log(`  Skor     : ${results[i].score.toFixed(4)}`);
        console.log(`  Vote     : ${results[i].approve} A / ${results[i].reject} R`);
        console.log(`  Umur     : ${results[i].days} hari`);
        console.log(`  Verified : ${results[i].verified}\n`);
    }
})();