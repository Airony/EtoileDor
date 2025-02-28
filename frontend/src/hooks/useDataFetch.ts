import { useState, useEffect, useCallback } from "react";
interface useDataFetchOptions {
    onStart?: () => void;
}
function useDataFetch<T>(
    url: string | null,
    { onStart }: useDataFetchOptions = {},
) {
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<T | null>(null);

    const fetchData = useCallback(
        async (fetchUrl: string) => {
            onStart?.();
            setIsError(false);
            setIsLoading(true);

            try {
                const response: Response = await fetch(fetchUrl, {
                    method: "GET",
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const result = await response.json();
                setData(result);
                setIsError(false);
            } catch (error) {
                console.error(error);
                setIsError(true);
                setData(null);
            }
            setIsLoading(false);
        },
        [onStart, url],
    );

    useEffect(() => {
        if (url) {
            fetchData(url);
        }
    }, [url, fetchData]);

    const refetch = useCallback(() => {
        if (url) {
            fetchData(url);
        }
    }, [url, fetchData]);

    const setFetchData = useCallback((newData: T | null) => {
        setData(newData);
    }, []);

    return { isError, isLoading, data, refetch, setFetchData };
}

export default useDataFetch;
