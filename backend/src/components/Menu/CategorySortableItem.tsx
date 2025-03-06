import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "../DragHandle";
import { SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { Button } from "payload/components/elements";
import { Chevron } from "payload/components/icons";
import SubCategoriesNavList from "./SubCategoriesNavList";
import { useModal } from "@faceless-ui/modal";
import { toast } from "react-toastify";
import CategoryInput from "./CategoryInput";
import CategoryOptionsModal from "./CategoryOptionsModal";
import MoreIcon from "payload/dist/admin/components/icons/More";
import {
    CategoriesQueryData,
    SubCategoriesQueryData,
    useMenuQuery,
} from "../../views/fetches";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import mapSet from "../../utils/mapSet";

interface CategorySortableItemProps {
    id: string;
    sensors: SensorDescriptor<SensorOptions>[];
}

function CategorySortableItem({ id, sensors }: CategorySortableItemProps) {
    const { data } = useMenuQuery();
    const { categories } = data;
    const { name, subCategories: SubCategories } =
        categories.categoriesMap.get(id);

    const subCatInputRef = useRef<HTMLInputElement>(null);
    const [isInputting, setIsInputting] = useState(false);

    const [collapsed, setCollapsed] = useState<boolean>(true);

    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const queryClient = useQueryClient();

    const handleAddSubCategory = useCallback(
        async (name: string) => {
            const response = await fetch("/api/sub_categories", {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    categoryId: id,
                }),
            });

            if (response.status !== 201) {
                console.error(await response.text());
                throw new Error();
            }
            return response.json();
        },
        [id],
    );

    const addMutation = useMutation({
        mutationFn: handleAddSubCategory,
        onError: (err) => {
            console.error(err);
            toast.error("Failed to create sub category");
        },
        onSuccess: (data: { id: string; index: number; name: string }) => {
            queryClient.setQueryData(
                ["subCategories"],
                (oldData: SubCategoriesQueryData): SubCategoriesQueryData => {
                    const newMap = mapSet(oldData, data.id, () => ({
                        id: data.id,
                        index: data.index,
                        name: data.name,
                        menuItems: [],
                    }));

                    return newMap;
                },
            );

            queryClient.setQueryData(
                ["categories"],
                (oldData: CategoriesQueryData): CategoriesQueryData => {
                    const newMap = mapSet(
                        oldData.categoriesMap,
                        id,
                        (category) => ({
                            ...category,
                            subCategories: [...category.subCategories, data.id],
                        }),
                    );

                    return {
                        ...oldData,
                        categoriesMap: newMap,
                    };
                },
            );

            toast.success("Sub-category created successfully");
        },
        onSettled: () => {
            setIsInputting(false);
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalSlug = id + "-modal";
    const { openModal } = useModal();

    useEffect(() => {
        if (isInputting) {
            subCatInputRef.current?.focus();
        }
        return () => {};
    }, [isInputting]);

    function handleAddBtnPress() {
        setCollapsed(false);
        if (addMutation.isPending) {
            return;
        }

        if (isInputting) {
            subCatInputRef.current?.focus();
            return;
        }
        setIsInputting(true);
    }

    function handleCancel() {
        if (addMutation.isPending) {
            return;
        }
        setIsInputting(false);
    }

    return (
        <div ref={setNodeRef} style={style} className="">
            <div
                className={`category-ordered-item ${!collapsed ? "open" : ""}`}
            >
                <DragHandle listeners={listeners} attributes={attributes} />
                <p>{name}</p>
                <div className="category-ordered-item__control-group">
                    <Button
                        buttonStyle="icon-label"
                        icon="plus"
                        size="small"
                        onClick={handleAddBtnPress}
                        disabled={addMutation.isPending}
                    />
                    {SubCategories.length > 0 && (
                        <Button
                            icon={
                                <Chevron
                                    direction={collapsed ? "down" : "up"}
                                    size="large"
                                />
                            }
                            buttonStyle="icon-label"
                            size="small"
                            onClick={() => {
                                setCollapsed(!collapsed);
                            }}
                            className="category-ordered-item__collapse-btn"
                        ></Button>
                    )}
                    <Button
                        icon={<MoreIcon />}
                        buttonStyle="icon-label"
                        size="small"
                        aria-label="Delete category"
                        onClick={() => {
                            openModal(modalSlug);
                        }}
                    />
                </div>
            </div>
            <CategoryOptionsModal id={id} slug={modalSlug} />
            {!collapsed && (
                <div className="category-ordered-item__sub-categories-list">
                    <SubCategoriesNavList parentId={id} sensors={sensors} />
                    {isInputting && (
                        <CategoryInput
                            inputRef={subCatInputRef}
                            loading={addMutation.isPending}
                            onSave={(name: string) => addMutation.mutate(name)}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default CategorySortableItem;
