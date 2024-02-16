import {
  useCreatePostTransport,
  useCreateGetTransport,
  useCreatePatchTransport,
  useCreateDeleteTransport,
} from "../createTransport";
import { IGateway } from "../gateway/gateway.types";

import type {
  IDevice,
  IGetDeviceResponse,
  IPostDeviceParams,
  IPostDeviceResponse,
  IPatchDeviceParams,
  IPatchDeviceResponse,
  IDeleteDeviceResponse,
} from "./device.types";

const apiParams = {
  name: "gateway",
  url: "http://188.127.251.190:3001/gateway",
};

const useGet = () => useCreateGetTransport<IGetDeviceResponse>(apiParams);

const usePatch = (
  gatewayID?: IGateway["ID"],
  deviceID?: IDevice["deviceID"]
) => {
  const resource = useCreatePatchTransport<
    IPatchDeviceParams,
    IPatchDeviceResponse
  >({
    ...apiParams,
    url: `${apiParams.url}/${gatewayID}/devices/${deviceID}`,
  });

  return resource;
};

const useDelete = (
  gatewayID?: IGateway["ID"],
  deviceID?: IDevice["deviceID"]
) => {
  const resource = useCreateDeleteTransport<IDeleteDeviceResponse>({
    ...apiParams,
    url: `${apiParams.url}/${gatewayID}/devices/${deviceID}`,
  });

  return resource;
};

const usePost = (gatewayID: IGateway["ID"]) => {
  const resource = useCreatePostTransport<
    IPostDeviceParams,
    IPostDeviceResponse
  >({
    ...apiParams,
    url: `${apiParams.url}/${gatewayID}/devices`,
  });

  return resource;
};

export const useDeviceTransport = () => {
  return {
    useGet,
    usePatch,
    useDelete,
    usePost,
  };
};
