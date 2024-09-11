import { GlobalConfig } from "payload/types";
import { isAdmin } from "../accessControls";
import deploymentView from "../deploymentView";

const deploymentConfig: GlobalConfig = {
    slug: "deployment",
    label: "Deployment",
    access: {
        read: isAdmin,
        update: isAdmin,
    },

    fields: [],
    admin: {
        hideAPIURL: true,

        components: {
            views: {
                Edit: deploymentView,
            },
        },
    },
};

export default deploymentConfig;
