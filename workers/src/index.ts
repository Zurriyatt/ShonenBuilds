import { customHandle } from "./lib/customExpress.js";
import { healthCheckGET } from "./lib/health.js";
import { weeklyProgress } from "./lib/workers/weekly-progress.js";
const PORT: number = 3001;

const server = new customHandle();

server.get('/api/health',healthCheckGET);
server.post('/api/workers/weekly-progress', weeklyProgress);
server.listen(PORT, () => {
    console.log('callback reached the server and it is running!')
})