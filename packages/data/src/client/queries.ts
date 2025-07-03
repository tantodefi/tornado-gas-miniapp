/**
 * GraphQL queries for the prepaid gas paymaster subgraph
 * These queries match the new subgraph schema and return raw subgraph data
 * Updated for new PaymasterContract-based structure
 */

/**
 * ========================================
 * PAYMASTER CONTRACT QUERIES
 * ========================================
 */

/**
 * Get all paymaster contracts
 */
export const GET_ALL_PAYMASTERS = `
  query GetAllPaymasters($first: Int!, $skip: Int!) {
    paymasterContracts(first: $first, skip: $skip, orderBy: deployedAtTimestamp, orderDirection: desc) {
      id
      contractType
      address
      totalUsersDeposit
      currentDeposit
      revenue
      deployedAtBlock
      deployedAtTransaction
      deployedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
  }
`;

/**
 * Get paymaster contract by address
 */
export const GET_PAYMASTER_BY_ADDRESS = `
  query GetPaymasterByAddress($address: String!) {
    paymasterContract(id: $address) {
      id
      contractType
      address
      totalUsersDeposit
      currentDeposit
      revenue
      deployedAtBlock
      deployedAtTransaction
      deployedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
  }
`;

/**
 * Get paymaster contracts by type
 */
export const GET_PAYMASTERS_BY_TYPE = `
  query GetPaymastersByType($contractType: String!, $first: Int!, $skip: Int!) {
    paymasterContracts(
      where: { contractType: $contractType }
      first: $first
      skip: $skip
      orderBy: deployedAtTimestamp
      orderDirection: desc
    ) {
      id
      contractType
      address
      totalUsersDeposit
      currentDeposit
      revenue
      deployedAtBlock
      deployedAtTransaction
      deployedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
  }
`;

/**
 * ========================================
 * POOL QUERIES
 * ========================================
 */

/**
 * Get all pools with basic fields (for listing)
 */
