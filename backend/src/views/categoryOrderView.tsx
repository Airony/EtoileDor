import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Gutter } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";

import { Category } from "../payload-types";

type MyCategory = {
    name: string;
    id: string;
};

type State = {
    loading: boolean;
    error: boolean;
    categories: MyCategory[];
};

const initialState: State = {
    loading: true,
    error: false,
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

    const [state, setState] = useState<State>(initialState);

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await fetch("/api/categories?limit=0", {
                credentials: "include",
            });
            if (response.status !== 200) {
                throw new Error("Failed to fetch categories");
            }
            const json = await response.json();
            const categories = json.docs as Category[];
            setState({
                loading: false,
                error: false,
                categories: categories
                    .sort((a, b) => a.index - b.index)
                    .map((category) => ({
                        name: category.name,
                        id: category.id,
                    })),
            });
        };
        try {
            fetchCategories();
        } catch (error) {
            console.error(error);
            setState({
                loading: false,
                error: true,
                categories: [],
            });
        }

        return () => {};
    }, []);

    return (
        <>
            <LoadingOverlayToggle
                name="what"
                show={state.loading}
                type="withoutNav"
            />
            <DefaultTemplate>
                <Gutter>
                    <h1>Category Order</h1>
                    <p>Drag and drop to reorder categories</p>

                    <ul>
                        {state.error && <li>Error fetching Categories</li>}
                        {state.categories.map((category) => (
                            <li key={category.id}>{category.name}</li>
                        ))}
                    </ul>
                </Gutter>
            </DefaultTemplate>
        </>
    );
};

export default categoryOrderView;
