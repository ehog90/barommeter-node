import {startExpress} from "./modules/express-main";
import {connectToPostgres} from "./modules/data-access/data-access";
import {setUpCronJobs} from "./modules/cron/cron-jobs";

const bootUpApp = async () => {
    await connectToPostgres();
    startExpress();
    setUpCronJobs();
};

bootUpApp();

