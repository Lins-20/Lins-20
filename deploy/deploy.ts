import {DeployFunction} from 'hardhat-deploy/types'
import {HardhatRuntimeEnvironment} from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts} = hre
    const {deploy} = deployments
    const {deployer} = await getNamedAccounts()

    await deploy('Lins20Factory', {
        from: deployer,
        args: [],
        log: true,
        contract: 'Lins20Factory',
        proxy: {
            owner: deployer,
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: [],
                }
            }
        }
    })


}

export default func
func.tags = ['Lins20Factory']
