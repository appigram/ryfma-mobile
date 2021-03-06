import {
  OperationVariables,
  TypedDocumentNode,
  MutationHookOptions,
  MutationTuple,
  useMutation,
  MutationFunctionOptions,
  FetchResult,
  getApolloContext,
  ApolloError,
} from "@apollo/client";
import { useCallback, useContext, useMemo, useState } from "react";
import { DocumentNode } from "graphql";
import {
  changeDocumentType,
  getDocumentType,
} from "~extensions/graphql-utils";

export interface OfflineUpdateOptions<
  TQueryData = any,
  TQueryVariables = any,
  TMutationVariables = any,
  TAdditionalVariables = any
> {
  query: DocumentNode | TypedDocumentNode<TQueryData, TQueryVariables>;
  updateQuery: (
    data: TQueryData,
    variables: TQueryVariables
  ) => TQueryData | Promise<TQueryData>;
  transformVariables?: (
    variables?: TMutationVariables & TAdditionalVariables
  ) => TQueryVariables | Promise<TQueryVariables>;
  additionalVariables?: TAdditionalVariables;
}

export interface OfflineResponseOptions<
  TData = any,
  TVariables = OperationVariables
> {
  createResponse: (
    variables?: TVariables
  ) =>
    | Promise<FetchResult<TData, Record<string, any>, Record<string, any>>>
    | FetchResult<TData, Record<string, any>, Record<string, any>>;
  statusSubscribe?: (
    result?: FetchResult<TData, Record<string, any>, Record<string, any>>,
    error?: string
  ) => void | Promise<void>;
}

export type OfflineMutationHookOptions<
  TData = any,
  TVariables = OperationVariables
> = MutationHookOptions<TData, TVariables> & {
  offlineUpdate?: OfflineUpdateOptions<any, any, TVariables, any>[];
  offlineReturn?: OfflineResponseOptions<TData, TVariables>;
};

export function useOfflineMutation<
  TData = any,
  TVariables = OperationVariables
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: OfflineMutationHookOptions<TData, TVariables>
): MutationTuple<TData, TVariables> {
  const context = useContext(getApolloContext());
  const [fetchResult, mutationResult] = useMutation(mutation, options);
  const [offlineErrors, setOfflineErrors] = useState<string[] | undefined>();
  const offlineFetchResult = useCallback<
    (
      options1?: MutationFunctionOptions<TData, TVariables>
    ) => Promise<FetchResult<TData>>
  >(
    async (options1) => {
      const cache = context.client?.cache;
      const mutationVariables = options1?.variables;
      const errors: string[] = [];
      if (cache && options?.offlineUpdate?.length) {
        const offlineUpdate = options.offlineUpdate;
        await Promise.all(
          offlineUpdate.map(
            async ({
              query,
              transformVariables,
              additionalVariables,
              updateQuery,
            }) => {
              const isSubscription = getDocumentType(query) === "subscription";
              const source = isSubscription
                ? changeDocumentType(query, "query")!
                : query;
              const queryVariables = transformVariables
                ? await transformVariables({
                    ...mutationVariables,
                    ...additionalVariables,
                  })
                : additionalVariables;
              const fromCache = cache.readQuery<TData>(
                {
                  query: source,
                  variables: queryVariables,
                },
                true
              );
              let data;
              try {
                data = await updateQuery(
                  fromCache ?? ({} as TData),
                  mutationVariables
                );
              } catch (e) {
                errors.push(e);
                return;
              }
              cache.writeQuery({
                query: source,
                variables: queryVariables,
                data,
                broadcast: true,
              });
            }
          )
        );
      }
      if (options?.offlineReturn) {
        const offlineReturn = options?.offlineReturn;
        if (errors.length) {
          setOfflineErrors(errors);
        }
        const fetch = fetchResult(options1);
        if (offlineReturn?.statusSubscribe) {
          const subscriber = offlineReturn?.statusSubscribe;
          fetch
            .then((result) => subscriber(result))
            .catch((error) => subscriber(undefined, error));
        }
        return offlineReturn.createResponse(mutationVariables);
      }
      return fetchResult(options1);
    },
    [fetchResult, options, context]
  );
  const offlineMutationResult = useMemo(() => {
    if (options?.offlineReturn) {
      return {
        ...mutationResult,
        loading: false,
        error:
          mutationResult.error ?? offlineErrors
            ? new ApolloError({ errorMessage: offlineErrors?.join(" ") })
            : undefined,
      };
    }
    return mutationResult;
  }, [mutationResult, options, offlineErrors]);
  return [offlineFetchResult, offlineMutationResult];
}
