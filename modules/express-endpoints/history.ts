import {Request} from "express";
import {Response} from "express";
import {getHistoricData, queryAllEntities} from "../data-access/data-access";
import {IDeviceEntity, IHistoricEntry} from "../entities";

export async function getHistory(req: Request, res: Response) {
    const limit = isNaN(req.query.limit) ? 100 : Number(req.query.limit) > 200 || Number(req.query.limit) < 0 ? 50 : Number(req.query.limit);
    const historic: IHistoricEntry[] = await getHistoricData(limit);
    if (req.query.enrichEntities && req.query.enrichEntities != 'false') {
        const allEntities: IDeviceEntity[] = await queryAllEntities();
        historic.forEach(h => {
            h.entity = allEntities.find(e => e.id === h.entityId);
        })
    }
    res.json(historic)
}