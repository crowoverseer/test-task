import {
  useCreateGetArrayTransport,
  useCreatePatchTransport,
  useCreateDeleteTransport,
  useCreatePostTransport,
} from "../createTransport";

import type {
  IGateway,
  IGetGatewayResponse,
  IPostGatewayParams,
  IPostGatewayResponse,
  IPatchGatewayParams,
  IPatchGatewayResponse,
  IDeleteGatewayResponse,
} from "./gateway.types";

const apiParams = {
  name: "gateway",
  url: "http://localhost:3001/gateway",
};

const useGet = () => {
  const { data: gateways, loading } =
    useCreateGetArrayTransport<IGetGatewayResponse>(apiParams);
  return { gateways, loading };
};

const usePatch = (gateway: IGateway) => {
  const resource = useCreatePatchTransport<
    IPatchGatewayParams,
    IPatchGatewayResponse
  >({
    ...apiParams,
    url: apiParams.url.concat(`/${gateway?.ID || ""}`),
  });

  return resource;
};

const useDelete = (gatewayID?: IGateway["ID"]) => {
  const resource = useCreateDeleteTransport<IDeleteGatewayResponse>({
    ...apiParams,
    url: `${apiParams.url}/${gatewayID}`,
  });

  return resource;
};

const usePost = () => {
  const resource = useCreatePostTransport<
    IPostGatewayParams,
    IPostGatewayResponse
  >({
    ...apiParams,
    url: apiParams.url,
  });

  return resource;
};

export const useGatewayTransport = () => {
  return {
    useGet,
    usePatch,
    useDelete,
    usePost,
  };
};
