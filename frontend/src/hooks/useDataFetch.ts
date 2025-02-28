import { useState, useEffect } from "react";
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

    useEffect(() => {
        const fetchData = async (fetchUrl: string) => {
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
        };

        if (url) {
            onStart?.();
            fetchData(url);
        }
    }, [url]);

    return { isError, isLoading, data };
}

export default useDataFetch;
