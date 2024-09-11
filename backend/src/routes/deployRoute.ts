import { PayloadRequest } from "payload/types";

export default async function deployRoute(req: PayloadRequest, res) {
    if (!req.user) {
        res.status(403).send("Not authenticated.").end();
        return;
    }
    if (req.user.role !== "admin") {
        res.status(403).send("Not authorized.").end();
        return;
    }
    try {
        const response = await fetch(`${process.env.FRONTEND_URL}/deploy`, {
            method: "POST",
        });
        if (response.status === 200) {
            res.status(200).end();
        } else {
            const errorText = await response.text();
            res.status(500).send(errorText).end();
        }
    } catch (error) {
        res.status(500)
            .send("Could not connect to frontend, please try again.")
            .end();
    }
}
