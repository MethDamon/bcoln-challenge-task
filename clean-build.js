const fs = require('fs-extra');

async function cleanBuild() {
    try {
        await fs.remove("./build/contracts/");
        console.log("Removed build");
    } catch (e) {
        console.error(e)
    }
}

cleanBuild();
