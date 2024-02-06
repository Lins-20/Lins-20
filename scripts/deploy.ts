import { ethers, upgrades } from "hardhat";

async function main() {
    const impl = "0x97700d961b8f14b27973df18758e92ee591e373a"; // the lins20v2 address, if not deployed, set it to ethers.ZeroAddress
    const factory: any = await ethers.getContractFactory("Lins20FactoryV2");
    const proxy = await upgrades.deployProxy(factory, [impl], {
        initializer: "initialize",
        kind: "uups",
    });
    const deploy = await proxy.waitForDeployment();
    console.log("proxy contract address:", deploy.target);
    console.log(
        "logic contract address:",
        await upgrades.erc1967.getImplementationAddress(deploy.target.toString())
    );

    console.log(await proxy.owner())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
