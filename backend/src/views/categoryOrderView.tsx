import React, { useReducer } from "react";
import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import { useEffect } from "react";
import { Gutter, Button } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { Category, MenuItem, SubCategory } from "../payload-types";
import { ToastContainer } from "react-toastify";
import {
    CategoriesContext,
    CategoriesDispatchContext,
    CategoriesReducer,
    categoryActionKind,
    CategoriesState,
} from "../contexts/CategoriesContext";
import MenuSideBar from "../components/MenuSideBar";
import { ModalContainer, ModalProvider } from "@faceless-ui/modal";
import CategoriesList from "../components/CategoriesList";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const initialState: CategoriesState = {
    loading: true,
    error: "",
    categories: new Map(),
    subCategories: new Map(),
    menuItems: new Map(),
    data: [],
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
    const queryClient = new QueryClient();

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesResponse = await fetch("/api/categories?limit=0", {
                credentials: "include",
            });
            if (categoriesResponse.status !== 200) {
                throw new Error("Failed to fetch categories");
            }

            const subCategoriesResponse = await fetch(
                "/api/sub_categories?limit=0&depth=1",
                {
                    credentials: "include",
                },
            );
            if (subCategoriesResponse.status !== 200) {
                throw new Error("Failed to fetch sub categories");
            }

            const menuItemsResponse = await fetch(
                "/api/menu_items?limit=0&depth=0",
                {
                    credentials: "include",
                },
            );
            if (menuItemsResponse.status !== 200) {
                throw new Error("Failed to fetch menu items");
            }
            const json = await categoriesResponse.json();
            const menuItemsJson = await menuItemsResponse.json();
            const subCategoriesJson = await subCategoriesResponse.json();

            const categories = json.docs as Category[];
            const subCategories = subCategoriesJson.docs as SubCategory[];
            const menuItems = menuItemsJson.docs as MenuItem[];

            dispatch({
                type: categoryActionKind.FETCHED,
                categories,
                subCategories,
                menuItems,
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
        return;
        // dispatch({ type: categoryActionKind.LOADING });

        // Just update everything
        // Extract categories alone
        // const extractedCategories = state.categories.map((cat, index) => {
        //     return {
        //         id: cat.id,
        //         index: index,
        //     };
        // });

        // const extractedSubCategories = state.categories.flatMap((cat) => {
        //     return cat.SubCategoriesIds.map((subCat, index) => {
        //         return {
        //             id: subCat.id,
        //             parentId: cat.id,
        //             index,
        //         };
        //     });
        // });
        // console.log(extractedCategories);
        // console.log(extractedSubCategories);
        // For now, just update everything

        // Do a bulk update

        // Custom endpoint
        // const response = await fetch("/api/categories/update_all", {
        //     credentials: "include",
        //     method: "PATCH",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         categories: extractedCategories,
        //         subCategories: extractedSubCategories,
        //     }),
        // });

        // if (response.status !== 200) {
        //     dispatch({
        //         type: categoryActionKind.ERROR,
        //         error: "",
        //     });
        //     toast.error("Failed to update order.", {
        //         position: "bottom-center",
        //     });
        // } else {
        //     dispatch({ type: categoryActionKind.SAVED });
        //     toast.success("Order updated successfully.", {
        //         position: "bottom-center",
        //     });
        // }
    }

    return (
        <QueryClientProvider client={queryClient}>
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
                                <h1>Menu</h1>

                                {state.error && <p>{state.error}</p>}
                                <div className="menu__container">
                                    <MenuSideBar />
                                    <CategoriesList />
                                </div>
                                <Button
                                    onClick={onSave}
                                    disabled={state.loading}
                                >
                                    Save
                                </Button>
                                <ToastContainer />
                            </Gutter>
                        </ModalProvider>
                    </DefaultTemplate>
                </CategoriesDispatchContext.Provider>
            </CategoriesContext.Provider>
        </QueryClientProvider>
    );
};

export default categoryOrderView;
