import * as express from 'express';
import {welcome} from "./express-endpoints/welcome";
import {getAllEntities, getCurrentState} from "./express-endpoints/entities";
import {pushLog} from "./logger/logger";

export function startExpress() {
    const app = express();
    const port = 4250;

    app.get('/', welcome);
    app.get('/entities', getAllEntities);
    app.get('/current-state', getCurrentState);

    app.listen(port, () => {pushLog(`Express server started on ${port}`)});
}

