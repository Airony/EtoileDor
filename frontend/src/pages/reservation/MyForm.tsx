import { Button, Form, type DateValue } from "react-aria-components";
import TextInput from "../../components/TextInput";
import SelectMenu, { type Option } from "../../components/SelectMenu";
import MyDatePicker from "../../components/MyDatePicker";
import React, {
    useCallback,
    useLayoutEffect,
    useReducer,
    useRef,
    useState,
} from "react";
import { MoonLoader } from "react-spinners";
import tailwindConfig from "../../../tailwind.config";
import resolveConfig from "tailwindcss/resolveConfig";
import useDataFetch from "../../hooks/useDataFetch";
import { parseDate } from "@internationalized/date";

interface submitState {
    loading: boolean;
    error: boolean;
    success: boolean;
}

enum submitActionKind {
    LOADING = "LOADING",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
}
interface submitAction {
    type: submitActionKind;
}

function submitStateReducer(state: submitState, action: submitAction) {
    const { type } = action;
    switch (type) {
        case submitActionKind.LOADING:
            return { loading: true, success: false, error: false };
        case submitActionKind.ERROR:
            return { loading: false, success: false, error: true };
        case submitActionKind.SUCCESS:
            return { loading: false, success: true, error: false };
        default:
            return state;
    }
}

