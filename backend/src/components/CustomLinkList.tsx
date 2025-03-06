import React from "react";
import { NavGroup } from "payload/components/elements";
import CustomLink from "./CustomLink";
function CustomLinkList() {
    return (
        <NavGroup label="Additional">
            <CustomLink to="/admin/menu-edit" label="Edit Menu" />
        </NavGroup>
    );
}

export default CustomLinkList;
