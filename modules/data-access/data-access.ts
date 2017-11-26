import {Client} from 'pg';
import {IDeviceEntity, IRealtimeNotificationData} from "../entities";
import {pushLog} from "../logger/logger";
import {postgresCredentials} from "../restricted/restricted-data";

//Later will introduce pooling
export const client = new Client(postgresCredentials);

export async function connectToPostgres() {
    pushLog("Connecting to Postgres.");
    await client.connect();
    pushLog("Connected to Postgres.");
}

export async function queryAllEntities(): Promise<IDeviceEntity[]> {
    const result = await client.query(`SELECT` +
        ` entity_id id,` +
        ` entity_name "deviceName",` +
        ` entity_ip ip,` +
        ` entity_mac mac,` +
        ` entity_host host,` +
        ` entity_keyon "isFixed",` +
        ` entity_rag spelling, ` +
        ` entity_color color, ` +
        ` entity_enabled "deviceEnabled",` +
        ` entity_port ports,` +
        ` entity_type "deviceType",` +
        ` entity_notif "notifKey"` +
        ` FROM apalog_entities`);
    return Promise.resolve(result.rows);
}

export async function queryAllFirebaseRegistrations(): Promise<IRealtimeNotificationData[]> {
    const result = await client.query(`SELECT regid_lastseen "lastSeen" regid "id" FROM apalog_android_regids`);
    return Promise.resolve(result.rows);
}

export async function checkEntityAvailability(entity: IDeviceEntity): Promise<boolean> {
    const result = await client.query(`SELECT entity_id id FROM apalog_log WHERE entity_turnoff IS NULL AND entity_id = $1`, [entity.id]);
    return Promise.resolve(result.rowCount !== 0);
}

export async function queryDevicesUp(): Promise<IDeviceEntity[]> {
    const devices = await queryAllEntities();
    return await devices.reduce(async (previousValue, currentValue) => {
        const isDeviceAvailable = await checkEntityAvailability(currentValue);
        const p = await previousValue;
        if (isDeviceAvailable) {
            p.push(currentValue);
        }
        return Promise.resolve(p);
    }, Promise.resolve([]));

}

export async function commitEntityState(entity: IDeviceEntity, previousDeviceStatus: boolean, deviceStatus: boolean): Promise<boolean> {
    if (previousDeviceStatus == deviceStatus) {
        return Promise.resolve(false)
    } else if (previousDeviceStatus && !deviceStatus) {
        await client.query(`UPDATE apalog_log SET entity_turnoff = now() WHERE entity_id = $1 AND entity_turnoff IS NULL`, [entity.id]);
        return Promise.resolve(true);
    } else /*(!previousDeviceStatus && deviceStatus) */{
        await client.query(`INSERT INTO apalog_log (entity_id, entity_turnon) VALUES ($1,now())`, [entity.id]);
        return Promise.resolve(true);
    }
}





