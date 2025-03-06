import React from "react";
import { DefaultTemplate } from "payload/components/templates";
import { Gutter } from "payload/components/elements";
import { LoadingOverlayToggle } from "payload/dist/admin/components/elements/Loading";
import { ToastContainer } from "react-toastify";
import MenuSideBar from "./MenuSideBar";
import { ModalContainer, ModalProvider } from "@faceless-ui/modal";
import CategoriesList from "./CategoriesList";
import { useMenuQuery } from "../../views/fetches";

function CategoryOrder() {
    const { isLoading } = useMenuQuery();
    if (isLoading) {
        return (
            <DefaultTemplate>
                <LoadingOverlayToggle
                    name="category-order"
                    show={true}
                    type="withoutNav"
                />
            </DefaultTemplate>
        );
    }
    return (
        <div>
            <DefaultTemplate>
                <ModalProvider transTime={0}>
                    <ModalContainer />
                    <Gutter>
                        <h1>Menu</h1>

                        <div className="menu__container">
                            <MenuSideBar />
                            <CategoriesList />
                        </div>
                        <ToastContainer position="top-center" limit={3} />
                    </Gutter>
                </ModalProvider>
            </DefaultTemplate>
        </div>
    );
}

export default CategoryOrder;