function MyForm() {
    const [submitState, dispatch] = useReducer(submitStateReducer, {
        loading: false,
        error: false,
        success: false,
    });
    const [selectedDay, setSelectedDay] = useState<DateValue | null>(null);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const [partySize, setPartySize] = useState<number | null>(null);

    const allowedOptionsFetch = useDataFetch<{
        minDay: string;
        maxDay: string;
        maxPartySize: number;
    }>(`${import.meta.env.PUBLIC_API_URL}/allowedReservationOptions`);

    const reservationTimesFetchUrl =
        partySize && selectedDay
            ? `${import.meta.env.PUBLIC_API_URL}/reservationTimes?day=${selectedDay.toString().split("T")[0]}&party-size=${partySize}`
            : null;
    const reservationTimesFetch = useDataFetch<number[]>(
        reservationTimesFetchUrl,
        {
            onStart: useCallback(() => {
                setSelectedTime(null);
            }, []),
        },
    );

    const [spinnerSize, setSpinnerSize] = useState(21);
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        updateSpinnerSize();
    }, [submitBtnRef]);
    window.addEventListener("resize", () => updateSpinnerSize());

    const updateSpinnerSize = useCallback(() => {
        const submitBtn = submitBtnRef.current;
        if (submitBtn == null) {
            return;
        }
        const { height } = submitBtn.getBoundingClientRect();
        let newSize = 19;
        if (height > 48) {
            newSize = 25;
        }
        setSpinnerSize(newSize);
    }, [submitBtnRef]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        dispatch({ type: submitActionKind.LOADING });

        try {
            const response: Response = await fetch(
                `${import.meta.env.PUBLIC_API_URL}/reservation`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );
            if (!response.ok) {
                throw new Error("Failed to submit form");
            }
            dispatch({ type: submitActionKind.SUCCESS });
            setPartySize(null);
            setSelectedDay(null);
            reservationTimesFetch.setFetchData(null);
        } catch (error) {
            dispatch({ type: submitActionKind.ERROR });
            reservationTimesFetch.refetch();
        }
        setSelectedTime(null);
    }

    const isLoading =
        allowedOptionsFetch.isLoading ||
        submitState.loading ||
        reservationTimesFetch.isLoading;

    if (allowedOptionsFetch.isError) {
        return (
            <p
                className={`mt-4 w-full text-center text-sm text-red-500 sm:text-base xl:text-lg`}
            >
                Failed to load the form, please refresh the page. Call us if the
                issue persists.
            </p>
        );
    }

    return (
        <div className="relative isolate mx-auto max-w-96 p-4 sm:max-w-[800px]">
            {isLoading && (
                <div
                    className={
                        "absolute inset-0 z-10 flex items-center justify-center bg-primary-900/50"
                    }
                >
                    <p className="font-main text-base text-primary-100">
                        Loading
                    </p>
                </div>
            )}

            <Form
                className="flex flex-col gap-14 sm:gap-[5vh]"
                method="post"
                onSubmit={handleSubmit}
            >
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <TextInput
                        name="f-name"
                        label="First Name"
                        autoComplete="given-name"
                        isRequired
                        isDisabled={submitState.loading}
                    />
                    <TextInput
                        name="l-name"
                        label="Last Name"
                        autoComplete="family-name"
                        isRequired
                        isDisabled={submitState.loading}
                    />
                    <TextInput
                        name="phone-number"
                        label="Phone Number"
                        type="tel"
                        autoComplete="tel-national"
                        isRequired
                        validate={validatePhoneNumber}
                        isDisabled={submitState.loading}
                    />
                    <SelectMenu
                        label="Party Size"
                        isRequired
                        name="party-size"
                        isDisabled={isLoading}
                        selectedKey={partySize}
                        onSelectionChange={(size) =>
                            setPartySize(size as number)
                        }
                        options={Array.from({
                            length: allowedOptionsFetch.data?.maxPartySize || 0,
                        }).map((_, i) => {
                            return {
                                value: i + 1,
                                label: `${i + 1}`,
                            };
                        })}
                    />
                    <MyDatePicker
                        label="Date"
                        name="day"
                        minValue={
                            allowedOptionsFetch.data
                                ? parseDate(allowedOptionsFetch.data.minDay)
                                : undefined
                        }
                        maxValue={
                            allowedOptionsFetch.data
                                ? parseDate(allowedOptionsFetch.data.maxDay)
                                : undefined
                        }
                        isRequired
                        isDisabled={isLoading}
                        value={selectedDay}
                        onChange={(date) => setSelectedDay(date)}
                    />
                    <div>
                        <SelectMenu
                            label="Time"
                            options={
                                reservationTimesFetch.data?.map(
                                    (time): Option => {
                                        return {
                                            value: time,
                                            label: stringifyTime(time),
                                        };
                                    },
                                ) || []
                            }
                            isRequired
                            name="time"
                            selectedKey={selectedTime}
                            onSelectionChange={(time) =>
                                setSelectedTime(time as number)
                            }
                            isDisabled={
                                isLoading ||
                                reservationTimesFetch.data === null ||
                                reservationTimesFetch.data.length === 0
                            }
                        />
                        <p className="mt-4 text-sm text-red-500 sm:text-base xl:text-lg">
                            {!reservationTimesFetch.isLoading &&
                                reservationTimesFetch.data?.length === 0 &&
                                "No available times for the selected day."}
                            {reservationTimesFetch.isError &&
                                "Failed to load available times for the selected day. Please try again."}
                        </p>
                    </div>
                </div>
                <Button
                    type="submit"
                    className="btn-primary btn-primary-md sm:btn-primary-lg w-full"
                    isDisabled={isLoading}
                    ref={submitBtnRef}
                >
                    <span className="relative">
                        Reserve
                        <div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 md:pl-6`}
                        >
                            <MoonLoader
                                aria-label="loading"
                                loading={submitState.loading}
                                className="moon-loader"
                                size={spinnerSize}
                                color={
                                    resolveConfig(tailwindConfig).theme.colors
                                        .primary[900]
                                }
                            />
                        </div>
                    </span>
                </Button>
            </Form>
            {submitState.error && (
                <p
                    className={`mt-4 text-sm text-red-500 sm:text-base xl:text-lg`}
                >
                    An error occured while submitting, please try again. Or call
                    us if the issue persists.
                </p>
            )}
            {submitState.success && (
                <p className="mt-4 text-sm text-secondary-200 sm:text-base xl:text-lg">
                    Reserved successfuly!
                </p>
            )}
        </div>
    );
}

function stringifyTime(time: number) {
    const hours = Math.floor(time / 60);
    const mins = time % 60;
    return `${hours}:${mins < 10 ? "0" : ""}${mins}`;
}

function validatePhoneNumber(num: string) {
    if (num.length === 10 && !isNaN(Number(num))) {
        return null;
    }
    return "Invalid Number";
}

export default MyForm;
