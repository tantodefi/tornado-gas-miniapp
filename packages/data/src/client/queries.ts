/**
 * GraphQL queries for the prepaid gas paymaster subgraph
 * These queries match the subgraph schema and return raw subgraph data
 */

/**
 * Get all pools where an identity is a member
 */
export const GET_POOLS_BY_IDENTITY = `
  query GetPoolsByIdentity($identityCommitment: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { identityCommitment: $identityCommitment, isActive: true }, 
      first: $first, 
      skip: $skip, 
      orderBy: joinedAt, 
      orderDirection: desc
    ) {
      id
      identityCommitment
      memberIndex
      joinedAt
      joinedAtBlock
      isActive
      pool {
        id
        poolId
        joiningFee
        merkleTreeDuration
        totalDeposits
        currentMerkleTreeRoot
        membersCount
        merkleTreeDepth
        createdAt
        createdAtBlock
        currentRootIndex
        rootHistoryCount
      }
    }
  }
`;

/**
 * Get all members of a specific pool
 */
export const GET_POOL_MEMBERS = `
  query GetPoolMembers($poolId: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { pool: $poolId, isActive: true }, 
      first: $first, 
      skip: $skip, 
      orderBy: joinedAt, 
      orderDirection: asc
    ) {
      id
      identityCommitment
      memberIndex
      joinedAt
      joinedAtBlock
      isActive
    }
  }
`;

/**
 * Get valid root indices for a pool (only roots still in the 64-root window)
 */
export const GET_VALID_ROOT_INDICES = `
  query GetValidRootIndices($poolId: String!) {
    pool(id: $poolId) {
      id
      currentRootIndex
      rootHistoryCount
      rootHistory(where: { isValid: true }, orderBy: index, orderDirection: asc) {
        index
        merkleRoot
        createdAt
        createdAtBlock
      }
    }
  }
`;

/**
 * Find the index for a specific merkle root
 */
export const FIND_ROOT_INDEX = `
  query FindRootIndex($poolId: String!, $merkleRoot: BigInt!) {
    merkleRootHistories(where: { 
      pool: $poolId, 
      merkleRoot: $merkleRoot, 
      isValid: true 
    }) {
      index
      merkleRoot
      createdAt
      isValid
    }
  }
`;

/**
 * Get pool root history with pagination
 */
export const GET_POOL_ROOT_HISTORY = `
  query GetPoolRootHistory($poolId: String!, $first: Int!, $skip: Int!) {
    pool(id: $poolId) {
      id
      currentRootIndex
      rootHistoryCount
      rootHistory(
        first: $first, 
        skip: $skip, 
        orderBy: createdAt, 
        orderDirection: desc
      ) {
        index
        merkleRoot
        createdAt
        createdAtBlock
        isValid
        transactionHash
      }
    }
  }
`;

/**
 * Get all pools with basic fields (for listing)
 */
export const GET_ALL_POOLS = `
  query GetAllPools($first: Int!, $skip: Int!) {
    pools(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
      id
      poolId
      joiningFee
      membersCount
      createdAt
    }
  }
`;

/**
 * Get detailed pool information with optional members
 * @param includeMembers - Whether to include members list (default: false)
 * @param memberLimit - Maximum members to fetch when includeMembers=true (default: 100)
 */
export const GET_POOL_DETAILS = `
  query GetPoolDetails($poolId: String!, $includeMembers: Boolean = false, $memberLimit: Int = 100) {
    pool(id: $poolId) {
      id
      poolId
      joiningFee
      merkleTreeDuration
      totalDeposits
      currentMerkleTreeRoot
      membersCount
      merkleTreeDepth
      createdAt
      createdAtBlock
      currentRootIndex
      rootHistoryCount
      
      members(first: $memberLimit, where: { isActive: true }, orderBy: joinedAt, orderDirection: desc) @include(if: $includeMembers) {
        id
        identityCommitment
        memberIndex
        joinedAt
        joinedAtBlock
        isActive
      }
      
      rootHistory(where: { isValid: true }, orderBy: index, orderDirection: asc) {
        index
        merkleRoot
        createdAt
        createdAtBlock
        isValid
        transactionHash
      }
    }
  }
`;

/**
 * Get pools with custom field selection (dynamic query building)
 */
export const buildPoolsQuery = (fields: string[]): string => {
  const fieldsList = fields.join("\n            ");
  return `
    query GetPoolsWithFields($first: Int!, $skip: Int!) {
      pools(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
        ${fieldsList}
      }
    }
  `;
};
