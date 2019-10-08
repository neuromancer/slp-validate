/***************************************************************************************
 * 
 *  Example 5: Validate using gs++ server.
 * 
 *  Instructions:
 *      (1) - Set bitcoind RPC user, password, and URL.
 *      (2) - Optional: set custom txid.
 * 
 * ************************************************************************************/

import { ValidatorType1, Crypto } from '../index';
import { GraphSearchClient } from 'grpc-slp-graphsearch-node';

const txid = "ecaaf0a4de119a59a440089c99a2c103791dbd06086472ff8ff4229c5cd7cc4f";

(async function() {
    console.time("SLP-VALIDATE-W-GRAPH-SEARCH");

    // perform graph search
    let gs = new GraphSearchClient();
    let dag = new Map<string, Buffer>();
    (await gs.graphSearchFor(txid)).getTxdataList_asU8().forEach(txn => { 
        let txnBuf = Buffer.from(txn);
        let id = Crypto.hash256(txnBuf).toString('hex');
        dag.set(id, txnBuf);
    });

    // for some reason I need to add the root txn manaually...?
    dag.set('ecaaf0a4de119a59a440089c99a2c103791dbd06086472ff8ff4229c5cd7cc4f', Buffer.from("0200000002c5e0cfc7cd70d40049aaa863ab11b805a538e682c86fe4df7604319d5ca13ee1020000006a4730440220352be81ca5cad5939f80e51536f87d076f967e68427f9ae6fc7bb5f5adda555b02201c8a660291ebc8bd5d0879e8038c6447803359856cbbacd4aa5a3ece0235c4ca412102b83dd22da6ee9c80430986fff4c79ca19d3a0d0c19ab0deef40c22d5c01bc528ffffffffc5e0cfc7cd70d40049aaa863ab11b805a538e682c86fe4df7604319d5ca13ee1030000006b483045022100e62e00835b2f00254e3f31b2366ce23ba95942cbba9a58da759ad8cb801872e1022010b3793926d2cdcb4361e07c15ddfc0ea68a2441c5707c6fe930e83b05caf9fc412102b83dd22da6ee9c80430986fff4c79ca19d3a0d0c19ab0deef40c22d5c01bc528ffffffff040000000000000000406a04534c500001010453454e44204de69e374a8ed21cbddd47f2338cc0f479dc58daa2bbe11cd604ca488eca0ddf080000000566d3e8000800005813952fa64422020000000000001976a91493e7259ea2793070db1e5220d128ea336c825d5988ac22020000000000001976a9146e4b28bf365599f2bbd93cf6341417e8ad2dbd9488ace6401300000000001976a9146e4b28bf365599f2bbd93cf6341417e8ad2dbd9488ac00000000", 'hex'));
    
    // create SLP validator
    let getRawTransaction =  async (id: string) => {
        if(dag.has(id)) return dag.get(id)!;
        else return Buffer.alloc(60);
    }
    const slpValidator = new ValidatorType1({ getRawTransaction });

    console.log("Validating:", txid);
    console.log("This may take a several seconds...");
    let isValid = await slpValidator.isValidSlpTxid({ txid });
    console.log("Final Result:", isValid);
    console.log("WARNING: THIS VALIDATION METHOD COMES WITH NO BURN PROTECTION.")
    console.timeEnd("SLP-VALIDATE-W-GRAPH-SEARCH");
})();

