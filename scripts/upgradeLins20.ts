import {ethers} from "hardhat";

async function main() {
    const factoryAddr = "0xA63BE2b5A5ce267fFf404a84C9b567023CbC8ab0"; 
    const lins20_Addr = ""; // old impl
    const res = await ethers.deployContract("Lins20V2");
    const implNew = res.target.toString()

    const lins20 = await ethers.getContractAt("Lins20Proxy", lins20_Addr);
    const upgrade: any = await lins20.upgradeTo(implNew);
    await upgrade.wait();
    console.log("upgrade lins20 success", upgrade.status);

    const factory = await ethers.getContractAt("Lins20FactoryV2", factoryAddr);
    await factory.setLins20Impl(implNew);

    console.log("set factory impl success");
}

main();