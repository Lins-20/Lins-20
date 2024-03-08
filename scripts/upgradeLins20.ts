import {ethers} from "hardhat";

async function main() {
    const factoryAddr = "0x5cb5Dc71E652CAeF6791e9750d55aEC46aC38835"; 
    const lins20proxy = "0x2566a15ac30899EE83FDB984C8D8BEe89988486C"; // 
    const res = await ethers.deployContract("Lins20V2");
    const implNew = await res.getAddress();
    console.log("deploy lins20 impl", implNew);
    
    const lins20 = await ethers.getContractAt("Lins20Proxy", lins20proxy);
    const upgrade: any = await lins20.upgradeTo(implNew);
    await upgrade.wait();
    console.log("upgrade lins20 success", upgrade.status);

    const factory = await ethers.getContractAt("Lins20FactoryV2", factoryAddr);
    await factory.setLins20Impl(implNew);
    console.log("set factory impl success");
}

main();