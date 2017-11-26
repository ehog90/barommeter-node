export interface IDeviceEntity {
    id: string,
    deviceName: string,
    ip: string,
    mac: string,
    host: string,
    isFixed: boolean,
    spelling: string,
    color: string,
    deviceEnabled: boolean,
    ports: number[]
    deviceType: DeviceType,
    notifKey: number
}

export interface IRealtimeNotificationData {
    id: string;
    lastSeen: Date;
}

export enum DeviceType {
    LocalDev = 'LOCAL_DEV',
    ExternalPlace = 'EXT_DEV'
}

export interface IDeviceEntityWithStatus {
    entity: IDeviceEntity;
    openPorts: number[];
    isUp: boolean;
}