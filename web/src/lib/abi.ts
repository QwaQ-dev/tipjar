export const tipJarAbi = [
  { type: 'function', name: 'createJar', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'goal', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'tip', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'amount', type: 'uint256' }, { name: 'message', type: 'string' }], outputs: [] },
  { type: 'function', name: 'setGoal', stateMutability: 'nonpayable', inputs: [{ name: 'name', type: 'string' }, { name: 'goal', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'getJar', stateMutability: 'view', inputs: [{ name: 'name', type: 'string' }], outputs: [{ name: 'owner', type: 'address' }, { name: 'goal', type: 'uint256' }, { name: 'total', type: 'uint256' }] },
  { type: 'event', name: 'Tipped', anonymous: false, inputs: [{ indexed: false, name: 'name', type: 'string' }, { indexed: true, name: 'from', type: 'address' }, { indexed: true, name: 'owner', type: 'address' }, { indexed: false, name: 'amount', type: 'uint256' }, { indexed: false, name: 'message', type: 'string' }] },
] as const

export const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'value', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
] as const