export const GET_ALL_POOLS = `
  query GetAllPools($first: Int!, $skip: Int!) {
    pools(first: $first, skip: $skip, orderBy: createdAtTimestamp, orderDirection: desc) {
      id
      poolId
      joiningFee
      memberCount
      createdAtTimestamp
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * Get pools by paymaster address
 */
export const GET_POOLS_BY_PAYMASTER = `
  query GetPoolsByPaymaster($paymasterAddress: String!, $first: Int!, $skip: Int!) {
    pools(
      where: { paymaster: $paymasterAddress }
      first: $first
      skip: $skip
      orderBy: createdAtTimestamp
      orderDirection: desc
    ) {
      id
      poolId
      joiningFee
      totalDeposits
      memberCount
      currentMerkleRoot
      currentRootIndex
      rootHistoryCount
      createdAtBlock
      createdAtTransaction
      createdAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * Get detailed pool information with optional members
 */
export const GET_POOL_DETAILS = `
  query GetPoolDetails($poolId: String!, $includeMembers: Boolean = false, $memberLimit: Int = 100) {
    pool(id: $poolId) {
      id
      poolId
      joiningFee
      totalDeposits
      memberCount
      currentMerkleRoot
      currentRootIndex
      rootHistoryCount
      createdAtBlock
      createdAtTransaction
      createdAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
      paymaster {
        id
        contractType
        address
      }
      
      members(first: $memberLimit, orderBy: addedAtTimestamp, orderDirection: desc) @include(if: $includeMembers) {
        id
        memberIndex
        identityCommitment
        merkleRootWhenAdded
        rootIndexWhenAdded
        addedAtBlock
        addedAtTransaction
        addedAtTimestamp
        gasUsed
        nullifierUsed
        nullifier
      }
      
      merkleRoots(orderBy: rootIndex, orderDirection: asc) {
        id
        root
        rootIndex
        createdAtBlock
        createdAtTransaction
        createdAtTimestamp
      }
    }
  }
`;

/**
 * ========================================
 * POOL MEMBER QUERIES
 * ========================================
 */

/**
 * Get all members of a specific pool
 */
export const GET_POOL_MEMBERS = `
  query GetPoolMembers($poolId: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: addedAtTimestamp
      orderDirection: asc
    ) {
      id
      memberIndex
      identityCommitment
      merkleRootWhenAdded
      rootIndexWhenAdded
      addedAtBlock
      addedAtTransaction
      addedAtTimestamp
      gasUsed
      nullifierUsed
      nullifier
    }
  }
`;

/**
 * Get all pools where an identity is a member
 */
export const GET_POOLS_BY_IDENTITY = `
  query GetPoolsByIdentity($identityCommitment: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { identityCommitment: $identityCommitment }
      first: $first
      skip: $skip
      orderBy: addedAtTimestamp
      orderDirection: desc
    ) {
      id
      memberIndex
      identityCommitment
      merkleRootWhenAdded
      rootIndexWhenAdded
      addedAtBlock
      addedAtTransaction
      addedAtTimestamp
      gasUsed
      nullifierUsed
      nullifier
      pool {
        id
        poolId
        joiningFee
        totalDeposits
        memberCount
        currentMerkleRoot
        currentRootIndex
        rootHistoryCount
        createdAtBlock
        createdAtTransaction
        createdAtTimestamp
        paymaster {
          id
          contractType
          address
        }
      }
    }
  }
`;

/**
 * ========================================
 * MERKLE ROOT QUERIES
 * ========================================
 */

/**
 * Get merkle root history for a pool
 */
export const GET_POOL_ROOT_HISTORY = `
  query GetPoolRootHistory($poolId: String!, $first: Int!, $skip: Int!) {
    merkleRoots(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: createdAtTimestamp
      orderDirection: desc
    ) {
      id
      root
      rootIndex
      createdAtBlock
      createdAtTransaction
      createdAtTimestamp
    }
  }
`;

/**
 * Find the index for a specific merkle root
 */
export const FIND_ROOT_INDEX = `
  query FindRootIndex($poolId: String!, $merkleRoot: BigInt!) {
    merkleRoots(where: { 
      pool: $poolId, 
      root: $merkleRoot
    }) {
      id
      root
      rootIndex
      createdAtTimestamp
    }
  }
`;

/**
 * Get valid root indices for a pool (helper query)
 */
export const GET_VALID_ROOT_INDICES = `
  query GetValidRootIndices($poolId: String!) {
    pool(id: $poolId) {
      id
      currentRootIndex
      rootHistoryCount
      merkleRoots(orderBy: rootIndex, orderDirection: asc) {
        id
        root
        rootIndex
        createdAtTimestamp
        createdAtBlock
      }
    }
  }
`;

/**
 * ========================================
 * USER OPERATION QUERIES
 * ========================================
 */

/**
 * Get user operations by paymaster
 */
export const GET_USER_OPERATIONS_BY_PAYMASTER = `
  query GetUserOperationsByPaymaster($paymasterAddress: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { paymaster: $paymasterAddress }
      first: $first
      skip: $skip
      orderBy: executedAtTimestamp
      orderDirection: desc
    ) {
      id
      userOpHash
      sender
      actualGasCost
      nullifier
      executedAtBlock
      executedAtTransaction
      executedAtTimestamp
      gasPrice
      totalGasUsed
      pool {
        id
        poolId
      }
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * Get user operations by pool
 */
export const GET_USER_OPERATIONS_BY_POOL = `
  query GetUserOperationsByPool($poolId: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: executedAtTimestamp
      orderDirection: desc
    ) {
      id
      userOpHash
      sender
      actualGasCost
      nullifier
      executedAtBlock
      executedAtTransaction
      executedAtTimestamp
      gasPrice
      totalGasUsed
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * Get user operations by sender
 */
export const GET_USER_OPERATIONS_BY_SENDER = `
  query GetUserOperationsBySender($sender: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { sender: $sender }
      first: $first
      skip: $skip
      orderBy: executedAtTimestamp
      orderDirection: desc
    ) {
      id
      userOpHash
      sender
      actualGasCost
      nullifier
      executedAtBlock
      executedAtTransaction
      executedAtTimestamp
      gasPrice
      totalGasUsed
      pool {
        id
        poolId
      }
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * ========================================
 * REVENUE WITHDRAWAL QUERIES
 * ========================================
 */

/**
 * Get revenue withdrawals by paymaster
 */
export const GET_REVENUE_WITHDRAWALS_BY_PAYMASTER = `
  query GetRevenueWithdrawalsByPaymaster($paymasterAddress: String!, $first: Int!, $skip: Int!) {
    revenueWithdrawals(
      where: { paymaster: $paymasterAddress }
      first: $first
      skip: $skip
      orderBy: withdrawnAtTimestamp
      orderDirection: desc
    ) {
      id
      recipient
      amount
      withdrawnAtBlock
      withdrawnAtTransaction
      withdrawnAtTimestamp
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * Get revenue withdrawals by recipient
 */
export const GET_REVENUE_WITHDRAWALS_BY_RECIPIENT = `
  query GetRevenueWithdrawalsByRecipient($recipient: String!, $first: Int!, $skip: Int!) {
    revenueWithdrawals(
      where: { recipient: $recipient }
      first: $first
      skip: $skip
      orderBy: withdrawnAtTimestamp
      orderDirection: desc
    ) {
      id
      recipient
      amount
      withdrawnAtBlock
      withdrawnAtTransaction
      withdrawnAtTimestamp
      paymaster {
        id
        contractType
        address
      }
    }
  }
`;

/**
 * ========================================
 * NULLIFIER USAGE QUERIES
 * ========================================
 */

/**
 * Get nullifier usage by paymaster
 */
export const GET_NULLIFIER_USAGE_BY_PAYMASTER = `
  query GetNullifierUsageByPaymaster($paymasterAddress: String!, $first: Int!, $skip: Int!) {
    nullifierUsages(
      where: { paymaster: $paymasterAddress }
      first: $first
      skip: $skip
      orderBy: lastUpdatedTimestamp
      orderDirection: desc
    ) {
      id
      nullifier
      isUsed
      gasUsed
      firstUsedAtBlock
      firstUsedAtTransaction
      firstUsedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
      pool {
        id
        poolId
      }
      paymaster {
        id
        contractType
        address
      }
      userOperation {
        id
        userOpHash
        sender
        actualGasCost
      }
    }
  }
`;

/**
 * Get nullifier usage by pool
 */
export const GET_NULLIFIER_USAGE_BY_POOL = `
  query GetNullifierUsageByPool($poolId: String!, $first: Int!, $skip: Int!) {
    nullifierUsages(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: lastUpdatedTimestamp
      orderDirection: desc
    ) {
      id
      nullifier
      isUsed
      gasUsed
      firstUsedAtBlock
      firstUsedAtTransaction
      firstUsedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
      paymaster {
        id
        contractType
        address
      }
      userOperation {
        id
        userOpHash
        sender
        actualGasCost
      }
    }
  }
`;

/**
 * ========================================
 * DAILY STATISTICS QUERIES
 * ========================================
 */

/**
 * Get daily pool statistics
 */
export const GET_DAILY_POOL_STATS = `
  query GetDailyPoolStats($poolId: String!, $first: Int!, $skip: Int!) {
    dailyPoolStats(
      where: { pool: $poolId }
      first: $first
      skip: $skip
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      newMembers
      userOperations
      gasSpent
      revenueGenerated
      totalMembers
      totalDeposits
      pool {
        id
        poolId
      }
    }
  }
`;

/**
 * Get daily pool statistics by date range
 */
export const GET_DAILY_POOL_STATS_BY_DATE_RANGE = `
  query GetDailyPoolStatsByDateRange($poolId: String!, $startDate: String!, $endDate: String!, $first: Int!, $skip: Int!) {
    dailyPoolStats(
      where: { 
        pool: $poolId,
        date_gte: $startDate,
        date_lte: $endDate
      }
      first: $first
      skip: $skip
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      newMembers
      userOperations
      gasSpent
      revenueGenerated
      totalMembers
      totalDeposits
      pool {
        id
        poolId
      }
    }
  }
`;

/**
 * Get daily global statistics
 */
export const GET_DAILY_GLOBAL_STATS = `
  query GetDailyGlobalStats($first: Int!, $skip: Int!) {
    dailyGlobalStats(
      first: $first
      skip: $skip
      orderBy: date
      orderDirection: desc
    ) {
      id
      date
      newPools
      totalNewMembers
      totalUserOperations
      totalGasSpent
      totalRevenueGenerated
      totalActivePools
      totalMembers
    }
  }
`;

/**
 * Get daily global statistics by date range
 */
export const GET_DAILY_GLOBAL_STATS_BY_DATE_RANGE = `
  query GetDailyGlobalStatsByDateRange($startDate: String!, $endDate: String!, $first: Int!, $skip: Int!) {
    dailyGlobalStats(
      where: { 
        date_gte: $startDate,
        date_lte: $endDate
      }
      first: $first
      skip: $skip
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      newPools
      totalNewMembers
      totalUserOperations
      totalGasSpent
      totalRevenueGenerated
      totalActivePools
      totalMembers
    }
  }
`;

/**
 * ========================================
 * UTILITY FUNCTIONS
 * ========================================
 */

/**
 * Get pools with custom field selection (dynamic query building)
 */
export const buildPoolsQuery = (fields: string[]): string => {
  const fieldsList = fields.join("\n            ");
  return `
    query GetPoolsWithFields($first: Int!, $skip: Int!) {
      pools(first: $first, skip: $skip, orderBy: createdAtTimestamp, orderDirection: desc) {
        ${fieldsList}
      }
    }
  `;
};

/**
 * Get paymaster contracts with custom field selection
 */
export const buildPaymasterQuery = (fields: string[]): string => {
  const fieldsList = fields.join("\n            ");
  return `
    query GetPaymastersWithFields($first: Int!, $skip: Int!) {
      paymasterContracts(first: $first, skip: $skip, orderBy: deployedAtTimestamp, orderDirection: desc) {
        ${fieldsList}
      }
    }
  `;
};

/**
 * Get user operations with custom field selection
 */
export const buildUserOperationsQuery = (fields: string[]): string => {
  const fieldsList = fields.join("\n            ");
  return `
    query GetUserOperationsWithFields($first: Int!, $skip: Int!) {
      userOperations(first: $first, skip: $skip, orderBy: executedAtTimestamp, orderDirection: desc) {
        ${fieldsList}
      }
    }
  `;
};
