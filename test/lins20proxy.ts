import { expect } from "chai";
import { BaseContract, Contract } from "ethers";
import { ethers } from "hardhat";

describe("lins20 proxy", () => {

    const limit = 1000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 1000, fee = 2;
    async function deploy() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        // deploy lins20 impl
        const impl = await ethers.deployContract("Lins20V2");
        const implAddr = await impl.getAddress();
        expect(implAddr).to.exist;

        // deploy factory
        const factory = await ethers.deployContract("Lins20FactoryV2");
        const factoryAddr = await factory.getAddress();
        expect(factoryAddr).to.exist;

        await factory.initialize(await impl.getAddress());
        expect(await factory.lins20Impl()).eq(implAddr);

        return { impl, factory, owner, addr1, addr2 }
    }

    async function deployLins20(name?: string) {
        const { impl, factory, owner, addr1, addr2 } = await deploy()
        const tick = name ?? "abc";
        await factory.createLins20(tick, limit, totalSupply, burns, fee);
        const lins20Proxy = await factory.inscriptions(tick)
        return { impl, factory, owner, addr1, addr2, lins20Proxy }
    }

    async function createLins20(tick: string, factory: Contract, _limit?: bigint, _totalSupply?: bigint, _burns?: number, _fee?: bigint) {
        await factory.createLins20(tick, _limit ?? limit, _totalSupply ?? totalSupply, _burns ?? burns, _fee ?? fee);
        const lins20Proxy = await factory.inscriptions(tick)
        return lins20Proxy;
    }

    it("create lins 20", async () => {
        const { factory, impl } = await deploy();

        const tick1 = "abc";
        await factory.createLins20(tick1, limit, totalSupply, burns, fee);

        const tick2 = "ABC";
        await factory.createLins20(tick2, limit * 2n, totalSupply * 2n, burns - 1, fee - 1);

        const addr1 = await factory.inscriptions(tick1)
        expect(addr1).to.exist;

        const addr2 = await factory.inscriptions(tick2)
        expect(addr2).to.exist;

        const c1 = await ethers.getContractAt("Lins20V2", addr1);
        const c2 = await ethers.getContractAt("Lins20V2", addr2);

        expect(await c1.symbol() !== await c2.symbol()).eq(true);
        expect(await c1.limit() !== await c2.limit()).eq(true);
        expect(await c1.fee() !== await c2.fee()).eq(true);
        expect(await c1.burnsRate() !== await c2.burnsRate()).eq(true);
        expect(await c1.maxMint() !== await c2.maxMint()).eq(true);
        expect(await c1.owner() === await c2.owner()).eq(true);

        const proxy = await ethers.getContractAt("Lins20Proxy", addr1);
        expect(await proxy.getImplementation() === await impl.getAddress());
    })

    it("owner", async () => {
        const { owner, lins20Proxy } = await deployLins20();
        const contract = await ethers.getContractAt("Lins20V2", lins20Proxy);
        expect(await contract.owner() == owner.address).eq(true);
    })

    it("lins 20 upgrade", async () => {
        // deploy new impl
        const { impl, lins20Proxy } = await deployLins20();
        const newImpl = await ethers.deployContract("Lins20V2");
        const newAddr = await newImpl.getAddress();

        const proxy = await ethers.getContractAt("Lins20Proxy", lins20Proxy);
        await proxy.upgradeTo(newAddr);
        expect(await proxy.getImplementation() !== await impl.getAddress(), "upgradeToAndCall error").eq(true);

    })

    it("unauthorized upgrade", async () => {
        const { lins20Proxy, addr1 } = await deployLins20();

        const newImpl = await ethers.deployContract("Lins20V2");
        const newAddr = await newImpl.getAddress();

        const proxy = await ethers.getContractAt("Lins20Proxy", lins20Proxy);
        await proxy.upgradeTo(newAddr);
        expect(proxy.connect(addr1.address).upgradeTo(newAddr)).to.be.reverted;
    })

    it("transfer pause & unpause", async () => {
        const { lins20Proxy, addr1 } = await deployLins20();
        const proxy = await ethers.getContractAt("Lins20V2", lins20Proxy);

        expect(await proxy.transferPaused()).eq(false);
        await proxy.pauseTransfer();
        expect(await proxy.transferPaused()).eq(true);

        await proxy.mint({ value: fee });
        expect(proxy.transfer(await addr1.getAddress(), 1000n)).to.be.reverted;

        await proxy.unpauseTransfer();
        expect(await proxy.transferPaused()).eq(false);
    });

    it("mint", async () => {
        const { lins20Proxy, addr1, owner } = await deployLins20();
        const contract = await ethers.getContractAt("Lins20V2", lins20Proxy);

        expect(await contract.balanceOf(owner.address)).eq(0n)
        await contract.mint({ value: fee }); // mint 
        expect(await contract.balanceOf(owner.address)).eq(limit)
    });

    it("recover", async () => {
        const {owner, factory, addr1, addr2} = await deploy();

        // create origin inscription
        const originAddr = await createLins20("origin", factory);
        const originContract = await ethers.getContractAt("Lins20V2", originAddr);
        
        await originContract.connect(addr1).mint({value: fee})

        const newLins20 = await createLins20("new", factory);
        const newLins20Contract = await ethers.getContractAt("Lins20V2", newLins20);

        await newLins20Contract.setOrigin(originAddr);
        await newLins20Contract.recover([addr1.address, addr2.address]);

        expect(await newLins20Contract.balanceOf(addr1.address)).eq(limit);
        expect(await newLins20Contract.balanceOf(addr2.address)).eq(0n);

        // recover twice
        await newLins20Contract.recover([addr1.address, addr2.address, addr1.address]);

        expect(await newLins20Contract.balanceOf(addr1.address)).eq(limit);
        expect(await newLins20Contract.balanceOf(addr2.address)).eq(0n);
    });
});