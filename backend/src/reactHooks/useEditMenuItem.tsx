import { useMutation, useQueryClient } from "@tanstack/react-query";
import mapSet from "../utils/mapSet";
import { MenuItemsQueryData } from "../views/fetches";
import checkForFutureMutation from "../utils/checkForFutureMutation";
import { nanoid } from "nanoid";
import { toast } from "react-toastify";

interface mutationData {
    name: string;
    price: number;
}
export default function useEditMenuItem(id: string) {
    const queryClient = useQueryClient();

    const mutationKey = `edit-${id}-mutation`;
    const editMutation = useMutation({
        mutationFn: async ({ name, price }: mutationData) => {
            const response = await fetch(`/api/menu_items/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    price,
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
        },
        onMutate: async ({ name, price }: mutationData) => {
            await queryClient.cancelQueries({
                queryKey: ["menuItems"],
            });
            await queryClient.setQueryData(
                ["menuItems"],
                (oldData: MenuItemsQueryData): MenuItemsQueryData => {
                    return mapSet(oldData, id, (item) => ({
                        ...item,
                        name,
                        price,
                    }));
                },
            );

            return { id: nanoid() };
        },

        onSuccess: (_, __, context) => {
            if (
                checkForFutureMutation(queryClient, [mutationKey], context.id)
            ) {
                return;
            }

            toast.success("Successfully edited menu item.");
        },
        onError: async (err, _, context) => {
            console.error(err);
            console.log("context id", context?.id);
            if (
                checkForFutureMutation(
                    queryClient,
                    [mutationKey],
                    context?.id || "",
                )
            ) {
                return;
            }

            toast.error("Failed to edit menu item.");

            await queryClient.invalidateQueries({
                queryKey: ["menuItems"],
            });
        },
        mutationKey: [mutationKey],
    });

    return editMutation;
}
