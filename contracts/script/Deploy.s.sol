// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {TipJar} from "../src/TipJar.sol";

contract Deploy is Script {
    function run() external returns (TipJar deployed) {
        address usdc = vm.envAddress("USDC_ADDRESS");
        vm.startBroadcast();
        deployed = new TipJar(usdc);
        vm.stopBroadcast();
    }
}
