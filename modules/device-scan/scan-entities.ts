import {checkEntityAvailability, commitEntityState, queryAllEntities} from "../data-access/data-access";
import {DeviceType, IDeviceEntity, IDeviceEntityWithStatus} from "../entities";
import * as portscanner from 'portscanner';
import {pushLog} from "../logger/logger";
import {async} from "rxjs/scheduler/async";
import {googleFirebaseNotification} from "../realtime-notification/google-firebase";

const isReachable = require('is-reachable');

function logPortStatus(port: number, entity: IDeviceEntity, status: portscanner.Status) {
    pushLog(`Port #${port} status for ${entity.deviceType == DeviceType.ExternalPlace ? 'external' : 'home'} entity ${entity.deviceName} (ID: ${entity.id}) is ${status}`);
}

function logReachableStatus(reachable: boolean, entity: IDeviceEntity) {
    pushLog(`INET reachable status for ${entity.deviceType == DeviceType.ExternalPlace ? 'external' : 'home'} entity ${entity.deviceName} (ID: ${entity.id}) is ${reachable ? 'reachable' : 'unreachable'}`);
}

function logTheChanges(alreadyReachable: boolean, reachable: boolean, entity: IDeviceEntity) {
    pushLog(`${entity.deviceType == DeviceType.ExternalPlace ? 'External' : 'Home'} entity ${entity.deviceName} (ID: ${entity.id}) was ${alreadyReachable ? 'reachable' : 'unreachable'} and now it's ${reachable ? 'reachable' : 'unreachable'}`);
}


export async function scanEntities() {
    const entities = await queryAllEntities();
    const entityStates: IDeviceEntityWithStatus[] = await Promise.all(entities.map(async entity => {
        const availablePorts: number[] = [];
        let up = false;
        if (entity.deviceType == DeviceType.ExternalPlace) {
            const portStatus = await portscanner.checkPortStatus(80, entity.host);
            logPortStatus(80, entity, portStatus);
            if (portStatus === 'open') {
                availablePorts.push(80);
                up = true;
            }
        } else {
            if (entity.ports.length !== 0) {
                for (const port of entity.ports) {
                    const portStatus = await portscanner.checkPortStatus(port, entity.ip);
                    logPortStatus(port, entity, portStatus);
                    if (portStatus === 'open') {
                        availablePorts.push(port);
                        up = true;
                    }
                }
                if (!up && availablePorts.length === 0) {
                    up = await isReachable(entity.ip);
                }
            } else {
                const portStatus = await portscanner.checkPortStatus(80, entity.ip);
                logPortStatus(80, entity, portStatus);
                if (portStatus === 'open') {
                    availablePorts.push(80);
                    up = true;
                } else {
                    up = await isReachable(entity.ip);
                }
            }
        }
        return {entity: entity, isUp: up, openPorts: availablePorts};
    }));
    await processScannedEntities(entityStates);
}

async function processScannedEntities(entityStates: IDeviceEntityWithStatus[]) {
    for (const entityWithState of entityStates) {
        const isEntityAlreadyReachable = await checkEntityAvailability(entityWithState.entity);
        logTheChanges(isEntityAlreadyReachable, entityWithState.isUp, entityWithState.entity);
        await commitEntityState(entityWithState.entity, isEntityAlreadyReachable, entityWithState.isUp);
        await googleFirebaseNotification(entityWithState, isEntityAlreadyReachable);
    }
}

