import { ethers, upgrades } from "hardhat";

async function main() {
    const impl = "0x01B3b62026374109e4644C2e0C8aF601415230C5"; // the lins20v2 address, if not deployed, set it to ethers.ZeroAddress
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
