// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TipJar {
    using SafeERC20 for IERC20;

    uint256 public constant MIN_TIP = 10_000; // 0.01 token when the token has 6 decimals.
    uint256 public constant MAX_MESSAGE_LENGTH = 280;
    uint256 public constant MAX_USERNAME_LENGTH = 20;
    uint256 public constant MIN_USERNAME_LENGTH = 3;

    IERC20 public immutable usdc;

    struct Jar {
        address owner;
        uint256 goal;
        uint256 total;
    }

    mapping(bytes32 => Jar) private jars;

    error InvalidAddress();
    error InvalidUsername();
    error JarAlreadyExists();
    error JarNotFound();
    error NotJarOwner();
    error InvalidAmount();
    error MessageTooLong();
    error TokenTransferFailed();

    event JarCreated(string name, address indexed owner, uint256 goal);
    event JarGoalUpdated(string name, uint256 goal);
    event Tipped(
        string name,
        address indexed from,
        address indexed owner,
        uint256 amount,
        string message
    );

    constructor(address usdcAddress) {
        if (usdcAddress == address(0)) revert InvalidAddress();
        usdc = IERC20(usdcAddress);
    }

    function createJar(string calldata name, uint256 goal) external {
        bytes32 key = _usernameKey(name);
        if (jars[key].owner != address(0)) revert JarAlreadyExists();

        jars[key] = Jar({owner: msg.sender, goal: goal, total: 0});
        emit JarCreated(name, msg.sender, goal);
    }

    function tip(string calldata name, uint256 amount, string calldata message) external {
        bytes32 key = _usernameKey(name);
        Jar storage jar = jars[key];
        if (jar.owner == address(0)) revert JarNotFound();
        if (amount < MIN_TIP) revert InvalidAmount();
        if (bytes(message).length > MAX_MESSAGE_LENGTH) revert MessageTooLong();

        // Effects before interactions; SafeERC20 reverts the whole transaction on failure.
        jar.total += amount;
        usdc.safeTransferFrom(msg.sender, jar.owner, amount);

        emit Tipped(name, msg.sender, jar.owner, amount, message);
    }

    function setGoal(string calldata name, uint256 goal) external {
        bytes32 key = _usernameKey(name);
        Jar storage jar = jars[key];
        if (jar.owner == address(0)) revert JarNotFound();
        if (jar.owner != msg.sender) revert NotJarOwner();

        jar.goal = goal;
        emit JarGoalUpdated(name, goal);
    }

    function getJar(string calldata name) external view returns (address owner, uint256 goal, uint256 total) {
        Jar storage jar = jars[_usernameKey(name)];
        return (jar.owner, jar.goal, jar.total);
    }

    function _usernameKey(string calldata name) private pure returns (bytes32) {
        bytes memory value = bytes(name);
        if (value.length < MIN_USERNAME_LENGTH || value.length > MAX_USERNAME_LENGTH) {
            revert InvalidUsername();
        }

        for (uint256 i; i < value.length; ++i) {
            bytes1 c = value[i];
            bool valid = (c >= 0x61 && c <= 0x7a) ||
                (c >= 0x30 && c <= 0x39) ||
                c == 0x5f ||
                c == 0x2d;
            if (!valid) revert InvalidUsername();
        }

        return keccak256(value);
    }
}
