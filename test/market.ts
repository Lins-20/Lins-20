import { expect } from "chai";
import { ethers } from "hardhat";

describe("market", function () {
    // deploy market and set feeRate to 1000
    async function deployMarket() {
        const market = await ethers.deployContract("Market");
        const address = await market.getAddress();
        expect(address).to.exist;
        const feeRate = 1000;
        await market.initialize(feeRate);
        expect(await market.feeRate()).to.equal(feeRate);
        return {address, market};
    }

    async function deployLins20() {
        // deploy factory
        const factory = await ethers.deployContract("Lins20Factory");

        // deploy lin20
        const tick = "lins20", limit = 1000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 0, fee = 2;
        const res = await factory.createLins20(tick, limit, totalSupply, burns, fee);

        const log = (await res.wait()).logs[1]
        const logParam = factory.interface.decodeEventLog("InscribeDeploy", log.data, log.topics)
        // deploy log
        expect(logParam.content).to.equal(`data:,{"p":"lins20","op":"deploy","tick":"${tick}","max":"2000000","lim":"1000"}`)

        // deploy results
        const lins20Addr = await factory.inscriptions(tick)
        expect(lins20Addr).to.exist;

        const lins20Contract = await ethers.getContractAt("Lins20", lins20Addr);

        return {lins20Contract, tick }
    }

    async function make() {
        const [owner] = await ethers.getSigners();
        const {address, market } = await deployMarket();
        const {lins20Contract} = await deployLins20();
        expect(await lins20Contract.balanceOf(owner.address)).eq(0n)
        await lins20Contract.mint({value:2}); // mint
        const balance = await lins20Contract.balanceOf(owner.address);
        // check lins20 balance
        expect(balance).eq(1000000000000000000000n)
        // params: uint pay_amt, ERC20 pay_gem, uint buy_amt
        const pay_amt = 100;
        const pay_gem = await lins20Contract.getAddress();
        const buy_amt = 100000000000000000000n;
        // approve
        const tx1 = await lins20Contract.approve(address, 1000);
        const receipt1 = await tx1.wait();
        expect(receipt1.status).to.equal(1);
        const tx2 = await market.make(pay_amt, pay_gem, buy_amt);
        const receipt2 = await tx2.wait();
        expect(receipt2.status).to.equal(1);

        //check lins20 balance
        expect(await lins20Contract.balanceOf(owner.address)).eq(balance - BigInt(pay_amt))

        const logParam = market.interface.decodeEventLog("LogMake", receipt2.logs[1].data, receipt2.logs[1].topics);
        const offerId = logParam.id;
        expect(offerId).to.exist;
        // get market info
        const offer = await market.getOffer(offerId);
        expect(offer[0]).to.equal(pay_amt);
        expect(offer[1]).to.equal(pay_gem);
        expect(offer[2]).to.equal(buy_amt);
        expect(offer[3]).to.equal(owner.address);
        return {offerId, market, owner, lins20Contract, offer};
    }

    it("make", async function () {
        const {offerId} = await make();
        expect(offerId).to.exist;
    });

    it("buy", async function () {
        const {offerId, market, owner, lins20Contract, offer} = await make();
        expect(offerId).to.exist;
        const [owner1,address1] = await ethers.getSigners();
        // get eth balance
        const balance = await address1.provider.getBalance(address1.address);
        expect(await lins20Contract.balanceOf(address1.address)).eq(0n);
        // approve
        const tx1 = await lins20Contract.approve(await market.getAddress(), 1000);
        const receipt1 = await tx1.wait();
        expect(receipt1.status).to.equal(1);
        const tx2 = await market.connect(address1).buy(offerId, {value:offer[2]});
        const receipt2 = await tx2.wait();
        expect(receipt2.status).to.equal(1);
        // chect lins20 balance
        expect(await lins20Contract.balanceOf(address1.address)).eq(offer[0])
        // check eth balance
        const balance1 = await address1.provider.getBalance(address1.address);
        expect(balance1).to.lt(balance - (offer[2]) );
    });

    it("cancel", async function () {
        const {offerId, market, owner, lins20Contract, offer} = await make();
        expect(offerId).to.exist;
        const tx = await market.cancel(offerId);
        const receipt = await tx.wait();
        expect(receipt.status).to.equal(1);
        // get market info
        const offer_1 = await market.getOffer(offerId);
        expect(offer_1[0]).to.equal(0);
    });

    it("withdraw", async function () {
        const {offerId, market, owner, lins20Contract, offer} = await make();

        // check lin20 eth balance
        const lins20Balance_0 = await owner.provider.getBalance(await market.getAddress());
        expect(lins20Balance_0).to.eq(0);
        expect(offerId).to.exist;
        const [owner1,address1] = await ethers.getSigners();

        // buy
        const tx1 = await market.connect(address1).buy(offerId, {value:offer[2]});
        const receipt1 = await tx1.wait();
        expect(receipt1.status).to.equal(1);
        // check lin20 eth balance
        const lins20Balance_1 = await owner.provider.getBalance(await market.getAddress());
        expect(lins20Balance_1).to.gt(0);
        // check owner eth balance
        const balance1 = await owner.provider.getBalance(owner.address);

        //withdraw
        try {
            await market.connect(address1).withdraw();
            expect(false).to.equal(true);
        }catch (e) {
            console.log(e);
        }
        const tx2 = await market.withdraw();
        const receipt2 = await tx2.wait();
        expect(receipt2.status).to.equal(1);

        // check lin20 eth balance
        const lins20Balance_2 = await owner.provider.getBalance(await market.getAddress());
        expect(lins20Balance_2).to.eq(0);

        // check owner eth balance
        const balance2 = await owner.provider.getBalance(owner.address);
        expect(balance2).to.gt(balance1);
    });
});
