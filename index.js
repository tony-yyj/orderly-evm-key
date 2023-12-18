import crypto from 'crypto';

import * as ed from '@noble/ed25519';
import {decodeBase58, encodeBase58, solidityPackedKeccak256, AbiCoder, keccak256} from "ethers";
import { log } from 'console';
import base58 from 'base-58';

global.crypto = crypto;

async function createKeyPair() {
    const privKey = ed.utils.randomPrivateKey(); // Secure random private key
    const pubKey = await ed.getPublicKeyAsync(privKey);
    const orderlyKeyPair = {
        privKey,
        publicKey: `ed25519:${encodeBase58(pubKey)}`,
        privateKey: encodeBase58(privKey),
    };
    return orderlyKeyPair;
}

async function getPublicKey(privateKey) {
    const secretKey = decodeBase58(privateKey).toString(16);
    const pubKey = await ed.getPublicKeyAsync(secretKey);
    return `ed25519:${ethers.encodeBase58(pubKey)}`;
}


function calculateStringHash(input) {
    return solidityPackedKeccak256(['string'], [input]);
}

function getAccountId (userAddress, brokerId)  {
    const abicoder = AbiCoder.defaultAbiCoder();
    return keccak256(abicoder.encode(['address', 'bytes32'], [userAddress, calculateStringHash(brokerId)]));
};

function getAccountInfo(userAddress) {

    const accountId = getAccountId(userAddress, 'woofi_pro');
    console.log('woofi_pro',{
        
        userAddress,
        accountId,
    })
}

async function init () {

    for (let i = 0; i < 10; i ++) {
    const keyPair =         await createKeyPair();
    console.log(keyPair);
    }


}

init().then();
