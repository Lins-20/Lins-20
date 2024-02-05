import { expect } from "chai";
import { BaseContract, Contract } from "ethers";
import { ethers } from "hardhat";

describe("lins20 proxy", () => {

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

    it("process", async function () {
        await deploy()
    })

    it("create lins 20", async () => {
        const {factory, impl} = await deploy();
        const limit = 1000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 1000, fee = 2;

        const tick1 = "abc";
        await factory.createLins20(tick1, limit, totalSupply, burns, fee);

        const tick2 = "ABC";
        await factory.createLins20(tick2, limit * 2n, totalSupply * 2n, burns - 1, fee - 1);

        const addr1 = await factory.inscriptions(tick1)
        expect(addr1).to.exist;

        const addr2 = await factory.inscriptions(tick2)
        expect(addr2).to.exist;

        const c1 = await ethers.getContractAt("Lins20V2", addr1) ;
        const c2 = await ethers.getContractAt("Lins20V2", addr2);

        expect(await c1.symbol() !== await c2.symbol()).eq(true);
        expect(await c1.limit() !== await c2.limit()).eq(true);
        expect(await c1.fee() !== await c2.fee()).eq(true);
        expect(await c1.burnsRate() !== await c2.burnsRate()).eq(true);
        expect(await c1.maxMint() !== await c2.maxMint()).eq(true);
        expect(await c1.owner() === await c2.owner()).eq(true);

        const proxy = await ethers.getContractAt("Lins20Proxy", addr1) ;
        expect(await proxy.getImplementation() === impl);
    })

    it("owner", async() => {
        const {owner, factory} = await deploy();
        const limit = 1000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 1000, fee = 2;

        const tick1 = "abc";
        await factory.createLins20(tick1, limit, totalSupply, burns, fee);

        const addr1 = await factory.inscriptions(tick1)
        expect(addr1).to.exist;
        
        const contract = await ethers.getContractAt("Lins20V2", addr1) ;
        expect(await contract.owner() == owner.address).eq(true);
    })

    it("lins 20 upgrade", async () => {
        // deploy new impl
        const {owner, factory, impl, addr1} = await deploy();

        const newImpl = await ethers.deployContract("Lins20V2");
        const newAddr = await newImpl.getAddress();

        const limit = 2000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 1000, fee = 2;
        const tick1 = "new";
        await factory.createLins20(tick1, limit, totalSupply, burns, fee);

        const proxyAddr = await factory.inscriptions(tick1)
        expect(proxyAddr).to.exist;
        
        const proxy = await ethers.getContractAt("Lins20Proxy", proxyAddr) ;
        await proxy.upgradeToAndCall(newAddr, newImpl.interface.encodeFunctionData("initialize", [tick1, limit, totalSupply, burns, fee]));

        expect(await proxy.getImplementation() !== impl).eq(true);

        // unauthorized
        expect(proxy.connect(addr1.address).upgradeToAndCall(newAddr, newImpl.interface.encodeFunctionData("initialize", [tick1, limit, totalSupply, burns, fee]))).to.be.reverted;;
    })

    it("unauthorized upgrade", async() => {
        const {owner, factory, impl, addr1} = await deploy();

        const newImpl = await ethers.deployContract("Lins20V2");
        const newAddr = await newImpl.getAddress();

        const limit = 2000000000000000000000n, totalSupply = 2000000000000000000000000n, burns = 1000, fee = 2;
        const tick1 = "new";
        await factory.createLins20(tick1, limit, totalSupply, burns, fee);

        const proxyAddr = await factory.inscriptions(tick1)
        expect(proxyAddr).to.exist;
        
        const proxy = await ethers.getContractAt("Lins20Proxy", proxyAddr) ;
        // unauthorized
        expect(proxy.connect(addr1.address).upgradeToAndCall(newAddr, newImpl.interface.encodeFunctionData("initialize", [tick1, limit, totalSupply, burns, fee]))).to.be.reverted;;
    })
});