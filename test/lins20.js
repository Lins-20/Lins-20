// const { expect } = require("chai");
// const { ethers } = require("hardhat");
// const { BigNumber } = require("ethers");


// describe("lins20", function () {

//     async function deployLins20() {
//         const [owner, addr1, addr2] = await ethers.getSigners();
//         // deploy factory
//         const contract = await ethers.deployContract("Lins20Factory");
//         // deploy lin20
//         const tick = "lins20", limit = BigNumber.from("1000000000000000000000"), totalSupply = BigNumber.from("2000000000000000000000000"), burns = 1000, fee = 2;
//         const res = await contract.createLins20(tick, limit, totalSupply, burns, fee);

//         const log = (await res.wait()).logs[1]
//         const logParam = contract.interface.decodeEventLog("InscribeDeploy", log.data, log.topics)
//         // deploy log
//         expect(logParam.content).to.equal(`data:,{"p":"lins20","op":"deploy","tick":"${tick}","max":"2000000","lim":"1000"}`)

//         // deploy results
//         const lins20Addr = await contract.inscriptions(tick)
//         expect(lins20Addr).to.exist;

//         const lins20Contract = await ethers.getContractAt("Lins20", lins20Addr);

//         return { owner, lins20Contract, tick }
//     }

//     it("withdraw", async function () {
//         // transfer some eth to contract
//         const { owner, lins20Contract } = await deployLins20();
//         const amount = ethers.utils.parseEther("1");
//         await owner.sendTransaction({
//             to: lins20Contract.address,
//             value: amount,
//         })
//         expect(await owner.provider.getBalance(lins20Contract.address)).equal(amount)
//         var balance = await owner.provider.getBalance(owner.address);
//         // withdraw
//         await lins20Contract.connect(owner).withdraw();
//         expect(await owner.provider.getBalance(lins20Contract.address)).equal(BigNumber.from(0));
//         //because of gas fee, balance should be less than before
//         expect(await owner.provider.getBalance(owner.address)).lt(balance.add(amount));
//         expect(await owner.provider.getBalance(owner.address)).gt(balance);
//     });

//     it("pause & unpause", async function () {
//         const [owner, addr1, addr2] = await ethers.getSigners();
//         const { lins20Contract } = await deployLins20();

//         const status1 = await lins20Contract.paused()
//         expect(status1).equal(false);

//         await lins20Contract.pause();
//         const status2 = await lins20Contract.paused()
//         expect(status2).equal(true);

//         await lins20Contract.unpause();
//         const status3 = await lins20Contract.paused()
//         expect(status3).equal(false);

//         // for unauthorized call
//         await expect(lins20Contract.connect(addr1).pause()).to.be.reverted;
//         await expect(lins20Contract.connect(addr1).unpause()).to.be.reverted;
//     });

//     it("owner", async function () {
//         const { owner, lins20Contract } = await deployLins20();
//         const res = await lins20Contract.owner();
//         expect(res).equal(owner.address);
//     });

//     it("symbol", async function() {
//         const { owner, lins20Contract, tick } = await deployLins20();
//         expect(await lins20Contract.symbol()).eq(tick);
//     });

//     it("name", async function() {
//         const { owner, lins20Contract, tick } = await deployLins20();
//         expect(await lins20Contract.name()).eq(`inscription ${tick}`);
//     });
// });
