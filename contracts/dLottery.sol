pragma solidity ^0.5.7;

contract DLottery {


Lottery[] public lotteries;

constructor() public{

    Lottery memory lott1 = Lottery(1,2,3,4);
    Lottery memory lott2 = Lottery(5,6,7,8);

    lott1.price = 2;
    lott2.price = 50;
    lott1.startTime = 1520553600;
    lott2.startTime = 1520553600;

    lotteries.push(lott1);
    lotteries.push(lott2);

}

function all(uint pos) public view returns(uint lotteryId, uint jackpot, uint price, uint startTime){
Lottery storage lt = lotteries[pos];
return (lt.lotteryId, lt.jackpot, lt.price, lt.startTime);
}

struct Lottery {
     uint lotteryId;
     uint jackpot;
     uint price;
     uint startTime;
 }

 struct Ticket {
     Lottery lottery;
     uint[] numbers;
     User owner;
 }


 struct User {
     address userAddress;
     string username;
     Ticket[] tickets;
 }
}