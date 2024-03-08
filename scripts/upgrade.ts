import { ethers, upgrades } from "hardhat";


async function main() {
    const proxyAddr = "0x187714c96C029b184db59Fa6fFd18973C4849f3E";
    const v2: any = await ethers.getContractFactory("Lins20FactoryV2");
    // const v1: any = await ethers.getContractFactory("Lins20FactoryV2");
    // await upgrades.forceImport(proxyAddr, v1);

    const upgradeProxy = await upgrades.upgradeProxy(proxyAddr, v2);
    console.log("contract upgraded successfully");
}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
})