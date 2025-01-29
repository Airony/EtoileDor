import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import React from "react";
import { Gutter } from "payload/components/elements";

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
        <DefaultTemplate>
            You must be logged in to view this page
        </DefaultTemplate>;
    }

    return (
        <DefaultTemplate>
            <Gutter>
                <h1>Category Order</h1>
                <p>Drag and drop to reorder categories</p>
            </Gutter>
        </DefaultTemplate>
    );
};

export default categoryOrderView;
