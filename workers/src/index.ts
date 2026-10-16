import { customHandle } from "./lib/customExpress.js";
import { healthCheckGET } from "./lib/health.js";
import { weeklyProgress } from "./lib/workers/weekly-progress.js";
import { streakReminder } from "./lib/workers/streak-reminder.js";
const PORT: number = 3001;

const server = new customHandle();

server.get('/api/health',healthCheckGET);
server.post('/api/workers/weekly-progress', weeklyProgress);
server.post("/api/workers/streak-reminder",streakReminder);

server.listen(PORT, () => {
    console.log('callback reached the server and it is running!')
})
