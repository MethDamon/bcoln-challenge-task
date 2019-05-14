const fs = require('fs-extra');

async function cleanBuild() {
    try {
        await fs.remove("./build/contracts/");
        await fs.remove("./src/abi/*");
        console.log("Removed build and abi");
    } catch (e) {
        console.error(e)
    }
}

cleanBuild();
