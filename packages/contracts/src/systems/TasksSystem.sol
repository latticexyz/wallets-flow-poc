// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import {System} from "@latticexyz/world/src/System.sol";
import {Tasks, TasksData} from "../codegen/index.sol";

// TODO: remove later
function toHexString(uint256 value, uint256 length) returns (string memory) {
    bytes16 HEX_DIGITS = "0123456789abcdef";
    uint256 localValue = value;
    bytes memory buffer = new bytes(2 * length + 2);
    buffer[0] = "0";
    buffer[1] = "x";
    for (uint256 i = 2 * length + 1; i > 1; --i) {
        buffer[i] = HEX_DIGITS[localValue & 0xf];
        localValue >>= 4;
    }
    require(localValue == 0, "StringsInsufficientHexLength")
    return string(buffer);
}

function toHexString(address addr) returns (string memory) {
    uint8 ADDRESS_LENGTH = 20;
    return toHexString(uint256(uint160(addr)), ADDRESS_LENGTH);
}

contract TasksSystem is System {
    function addTask(string memory description) public returns (bytes32 id) {
        id = keccak256(abi.encode(block.prevrandao, _msgSender(), description));
        Tasks.set(
            id,
            TasksData({
                description: string(abi.encodePacked(description, " by ", toHexString(_msgSender()))),
                createdAt: block.timestamp,
                completedAt: 0
            })
        );
    }

    function completeTask(bytes32 id) public {
        Tasks.setCompletedAt(id, block.timestamp);
    }

    function resetTask(bytes32 id) public {
        Tasks.setCompletedAt(id, 0);
    }

    function deleteTask(bytes32 id) public {
        Tasks.deleteRecord(id);
    }
}
