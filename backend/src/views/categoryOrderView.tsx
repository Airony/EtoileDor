import React, { useReducer } from "react";
import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import { useEffect } from "react";
import { Gutter, Button } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { Category, SubCategory } from "../payload-types";
import { toast, ToastContainer } from "react-toastify";
import {
    CategoriesContext,
    CategoriesDispatchContext,
    CategoriesReducer,
    categoryActionKind,
    CategoriesState,
} from "../contexts/CategoriesContext";
import CategoriesList from "../components/CategoriesList";
import { ModalContainer, ModalProvider } from "@faceless-ui/modal";

const initialState: CategoriesState = {
    loading: true,
    error: "",
    categories: [],
};

const categoryOrderView: AdminViewComponent = ({ user }) => {
    if (user) {
        if (user.role !== "admin") {
            return (
                <DefaultTemplate>
                    Only admins can view this page
                </DefaultTemplate>
            );
        }
    } else {
        return <Redirect to="/admin/login" />;
    }

    const [state, dispatch] = useReducer(CategoriesReducer, initialState);

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesResponse = await fetch("/api/categories?limit=0", {
                credentials: "include",
            });
            if (categoriesResponse.status !== 200) {
                throw new Error("Failed to fetch categories");
            }
            const json = await categoriesResponse.json();

            const subCategoriesResponse = await fetch(
                "/api/sub_categories?limit=0&depth=1",
                {
                    credentials: "include",
                },
            );
            if (subCategoriesResponse.status !== 200) {
                throw new Error("Failed to fetch sub categories");
            }
            const subCategoriesJson = await subCategoriesResponse.json();

            const categories = json.docs as Category[];
            const subCategories = subCategoriesJson.docs as SubCategory[];

            dispatch({
                type: categoryActionKind.FETCHED,
                categories,
                subCategories,
            });
        };

        try {
            fetchCategories();
        } catch (error) {
            dispatch({
                type: categoryActionKind.ERROR,
                error: "Failed to fetch categories. Please refresh the page",
            });
        }

        return () => {};
    }, []);

    async function onSave() {
        dispatch({ type: categoryActionKind.LOADING });

        // Custom endpoint
        const response = await fetch("/api/categories/reorder", {
            credentials: "include",
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                state.categories.map((cat, index) => {
                    return { id: cat.id, index };
                }),
            ),
        });

        if (response.status !== 200) {
            dispatch({
                type: categoryActionKind.ERROR,
                error: "",
            });
            toast.error("Failed to update order.", {
                position: "bottom-center",
            });
        } else {
            dispatch({ type: categoryActionKind.SAVED });
            toast.success("Order updated successfully.", {
                position: "bottom-center",
            });
        }
    }

    return (
        <CategoriesContext.Provider value={state}>
            <CategoriesDispatchContext.Provider value={dispatch}>
                <LoadingOverlayToggle
                    name="category-order"
                    show={state.loading}
                    type="withoutNav"
                />
                <DefaultTemplate>
                    <ModalProvider transTime={0}>
                        <ModalContainer />
                        <Gutter>
                            <h1>Category Order</h1>
                            <p>Drag and drop to reorder categories</p>

                            <CategoriesList />
                            {state.error && <p>{state.error}</p>}
                            <Button onClick={onSave} disabled={state.loading}>
                                Save
                            </Button>
                            <ToastContainer />
                        </Gutter>
                    </ModalProvider>
                </DefaultTemplate>
            </CategoriesDispatchContext.Provider>
        </CategoriesContext.Provider>
    );
};

export default categoryOrderView;
