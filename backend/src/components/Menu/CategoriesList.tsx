import React from "react";
import Category from "./Category";
import { useMenuQuery } from "../../views/fetches";
function CategoriesList() {
    const { data } = useMenuQuery();

    return (
        <div className="categories-list">
            {data.categories.orderedIds.map((id) => {
                return <Category id={id} key={id} />;
            })}
        </div>
    );
}

export default CategoriesList;
