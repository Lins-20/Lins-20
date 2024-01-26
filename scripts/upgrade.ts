import { ethers, upgrades } from "hardhat";

async function main() {
    const proxyAddr = "0xA63BE2b5A5ce267fFf404a84C9b567023CbC8ab0";

    const v2: any = await ethers.getContractFactory("Lins20Factory");
    const upgradeProxy = await upgrades.upgradeProxy(proxyAddr, v2);
    console.log("contract upgraded successfully");
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
})