// migrate LINS script
 
import fs from "fs";
import { parse } from "csv-parse";
import { ethers } from "hardhat";

const loadCSV = async () => {
    const records = [];
    const parser = fs
        .createReadStream(`${__dirname}/../resources/holders.csv`)
        .pipe(parse({
        }));
    for await (const record of parser) {
        records.push(record);
    }
    return records;
};

const address = "0xbe5589c967CCEC8dE72236e140A56bbabD794FDc";  // new lins20 address
const size = 1000;

async function action(data: string[]) {
    const contract = await ethers.getContractAt("Lins20V2", address);
    const res: any = await contract.recover(data);
    const receipt = await res.wait();
    return receipt.status === 1;
}

(async () => {
    const records = await loadCSV();
    const address = records.slice(1).map(s => s[0])
    console.log(address.slice(0, 100));
    let page = 0;
    while (1) {
        let start = page * size;
        let end = start + size > address.length ? address.length : start + size;
        const data = address.slice(page * size, (page + 1) * size);
        if (await action(data)) {
            page++;
            console.log("recover ok", page);
        } else {
            console.log("recover fail", page)
            break;
        }
        if (end == address.length) {
            console.log("task over");
            break;
        }
    }
})();
