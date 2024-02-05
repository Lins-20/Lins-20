// const { expect } = require("chai");
// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
// const { ethers } = require("hardhat");
// const { BigNumber } = require("ethers");


// describe("lins20 factory", function () {
//     async function deployTokenFixture() {
//         const [owner, addr1, addr2] = await ethers.getSigners();
//         const contract = await ethers.deployContract("Lins20Factory");
//         return { contract, owner, addr1, addr2 };
//     }

//     it("mint V2", async function () {
//         const { contract, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
//         const tick = "test", limit = BigNumber.from("1000000000000000000000"), totalSupply = BigNumber.from("2000000000000000000000000"), burns = 1000, fee = 2;
//         const res = await contract.createLins20(tick, limit, totalSupply, burns, fee)
//         expect(res).to.exist;

//         const log = (await res.wait()).logs[1]
//         const logParam = contract.interface.decodeEventLog("InscribeDeploy", log.data, log.topics)
//         // deploy log
//         expect(logParam.content).to.equal(`data:,{"p":"lins20","op":"deploy","tick":"test","max":"2000000","lim":"1000"}`)

//         // deploy results
//         const address = await contract.inscriptions(tick)
//         expect(address).to.exist;

//         const lins20 = await ethers.getContractAt("Lins20", address);
//         const ins = await lins20._mintInscription()

//         // mint V2
//         const r = await lins20.connect(owner).mintV2(ins, { value: fee });

//         const mintReceipt = await r.wait()
//         const mintLog = lins20.interface.decodeEventLog("InscribeMint", mintReceipt.logs[1].data, mintReceipt.logs[1].topics)
//         expect(mintLog.content).to.equal(`data:,{"p":"lins20","op":"mint","tick":"test","amt":"1000"}`)

//         const eirc20_balance = await lins20.balanceOf(owner.address);
//         expect(eirc20_balance).equal(limit);

//         // transfer
//         const fakeAddress = "0x0000000000000000000000000000000000000001";
//         const transReceipt = await (await lins20.transfer(fakeAddress, BigNumber.from("550321700000000000000"))).wait(); //  burn 1% = fee / 10000
//         const transLog = lins20.interface.decodeEventLog("InscribeTransfer", transReceipt.logs[2].data, transReceipt.logs[2].topics)
//         expect(transLog.content).to.equal(`data:,{"p":"lins20","op":"transfer","tick":"test","amt":"550.3217","to":"0x0000000000000000000000000000000000000001"}`);
//     });

//     it("lins20 deploy and mint", async function () {
//         const { contract, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
//         const tick = "test", limit = BigNumber.from("1000000000000000000000"), totalSupply = BigNumber.from("2000000000000000000000000"), burns = 1000, fee = 2;
//         // deploy.
//         const res = await contract.createLins20(tick, limit, totalSupply, burns, fee)
//         expect(res).to.exist;

//         // deploy results
//         const address = await contract.inscriptions(tick)
//         expect(address).to.exist;

//         // mint
//         const lins20 = await ethers.getContractAt("Lins20", address);

//         const txRes = await lins20.connect(owner).mint({ value: fee});

//         const mintReceipt = await txRes.wait()
//         const mintLog = lins20.interface.decodeEventLog("InscribeMint", mintReceipt.logs[1].data, mintReceipt.logs[1].topics)
//         expect(mintLog.content).to.equal(`data:,{"p":"lins20","op":"mint","tick":"${tick}","amt":"1000"}`)

//         const fakeAddress = "0x0000000000000000000000000000000000000001";
//         const transReceipt = await (await lins20.transfer(fakeAddress, BigNumber.from("550321700000000000000"))).wait(); //  burn 1% = fee / 10000
//         const transLog = lins20.interface.decodeEventLog("InscribeTransfer", transReceipt.logs[2].data, transReceipt.logs[2].topics)
//         expect(transLog.content).to.equal(`data:,{"p":"lins20","op":"transfer","tick":"test","amt":"550.3217","to":"0x0000000000000000000000000000000000000001"}`);
//     })

//     it("owner", async function () {
//         const { contract, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);;
//         expect(await contract.owner()).equal(owner.address);
//     });

//     it("pause", async function () {
//         const { contract, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);;
//         expect(await contract.owner()).equal(owner.address);

//         const status1 = await contract.paused()
//         expect(status1).equal(false);

//         await contract.pause();
//         const status2 = await contract.paused()
//         expect(status2).equal(true);

//         await contract.unpause();
//         const status3 = await contract.paused()
//         expect(status3).equal(false);

//         // for unauthorized call
//         await expect(contract.connect(addr1).pause()).to.be.reverted;
//         await expect(contract.connect(addr1).unpause()).to.be.reverted;
//     });

// });
