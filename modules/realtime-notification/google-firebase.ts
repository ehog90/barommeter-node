import {DeviceType, IDeviceEntity, IDeviceEntityWithStatus, IRealtimeNotificationData} from "../entities";
import {firebaseKey} from "../restricted/restricted-data";
import {queryAllFirebaseRegistrations} from "../data-access/data-access";
import {customHttpRequestAsync} from "../utils/https-request";
import {RequestOptions} from "https";
import {pushLog} from "../logger/logger";

function pushNotifStateToLog(entityWithStatus: IDeviceEntityWithStatus, previousDeviceStatus: boolean) {
    let changedMessage = "state change is sent to devices.";
    if (entityWithStatus.isUp == previousDeviceStatus) {
        changedMessage = "state change is NOT sent to devices."
    }
    pushLog(`${entityWithStatus.entity.deviceType == DeviceType.ExternalPlace ? 'External' : 'Home'} entity ${entityWithStatus.entity.deviceName} (ID: ${entityWithStatus.entity.id}) ${changedMessage}`);
}

export const firebaseSettings: RequestOptions = {
    host: 'fcm.googleapis.com',
    port: 443,
    path: '/fcm/send',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${firebaseKey}`
    }
};

export async function googleFirebaseNotification(entityWithStatus: IDeviceEntityWithStatus, previousDeviceStatus: boolean): Promise<boolean> {
    pushNotifStateToLog(entityWithStatus, previousDeviceStatus);
    if (entityWithStatus.isUp == previousDeviceStatus) {
        //Nothing to do
        return Promise.resolve(false)
    } else {
        const entity = entityWithStatus.entity;
        const firebaseRegs = await queryAllFirebaseRegistrations();
        const firebaseMessage = {
            device_data: {
                id: entity.notifKey,
                ko: entity.isFixed,
                dt: entity.deviceType,
                ds: entityWithStatus.isUp ? 'ON' : 'OFF',
                at: Date.now,
                en: entity.deviceName
            }
        };
        const firebasePayload = {
            time_to_live: 300,
            registration_ids: firebaseRegs.map(f => f.id),
            data: firebaseMessage
        };
        const result = await customHttpRequestAsync(firebaseSettings, firebasePayload);
        return Promise.resolve(true);
    }
}