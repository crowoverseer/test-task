export interface IDevice {
  deviceID: number | "new";
  UID?: number;
  vendor?: string;
  dateCreated?: string;
  status?: "offline" | "online";
}

export type IGetDeviceResponse = IDevice;

export interface IPostDeviceParams extends Omit<IDevice, "deviceId"> {}

export interface IPostDeviceResponse {}

export interface IPatchDeviceParams extends Partial<IDevice> {}

export interface IPatchDeviceResponse {}

export interface IDeleteDeviceResponse {}
