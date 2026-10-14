// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipJar} from "../src/TipJar.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract TipJarTest is Test {
    TipJar internal jar;
    MockUSDC internal token;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        token = new MockUSDC();
        jar = new TipJar(address(token));
        token.mint(bob, 100e6);
        vm.prank(alice);
        jar.createJar("alice", 100e6);
    }

    function testCreateAndReadJar() public view {
        (address owner, uint256 goal, uint256 total) = jar.getJar("alice");
        assertEq(owner, alice);
        assertEq(goal, 100e6);
        assertEq(total, 0);
    }

    function testTipTransfersTokenAndUpdatesTotal() public {
        vm.startPrank(bob);
        token.approve(address(jar), 5e6);
        jar.tip("alice", 5e6, "Thanks!");
        vm.stopPrank();

        assertEq(token.balanceOf(alice), 5e6);
        assertEq(token.balanceOf(bob), 95e6);
        (, , uint256 total) = jar.getJar("alice");
        assertEq(total, 5e6);
    }

    function testDuplicateUsernameReverts() public {
        vm.prank(bob);
        vm.expectRevert(TipJar.JarAlreadyExists.selector);
        jar.createJar("alice", 1e6);
    }

    function testInvalidUsernameReverts() public {
        vm.prank(bob);
        vm.expectRevert(TipJar.InvalidUsername.selector);
        jar.createJar("Bad Name", 1e6);
    }

    function testTipBelowMinimumReverts() public {
        vm.startPrank(bob);
        token.approve(address(jar), 9_999);
        vm.expectRevert(TipJar.InvalidAmount.selector);
        jar.tip("alice", 9_999, "");
        vm.stopPrank();
    }

    function testOnlyOwnerCanUpdateGoal() public {
        vm.prank(bob);
        vm.expectRevert(TipJar.NotJarOwner.selector);
        jar.setGoal("alice", 200e6);

        vm.prank(alice);
        jar.setGoal("alice", 200e6);
        (, uint256 goal, ) = jar.getJar("alice");
        assertEq(goal, 200e6);
    }
}
