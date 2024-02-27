import { task } from "hardhat/config";

task("add_ins", "deploy new inscription")
.addParam("factory", "factory address", "0x187714c96C029b184db59Fa6fFd18973C4849f3E")
.addParam("tick", "tick name", "ALIEN")
.addOptionalParam("limit", "mint limit", "1000")
.addOptionalParam("total", "totalSupply", "100000000")
.addOptionalParam("burns", "burns rate", "500")
.addOptionalParam("fee", "mint fee", "0")
.setAction(async (taskArgs, hre) => {
    console.log("params", taskArgs);
    const {factory, tick, limit, total, burns, fee} = taskArgs;
    const _contract = await hre.ethers.getContractFactory("Lins20FactoryV2");
    const contract = _contract.attach(factory);
    const decimals = "000000000000000000"; // 18

    const res: any = await contract.createLins20(tick, BigInt(`${limit}${decimals}`), BigInt(`${total}${decimals}`), BigInt(burns), BigInt(fee));
    console.log("create lins20 at", res.hash);
})
