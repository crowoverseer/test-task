import { IDevice } from "../device/device.types";

export interface IGateway {
  ID: number | "new";
  serial?: string;
  name?: string;
  ipv4?: string;
  devices?: IDevice[];
}

export type IGetGatewayResponse = IGateway[];

export interface IPostGatewayParams extends Omit<IGateway, "ID"> {}

export interface IPostGatewayResponse extends Partial<IGateway> {}

export interface IPatchGatewayParams extends Partial<IGateway> {}

export interface IPatchGatewayResponse {}

export interface IDeleteGatewayResponse {}
