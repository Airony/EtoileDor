import React from "react";
import { Button } from "payload/components/elements";
import {
    categoryActionKind,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import CategoriesNavList from "./CategoriesNavList";
function MenuSideBar() {
    const dispatch = useCategoriesDispatch();

    return (
        <div className="menu-sidebar">
            <Button
                icon="plus"
                size="medium"
                aria-label="Add Category"
                buttonStyle="secondary"
                onClick={() => {
                    dispatch({
                        type: categoryActionKind.ADD_CATEGORY,
                    });
                }}
            >
                Add Category
            </Button>

            <CategoriesNavList />
        </div>
    );
}

export default MenuSideBar;
