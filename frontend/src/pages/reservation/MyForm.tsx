import { Button, Form } from "react-aria-components";
import TextInput from "../../components/TextInput";
import SelectMenu from "../../components/SelectMenu";
import MyDatePicker from "../../components/MyDatePicker";
import { today } from "@internationalized/date";
import { TimeOptions, PartySizeOptions } from "shared";
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
    const minimumDate = today(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [submitState, dispatch] = useReducer(submitStateReducer, {
        loading: false,
        error: false,
        success: false,
    });

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

    function validateNumber(num: string) {
        if (num.length === 10 && !isNaN(Number(num))) {
            return null;
        }
        return "Invalid Number";
    }

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
            if (response.status !== 200) {
                throw new Error("Failed to submit form");
            }
            dispatch({ type: submitActionKind.SUCCESS });
        } catch (error) {
            dispatch({ type: submitActionKind.ERROR });
        }
    }
    return (
        <div className="relative isolate mx-auto max-w-96 p-4 sm:max-w-[800px]">
            {submitState.loading && (
                <>
                    <div
                        className={
                            "absolute inset-0 z-10 bg-primary-900 opacity-30"
                        }
                    />
                </>
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
                        validate={validateNumber}
                        isDisabled={submitState.loading}
                    />
                    <MyDatePicker
                        label="Date"
                        name={"date"}
                        minValue={minimumDate}
                        className={"sm:col-start-1 sm:row-start-3"}
                        isRequired
                        isDisabled={submitState.loading}
                    />
                    <SelectMenu
                        label="Time"
                        options={TimeOptions}
                        isRequired
                        className={"sm:col-start-2 sm:row-start-3"}
                        name="time"
                        isDisabled={submitState.loading}
                    />
                    <SelectMenu
                        label="Party Size"
                        options={PartySizeOptions}
                        className="sm:row-start-4"
                        isRequired
                        name="party-size"
                        isDisabled={submitState.loading}
                    ></SelectMenu>
                </div>
                <Button
                    type="submit"
                    className="btn-primary btn-primary-md sm:btn-primary-lg w-full"
                    isDisabled={submitState.loading}
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
                    className={`mt-4 text-sm text-red-500 sm:text-base xl:text-lg ${submitState.error && ""}`}
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

export default MyForm;
