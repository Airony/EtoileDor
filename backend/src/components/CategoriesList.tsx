import React from "react";
import { useCategories } from "../contexts/CategoriesContext";
import Category from "./Category";
function CategoriesList() {
    const { data } = useCategories();

    return (
        <div className="categories-list">
            {data.map((id) => {
                return <Category id={id} key={id} />;
            })}
        </div>
    );
}

export default CategoriesList;
