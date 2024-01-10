# Lins20 Inscription

Lins-20 is the first scalable smart inscription protocol, built on 
@LineaBuild
. Integrate smart contracts into inscriptions to make the index more fair and transparent, and give inscriptions more expanded functions

## Initialization

```shell
yarn
```

#### Run deploy

```shell
yarn deploy --network linea_testnet
```

#### Verify code

```shell
yarn verify --network linea_testnet 0x000The_Contract_Address
```

#### Run tests

```shell
yarn hardhat test
```

#### Run coverage

```shell
yarn hardhat coverage
```

#### Deploy Inscriptions

```js
const { ethers } = require("ethers");

const abi = [
    "function createLins20(string, uint256, uint256, uint256, uint256) returns(address)"
];
const insFactoryAddr = "0x12345..."; // lins20 address
const tick = "tick"; // tick name
const limit = 1000_000000000000000000n;  // mint limit 1000
const totalSupply = 2_000_000_000000000000000000n; // 2 million
const burnsRate = 100; // 1% , 10000 = 100%. no burning need for 0 
const fee = ethers.utils.parseEther("0"); // no mint fee

const prvKey = "0xabcd...."; // your private key
const rpcUrl = "http://xxx.rpc"; // rpc url
const signer = new Wallet(prvKey, new ethers.JsonRpcProvider(rpcUrl));
const contract = new ethers.Contract(insFactoryAddr, abi, signer);

//  deploy inscription
await contract.createLins20(tick, limit, totalSupply, burnsRate, fee);
```

#### Mint Inscriptions

```js

const tickAddr = "0x12345..."
const abi = [
    "function fee() view returns(uint256)",
    "function mint()"
];


const mintee = ethers.utils.parseEther("0"); // no mint fee
const prvKey = "0xabcd...."; // your private key
const rpcUrl = "http://xxx.rpc"; // rpc url
const signer = new Wallet(prvKey, new ethers.JsonRpcProvider(rpcUrl));

const contract = new ethers.Contract(tickAddr, abi, signer);
// mint
await contract.mint({value: mintFee});


```

#### Inscriptions transfer

```js
const { ethers } = require("ethers");
const tickAddr = "0x12345..."
const abi = [
    "function transfer(address, uint256) returns(bool)",
];


const prvKey = "0xabcd...."; // your private key
const rpcUrl = "http://xxx.rpc"; // rpc url
const signer = new Wallet(prvKey, new ethers.JsonRpcProvider(rpcUrl));

const contract = new ethers.Contract(tickAddr, abi, signer);
const toAddr = "0x12345..."; // to address
const amount = 1000_000000000000000000n; // 1000 inscriptions

// transfer inscriptions
await contract.transfer(toAddr, amount);
```
