

import * as moment from "moment";

export function pushLog(log: string) {
    console.log(`[${moment().format()}] ${log}`)
}