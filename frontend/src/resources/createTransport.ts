import { useContext } from "react";
import {
  useQuery,
  useQueryClient,
  useMutation,
  UseMutateFunction,
} from "react-query";

import ErrorContext from "@/store/errorContext";

interface IAPIParams {
  name: string;
  url: string;
}

export interface IQueryState {
  loading: boolean;
  error: boolean;
  errormessage?: string;
}

interface ICreatePost<T> {
  post: UseMutateFunction<unknown, unknown, T, unknown>;
}

interface ICreatePatch<T> {
  patch: UseMutateFunction<unknown, unknown, T, unknown>;
}

interface ICreateDelete {
  remove: UseMutateFunction<unknown, unknown, void, unknown>;
}

export const useCreateGetTransport = <R>({
  name,
  url,
}: IAPIParams): IQueryState & R => {
  const { isLoading, isFetching, data, isError } = useQuery(name, async () => {
    const res = await fetch(url);
    return res.json();
  });

  return {
    loading: isLoading || isFetching,
    error: isError,
    ...(data as R),
  };
};

export const useCreateGetArrayTransport = <R>({
  name,
  url,
}: IAPIParams): { data: R } & IQueryState => {
  const { isLoading, isFetching, data, isError } = useQuery(name, async () => {
    const res = await fetch(url);
    return res.json();
  });

  return {
    data: data as R,
    loading: isLoading || isFetching,
    error: isError,
  };
};

export const useCreatePatchTransport = <P, R>({
  name,
  url,
}: IAPIParams): IQueryState & R & ICreatePatch<P> => {
  const queryClient = useQueryClient();
  const { setErrorMessage } = useContext(ErrorContext);

  const patchProvider = async (body: P) => {
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body !== undefined && { body: body ? JSON.stringify(body) : "" }),
    });

    if (res.status !== 200) {
      setErrorMessage((await res.json()).error);
    }

    return res.json();
  };

  const { data, mutate, isLoading, isError } = useMutation(patchProvider, {
    onSettled: () => {
      queryClient.invalidateQueries(name);
    },
  });

  return {
    loading: isLoading,
    error: isError,
    patch: mutate,
    ...(data as R),
  };
};

export const useCreatePostTransport = <P, R>({
  name,
  url,
}: IAPIParams): IQueryState & R & ICreatePost<P> => {
  const queryClient = useQueryClient();
  const { setErrorMessage } = useContext(ErrorContext);

  const postProvider = async (body: P) => {
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      ...(body !== undefined && { body: body ? JSON.stringify(body) : "" }),
    });

    if (res.status !== 200) {
      setErrorMessage((await res.json()).error);
    }

    return res.json();
  };

  const { data, mutate, isLoading, isError } = useMutation(postProvider, {
    onSettled: () => {
      queryClient.invalidateQueries(name);
    },
  });

  return {
    loading: isLoading,
    error: isError,
    post: mutate,
    ...(data as R),
  };
};

export const useCreateDeleteTransport = <R>({
  name,
  url,
}: IAPIParams): IQueryState & R & ICreateDelete => {
  const queryClient = useQueryClient();

  const deleteProvider = async () => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.json();
  };

  const { data, mutate, isLoading, isError } = useMutation(deleteProvider, {
    onSettled: () => {
      queryClient.invalidateQueries(name);
    },
  });

  return {
    loading: isLoading,
    error: isError,
    remove: mutate,
    ...(data as R),
  };
};
