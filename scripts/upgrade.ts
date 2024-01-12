import { ethers, upgrades } from "hardhat";

async function main() {
    const proxyAddr = "0xProxy_address_...";

    const v2: any = await ethers.getContractFactory("Lins20Factory");
    const upgradeProxy = await upgrades.upgradeProxy(proxyAddr, v2);

}

main().catch(e => {
    console.error(e);
    process.exitCode = 1;
})