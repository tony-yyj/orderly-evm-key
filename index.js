import crypto from 'crypto';

import * as ed from '@noble/ed25519';
import { decodeBase58, encodeBase58, solidityPackedKeccak256, AbiCoder, keccak256 } from "ethers";

global.crypto = crypto;

function retry(operation, maxRetries = 99){
    return new Promise((resolve, reject) => {
        let retries = 0;
        const retryOperationWrapper = async () => {
            try {
                const result = await operation();
                resolve(result);
            } catch (error) {
                retries++;
                console.log('-- retries', retries);
                if (retries < maxRetries) {
                    retryOperationWrapper();
                } else {
                    reject(error);
                }
            }
        };
        retryOperationWrapper();
    });
}

export async function generateOrderlyKeyPair() {
    return new Promise((resolve, reject) => {
        const privKey = ed.utils.randomPrivateKey(); // Secure random private key
        const privateKey = encodeBase58(privKey);
        if (privateKey.length !== 44) {
            reject(new Error('key error'));
        }

        ed.getPublicKeyAsync(privKey).then((pubKey) => {
            const orderlyKeyPair = {
                publicKey: `ed25519:${encodeBase58(pubKey)}`,
                privateKey: encodeBase58(privKey),
            };
            resolve(orderlyKeyPair);
        });
    });
}

export async function getNewOrderlyKeyPair() {
    try {
        return await retry(generateOrderlyKeyPair);
    } catch (error) {
        return error;
    }
}

async function getPublicKey(privateKey) {
    const secretKey = decodeBase58(privateKey).toString(16);
    const pubKey = await ed.getPublicKeyAsync(secretKey);
    return `ed25519:${ethers.encodeBase58(pubKey)}`;
}


function calculateStringHash(input) {
    return solidityPackedKeccak256(['string'], [input]);
}

function getAccountId(userAddress, brokerId) {
    const abicoder = AbiCoder.defaultAbiCoder();
    return keccak256(abicoder.encode(['address', 'bytes32'], [userAddress, calculateStringHash(brokerId)]));
};

function getAccountInfo(userAddress) {

    const accountId = getAccountId(userAddress, 'woofi_pro');
    console.log('woofi_pro', {

        userAddress,
        accountId,
    })
}

async function init() {

    for (let i = 0; i < 10; i++) {
        const orderlyKeyPair = await getNewOrderlyKeyPair();

        console.log(orderlyKeyPair);
    }


}

init().then();
