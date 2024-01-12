import { ethers, upgrades } from "hardhat";

async function main() {
    const factory: any = await ethers.getContractFactory("Lins20Factory");
    const proxy = await upgrades.deployProxy(factory, [], {
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
