import express from "express";
const app = express();
import nginxBuild from "./nginxBuild.js";
const PORT = 7979;
app.post("/deploy", async (req, res) => {
    try {
        await nginxBuild();
        res.status(200).end();
    } catch (error) {
        let payload;
        let status;
        if (typeof error === "string") {
            payload = error;
            status = 400;
        } else if (error.stderr) {
            payload = error.stderr;
            status = 400;
        } else {
            payload = "An internal error has  occurred, please try again.";
            status = 500;
        }
        res.status(status).send(payload).end();
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
