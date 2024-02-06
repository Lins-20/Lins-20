import { ethers } from "hardhat";

async function main() {
    const deploy = await ethers.deployContract("Lins20V2")
    console.log("contract address:", deploy.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
