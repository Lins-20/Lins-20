import { ethers, upgrades } from "hardhat";


async function main() {
    const proxyAddr = "0x5cb5Dc71E652CAeF6791e9750d55aEC46aC38835";
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