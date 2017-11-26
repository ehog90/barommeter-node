import {Request} from "express";
import {Response} from "express";
import {queryAllEntities, queryDevicesUp} from "../data-access/data-access";
import {DeviceType, ICurrentState, IDeviceEntity} from "../entities";

export async function getAllEntities(req: Request, res: Response) {
    const allEntities = await queryAllEntities();
    res.json(allEntities)
}

export async function getCurrentState(req: Request, res: Response) {
    const upDevices: IDeviceEntity[] = await queryDevicesUp();
    const result: ICurrentState = {
        fixedDeviceUp: upDevices.filter(e => e.isFixed).length !== 0,
        externalUp: upDevices.filter(e => e.deviceType == DeviceType.ExternalPlace).length !== 0,
        mobileDeviceUp: upDevices.filter(e => !e.isFixed).length !== 0,
        upEntities: req.query['detailed'] && req.query['detailed'] != 'false' ? upDevices : undefined
    };
    res.json(result);
}