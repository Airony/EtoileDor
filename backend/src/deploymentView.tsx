import React, { useReducer } from "react";
import { Button, Eyebrow, Gutter } from "payload/components/elements";

interface deployState {
    loading: boolean;
    error: string;
    success: boolean;
}

enum deployActionKind {
    LOADING = "LOADING",
    ERROR = "ERROR",
    SUCCESS = "SUCCESS",
}

interface deployAction {
    type: deployActionKind;
    payload: string;
}

function deployStateReducer(
    state: deployState,
    action: deployAction,
): deployState {
    const { type, payload } = action;
    switch (type) {
        case deployActionKind.LOADING:
            return { loading: true, success: false, error: "" };
        case deployActionKind.ERROR:
            return { loading: false, success: false, error: payload };
        case deployActionKind.SUCCESS:
            return { loading: false, success: true, error: "" };
        default:
            return state;
    }
}
const initialState: deployState = {
    loading: false,
    error: "",
    success: false,
};

export default function deploymentView() {
    const [state, dispatch] = useReducer(deployStateReducer, initialState);
    const handleButtonPress = async () => {
        if (state.loading) {
            return;
        }
        dispatch({ type: deployActionKind.LOADING, payload: "" });
        try {
            const response = await fetch("/api/deploy", {
                credentials: "include",
                method: "POST",
            });
            if (response.status != 200) {
                throw new Error(await response.text());
            }
            dispatch({
                type: deployActionKind.SUCCESS,
                payload: "",
            });
        } catch (error) {
            dispatch({
                type: deployActionKind.ERROR,
                payload: error.message,
            });
        }
    };

    return (
        <>
            <Eyebrow></Eyebrow>
            <Gutter>
                <h1>Deployments</h1>
                <h2>Status</h2>

                <Button onClick={handleButtonPress} disabled={state.loading}>
                    Deploy
                </Button>
                <p>{state.error && "Error"}</p>
                <p>{state.success && "Success"}</p>
                <p>{state.loading && "Loading"}</p>
                <p>{state.error}</p>
            </Gutter>
        </>
    );
}
