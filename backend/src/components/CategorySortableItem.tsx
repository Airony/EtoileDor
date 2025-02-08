import {
    categoryActionKind,
    useCategories,
    useCategoriesDispatch,
} from "../contexts/CategoriesContext";
import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandle from "./DragHandle";
import { SensorDescriptor, SensorOptions } from "@dnd-kit/core";
import { Button } from "payload/components/elements";
import { Chevron } from "payload/components/icons";
import SubCategoriesNavList from "./SubCategoriesNavList";
import EditableText from "./EditableText";
import { useModal } from "@faceless-ui/modal";
import DeleteModal from "./DeleteModal";
import { toast } from "react-toastify";
import CategoryInput from "./CategoryInput";

interface CategorySortableItemProps {
    id: string;
    sensors: SensorDescriptor<SensorOptions>[];
}

interface State {
    loading: boolean;
    inputting: boolean;
}

function CategorySortableItem({ id, sensors }: CategorySortableItemProps) {
    const { categories } = useCategories();
    const { name, SubCategoriesIds: SubCategories } = categories.get(id);
    const dispatch = useCategoriesDispatch();

    const subCatInputRef = useRef<HTMLInputElement>(null);
    const [subCatInputState, setSubCatInputState] = useState<State>({
        inputting: false,
        loading: false,
    });

    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>(name);

    const shouldEdit = isEditing || !name;
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const modalId = id + "-modal";
    const { openModal } = useModal();

    function handleSaveName() {
        if (!newName) {
            return;
        }
        setIsEditing(false);
        dispatch({
            type: categoryActionKind.RENAME_CATEGORY,
            id: id,
            newName: newName,
        });
    }

    function handleCancelEdit() {
        setIsEditing(false);
        setNewName(name);
    }

    useEffect(() => {
        if (subCatInputState.inputting) {
            subCatInputRef.current?.focus();
        }
        return () => {};
    }, [subCatInputState.inputting]);

    function handleAddBtnPress() {
        setCollapsed(false);
        if (subCatInputState.loading) {
            return;
        }

        if (subCatInputState.inputting) {
            subCatInputRef.current?.focus();
            return;
        }
        setSubCatInputState({ loading: false, inputting: true });
    }

    function handleCancel() {
        setSubCatInputState({ loading: false, inputting: false });
    }

    async function handleSaveCategory(name: string) {
        setSubCatInputState({ loading: true, inputting: true });
        try {
            const index = SubCategories.length;
            const response = await fetch("/api/sub_categories", {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    index: index,
                    category: {
                        relationTo: "categories",
                        value: id,
                    },
                }),
            });

            if (response.status !== 201) {
                console.error(await response.text());
                throw new Error();
            }
            const responseData = await response.json();
            if (!responseData.doc?.id) {
                throw new Error();
            }

            dispatch({
                type: categoryActionKind.ADD_SUB_CATEGORY,
                parentId: id,
                id: responseData.doc.id,
                name: name,
                index: index,
            });
            setCollapsed(false);
            toast.success("Sub Category created successfully", {
                position: "bottom-center",
            });
            setSubCatInputState({ loading: false, inputting: false });
        } catch (error) {
            toast.error("Failed to create sub category", {
                position: "bottom-center",
            });
            setSubCatInputState({ loading: false, inputting: false });
        }
    }

    return (
        <div ref={setNodeRef} style={style} className="">
            <div
                className={`category-ordered-item ${!collapsed ? "open" : ""}`}
            >
                <DragHandle listeners={listeners} attributes={attributes} />
                <EditableText
                    path="category_name"
                    name="category_name"
                    editedValue={newName}
                    handleCancelEdit={handleCancelEdit}
                    handleSaveEdit={handleSaveName}
                    isEditing={shouldEdit}
                    value={name}
                    onChange={(val) => setNewName(val)}
                    handleStartEdit={() => setIsEditing(true)}
                />
                <div className="category-ordered-item__control-group">
                    <Button
                        buttonStyle="icon-label"
                        icon="plus"
                        size="small"
                        onClick={handleAddBtnPress}
                        disabled={subCatInputState.loading}
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
                        icon="x"
                        buttonStyle="icon-label"
                        size="small"
                        aria-label="Delete category"
                        onClick={() => {
                            openModal(modalId);
                        }}
                    />
                </div>
            </div>
            {!collapsed && (
                <div className="category-ordered-item__sub-categories-list">
                    <SubCategoriesNavList parentId={id} sensors={sensors} />
                    {subCatInputState.inputting && (
                        <CategoryInput
                            inputRef={subCatInputRef}
                            loading={subCatInputState.loading}
                            onSave={handleSaveCategory}
                            onCancel={handleCancel}
                        />
                    )}
                </div>
            )}

            <DeleteModal
                slug={modalId}
                deletedName={"category " + name}
                warning="All related sub categories and menu items will be deleted."
                onDeletion={() => {
                    dispatch({
                        type: categoryActionKind.DELETE_CATEGORY,
                        id: id,
                    });
                }}
            />
        </div>
    );
}

export default CategorySortableItem;
