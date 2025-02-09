import React, { useState } from "react";
import { Button } from "payload/components/elements";
import CheckIcon from "payload/dist/admin/components/icons/Check";
import { TextInput } from "payload/components/forms";

interface MenuItemInputProps {
    onCancel: () => void;
    onSave: (name: string, price: number) => void;
    inputRef: React.MutableRefObject<HTMLInputElement>;
    loading: boolean;
}
function MenuItemInput({
    onCancel,
    onSave,
    inputRef,
    loading,
}: MenuItemInputProps) {
    const [name, setName] = useState<string>("");
    const [price, setPrice] = useState<string>("");

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (loading) {
            return;
        }
        setName(e.target.value);
    }

    function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
        // Only allow digits, no decimals, no negative numbers
        if (loading) {
            return;
        }
        setPrice(e.target.value.replace(/\D/g, ""));
    }

    function handleCancel() {
        if (loading) {
            return;
        }
        onCancel();
    }

    function handleSave() {
        if (loading) {
            return;
        }
        if (!name || !price) {
            return;
        }

        onSave(name, parseInt(price));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    }

    return (
        <div className="menu-item" onKeyDown={handleKeyDown}>
            {loading && <div className="menu-item__loading-overlay" />}
            <div className="menu-item__left-items">
                <TextInput
                    path="menu-item-name"
                    name="menu item name"
                    label={false}
                    placeholder={"Name"}
                    value={name}
                    onChange={handleNameChange}
                    inputRef={inputRef}
                ></TextInput>
            </div>
            <div className="menu-item__right-items">
                <TextInput
                    path="menu-item-price"
                    name="menu item price"
                    label={false}
                    placeholder={"Price"}
                    value={price}
                    onChange={handlePriceChange}
                ></TextInput>
                <Button
                    className="menu-item__save-button"
                    icon={<CheckIcon />}
                    size="small"
                    buttonStyle="icon-label"
                    onClick={handleSave}
                    disabled={loading}
                />
                <Button
                    className="menu-item__cancel-button"
                    icon="x"
                    size="small"
                    buttonStyle="icon-label"
                    onClick={handleCancel}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

export default MenuItemInput;
