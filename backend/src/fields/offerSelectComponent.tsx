import React from "react";
import { SelectInput, useField, Label } from "payload/components/forms";
import type { Config, Menu } from "../payload-types";
import { useEffect } from "react";
import { FieldWithPath, TextField } from "payload/types";

declare module "payload" {
    export interface GeneratedTypes extends Config {}
}

type TextFieldWithPath = TextField & FieldWithPath;

export function offerSelectComponent(props: TextFieldWithPath) {
    const { value, setValue } = useField<string>({ path: props.path });
    const [options, setOptions] = React.useState<
        { label: string; value: string }[]
    >([]);
    useEffect(() => {
        type MenuItem = NonNullable<Menu["categories"][0]["main_items"]>[0];
        const fetchOptions = async () => {
            const res = await fetch(
                "/api/globals/menu?locale=undefined&draft=false&depth=1",
            );
            if (res.status !== 200) {
                throw new Error("Failed to fetch menu");
            }
            const menu: Menu = await res.json();

            const menuItems: MenuItem[] = menu.categories.reduce(
                (acc: MenuItem[], category) => {
                    if (category.main_items) {
                        acc = acc.concat(category.main_items);
                    }
                    if (category.sub_categories) {
                        const subCategoryItems: MenuItem[] =
                            category.sub_categories.reduce(
                                (acc: MenuItem[], subCategory) => {
                                    return acc.concat(
                                        subCategory.sub_category_items,
                                    );
                                },
                                [],
                            );
                        acc = acc.concat(subCategoryItems);
                    }
                    return acc;
                },
                [],
            );
            setOptions(
                menuItems
                    .filter((item) => item.id)
                    .map((item) => ({
                        label: item.item,
                        value: item.id,
                    })),
            );
        };
        fetchOptions().catch(console.error);
    }, []);

    return (
        <div className="field-type text">
            <Label label={props.label} {...props}></Label>
            <SelectInput
                value={value}
                path={props.path}
                options={options}
                name={props.name}
                required={true}
                onChange={(e) => setValue(e.value)}
            />
        </div>
    );
}

export default offerSelectComponent;
