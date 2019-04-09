const contractConfig = {
    CONTRACT_ABI:  [
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "pos",
                    "type": "uint256"
                }
            ],
            "name": "all",
            "outputs": [
                {
                    "name": "lotteryId",
                    "type": "uint256"
                },
                {
                    "name": "jackpot",
                    "type": "uint256"
                },
                {
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "name": "startTime",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "lotteries",
            "outputs": [
                {
                    "name": "lotteryId",
                    "type": "uint256"
                },
                {
                    "name": "jackpot",
                    "type": "uint256"
                },
                {
                    "name": "price",
                    "type": "uint256"
                },
                {
                    "name": "startTime",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ],
    LOCALHOST_CONTRACT_ADDRESS: '0xb4b8a9ed20985e7662c1d908da2a0d0a527df6ce',
    METAMASK_CONTRACT_ADDRESS: '0xb4b8a9ed20985e7662c1d908da2a0d0a527df6ce'
};

export default contractConfig;