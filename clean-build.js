const fs = require('fs-extra');

async function cleanBuild() {
    try {
        await fs.remove("./src/build/");
        console.log("Removed build");
    } catch (e) {
        console.error(e)
    }
}

cleanBuild();
