import React from "react";
function MenuItem({ name, price }: { name: string; price: number }) {
    return (
        <div>
            <p>{name}</p>
            <p>{price}</p>
        </div>
    );
}

export default MenuItem;
