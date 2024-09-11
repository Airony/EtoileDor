import { exec as oldExec } from "child_process";
import path from "path";
import util from "util";
import disallowConcurrency from "./disallowConcurrency.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const exec = util.promisify(oldExec);

async function nginxBuild() {
    const execOptions = {
        cwd: path.resolve(__dirname),
    };
    await exec("sh build-and-deploy.sh", execOptions);
    // await exec("npm run build", execOptions);
    // await exec("mv dist result/newdist");
    // await exec(`ln -s ./result/newdist ./result/html`, execOptions);
    // await exec(`mv -fT newresult result`, execOptions);
    // Build
    // Copy dist to /result/
    // Symlink dist to newhtml
    // Switch
}

export default disallowConcurrency(
    nginxBuild,
    "A build is already in progress, please wait for it to finish before starting a new one.",
);
