import { ethers, upgrades } from "hardhat";

async function main() {
    const market: any = await ethers.getContractFactory("Market");
    const feeRate = 0n;
    const proxy = await upgrades.deployProxy(market, [feeRate], {
        initializer: "initialize",
        kind: "uups",
    });
    const deploy = await proxy.waitForDeployment();
    console.log("proxy address :", deploy.target);
    console.log("logic address :", await upgrades.erc1967.getImplementationAddress(deploy.target.toString()));
    console.log("contract owner:", await proxy.owner());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
