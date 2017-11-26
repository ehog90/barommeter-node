import {pushLog} from "../logger/logger";
import {scanEntities} from "../device-scan/scan-entities";

const cron = require('node-cron');

export function setUpCronJobs() {
    cron.schedule('* * * * *', () =>{
        pushLog("Device checking initiated");
        scanEntities();
    });
}

