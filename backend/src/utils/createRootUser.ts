import { readFileSync } from "fs";
import { Payload } from "payload";
import { rootEmail } from "../collections/Users";
export default async function createRootUser(payload: Payload) {
    let password: string = "";
    if (process.env.PAYLOAD_INIT_ROOT_PASSWORD_FILE) {
        password = readFileSync(process.env.PAYLOAD_INIT_ROOT_PASSWORD_FILE, "utf8");
    } else if (process.env.PAYLOAD_INIT_ROOT_PASSWORD) {
        password = process.env.PAYLOAD_INIT_ROOT_PASSWORD;
    } else {
        throw new Error("PAYLOAd_INIT_ROOT_PASSWORD or PAYLOAD_INIT_ROOT_PASSWORD_FILE must be set.");
    }
    console.log(password)

    const exists = (await payload.find({
        collection: "users",
        where: {
            "email": { equals: rootEmail },
        }
    })).totalDocs > 0;
    if (exists) {
        console.log("return")
        return;
    }
    console.log("create")
    await payload.create({
        collection: "users",
        data: {
            email: rootEmail,
            password: password,
            role: "admin",
        },
    })

}