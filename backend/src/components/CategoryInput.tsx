import React, { useState } from "react";
import { TextInput } from "payload/components/forms";
import { Button } from "payload/components/elements";
import CheckIcon from "payload/dist/admin/components/icons/Check";
import CancelIcon from "payload/dist/admin/components/icons/X";

interface CategoryInputProps {
    onCancel: () => void;
    onSave: (text: string) => void;
    inputRef: React.MutableRefObject<HTMLInputElement>;
    loading: boolean;
}
function CategoryInput({
    onCancel,
    onSave,
    inputRef,
    loading,
}: CategoryInputProps) {
    const [text, setText] = useState<string>("");

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (loading) {
            return;
        }
        if (e.key === "Enter") {
            handleSave();
        } else if (e.key === "Escape") {
            onCancel();
        }
    }

    function handleSave() {
        if (loading) {
            return;
        }
        if (text) {
            onSave(text);
        }
    }
    function handleCancel() {
        if (loading) {
            return;
        }
        onCancel();
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (loading) {
            return;
        }
        setText(e.target.value);
    }

    return (
        <div className="category-input">
            {loading && <div className="category-input__loading"></div>}
            <TextInput
                path={"category-name-input"}
                name={"category-name-input"}
                value={text}
                onChange={handleChange}
                className="category-input__field"
                onKeyDown={handleKeyDown}
                inputRef={inputRef}
            />
            <div className="category-input__actions">
                <Button
                    buttonStyle="icon-label"
                    size="small"
                    onClick={handleSave}
                    className="category-input__save"
                    icon={<CheckIcon />}
                    aria-label="Save name"
                    disabled={loading}
                />
                <Button
                    buttonStyle="icon-label"
                    icon={<CancelIcon />}
                    size="small"
                    onClick={handleCancel}
                    className="category-input__save"
                    aria-label="Cancel name change"
                    disabled={loading}
                />
            </div>
        </div>
    );
}

export default CategoryInput;
