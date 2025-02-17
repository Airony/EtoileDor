import React from "react";
import { useRef } from "react";
import { AdminViewComponent } from "payload/config";
import { DefaultTemplate } from "payload/components/templates";
import { Redirect } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CategoryOrder from "../components/CategoryOrder";

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

    const queryClientRef = useRef<QueryClient>(new QueryClient());

    return (
        <QueryClientProvider client={queryClientRef.current}>
            <CategoryOrder />
        </QueryClientProvider>
    );
};

export default categoryOrderView;
