import { ethers, upgrades } from "hardhat";

async function main() {
    const res = await ethers.deployContract("Lins20V2");
    const implNew = await res.getAddress();
    // const implNew = "0xa2f32Ce34fa29702B36bF39eb83b5Ae4cBDe6C68";
    console.log("deploy lins20 impl", implNew);

    async function upgradeLins20(addr: string) {
        const lins20 = await ethers.getContractAt("Lins20Proxy", addr);
        const upgrade: any = await lins20.upgradeTo(implNew);
        await upgrade.wait();
        console.log("upgrade lins20 success", addr, upgrade.status);

        // // set factory address
        // const logic = await ethers.getContractAt("Lins20V2", addr);
        // const resp: any = await logic.setFactory(factoryAddr);
        // await resp.wait();
        // console.log("set lins20 factory address success", addr);
    }

    const factoryAddr = "0x187714c96C029b184db59Fa6fFd18973C4849f3E";
    const marketProxy = "0x7f753ef1c30B650D757088EF1a7A4f1CE1da826E";
    const alien_v2 = "0x753cf76D04b0f91069551c8Ab9D7ef5cD7a7e9b6";
    const lins_v2 = "0xbe5589c967CCEC8dE72236e140A56bbabD794FDc";

    async function setFactoryImpl(impl: string) {
        const factory = await ethers.getContractAt("Lins20FactoryV2", factoryAddr);
        await factory.setLins20Impl(impl);
        console.log("set factory impl success");
    }


    await upgradeLins20(alien_v2);
    await upgradeLins20(lins_v2);
    await setFactoryImpl(implNew);
    // await upgradeMarket();

    async function upgradeMarket() {

        const origin: any = await ethers.getContractFactory("Market");
        const res = await upgrades.upgradeProxy(marketProxy, origin);
        console.log("upgrade market success", res.address);
    }
}

main();