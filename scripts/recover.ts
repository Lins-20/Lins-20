// migrate LINS script
 
import fs from "fs";
import { parse } from "csv-parse";
import { ethers } from "hardhat";

const loadCSV = async () => {
    const records = [];
    const parser = fs
        .createReadStream(`${__dirname}/../resources/alien.csv`)
        .pipe(parse({
        }));
    for await (const record of parser) {
        records.push(record);
    }
    return records;
};

const address = "0x753cf76D04b0f91069551c8Ab9D7ef5cD7a7e9b6";  // new lins20 address
const size = 500;

async function action(data: string[]) {
    const contract = await ethers.getContractAt("Lins20V2", address);
    const res: any = await contract.recover(data, {nonce: 64});
    const receipt = await res.wait();
    return receipt.status === 1;
}

(async () => {
    const records = await loadCSV();
    const address = records.slice(1).map(s => s[0])
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
