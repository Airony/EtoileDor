import { QueryClient } from "@tanstack/react-query";

export default function checkForFutureMutation(
    queryClient: QueryClient,
    mutationKey: string[],
    id: string,
): boolean {
    return (
        queryClient.isMutating({
            mutationKey: mutationKey,
            status: "pending",
            predicate(mutation) {
                return (mutation.state.context as { id: string })?.id !== id;
            },
        }) > 0
    );
}
