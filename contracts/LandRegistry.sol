// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LandRegistry {
    struct Land {
        uint256 id;
        string location;
        uint256 area;
        address owner;
    }

    mapping(uint256 => Land) public lands;

    event LandRegistered(uint256 indexed id, string location, uint256 area, address indexed owner);
    event TransferOwnership(uint256 indexed id, address indexed oldOwner, address indexed newOwner);

    function registerLand(uint256 _id, string memory _location, uint256 _area) public {
        require(lands[_id].owner == address(0), "Land already registered");
        lands[_id] = Land(_id, _location, _area, msg.sender);
        emit LandRegistered(_id, _location, _area, msg.sender);
    }

    function transferLand(uint256 _id, address _newOwner) public {
        require(lands[_id].owner == msg.sender, "You are not the owner");
        address oldOwner = lands[_id].owner;
        lands[_id].owner = _newOwner;
        emit TransferOwnership(_id, oldOwner, _newOwner);
    }
}
