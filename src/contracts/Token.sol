// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
address public minter;
  event MinterChanged(address indexed from, address to);

  function passMinterRole(address dBank) public returns(bool) {
    require(_msgSender() == minter, 'Error, only minter');
    minter = dBank;
    emit MinterChanged(_msgSender(), dBank);
    return true;
  }

  constructor() payable ERC20("Good Leek Coin", "GLC") {
    minter = _msgSender();
  }
  function mint(address account, uint256 amount) public {
    //check if msg.sender have minter role
    require(_msgSender() == minter, 'Error, only minter.');
		_mint(account, amount);
	}
}