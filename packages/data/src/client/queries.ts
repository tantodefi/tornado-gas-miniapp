/**
 * GraphQL queries for the prepaid gas paymaster subgraph
 * Updated for the new network-aware schema structure
 *
 * These queries match the new subgraph schema and return network-aware data
 * with proper field selections for all entities.
 */

/**
 * ========================================
 * PAYMASTER CONTRACT QUERIES
 * ========================================
 */

/**
 * Get all paymaster contracts across all networks
 */
export const GET_ALL_PAYMASTERS = `
  query GetAllPaymasters($first: Int!, $skip: Int!) {
    paymasterContracts(first: $first, skip: $skip, orderBy: deployedAtTimestamp, orderDirection: desc) {
      id
      contractType
      address
      network
      chainId
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
 * Get paymaster contract by ID (network-prefixed)
 */
export const GET_PAYMASTER_BY_ID = `
  query GetPaymasterById($id: ID!) {
    paymasterContract(id: $id) {
      id
      contractType
      address
      network
      chainId
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
 * Get paymaster contracts by network
 */
export const GET_PAYMASTERS_BY_NETWORK = `
  query GetPaymastersByNetwork($network: String!, $first: Int!, $skip: Int!) {
    paymasterContracts(
      where: { network: $network }
      first: $first
      skip: $skip
      orderBy: deployedAtTimestamp
      orderDirection: desc
    ) {
      id
      contractType
      address
      network
      chainId
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
      network
      chainId
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
 * Get paymaster contracts by type and network
 */
export const GET_PAYMASTERS_BY_TYPE_AND_NETWORK = `
  query GetPaymastersByTypeAndNetwork($contractType: String!, $network: String!, $first: Int!, $skip: Int!) {
    paymasterContracts(
      where: { contractType: $contractType, network: $network }
      first: $first
      skip: $skip
      orderBy: deployedAtTimestamp
      orderDirection: desc
    ) {
      id
      contractType
      address
      network
      chainId
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
 * Get paymaster with related data (pools, user operations, withdrawals)
 */
export const GET_PAYMASTER_WITH_RELATED = `
  query GetPaymasterWithRelated($id: ID!, $poolsFirst: Int!, $userOpsFirst: Int!, $withdrawalsFirst: Int!) {
    paymasterContract(id: $id) {
      id
      contractType
      address
      network
      chainId
      totalUsersDeposit
      currentDeposit
      revenue
      deployedAtBlock
      deployedAtTransaction
      deployedAtTimestamp
      lastUpdatedBlock
      lastUpdatedTimestamp
      pools(first: $poolsFirst, orderBy: createdAtTimestamp, orderDirection: desc) {
        id
        poolId
        joiningFee
        memberCount
        totalDeposits
        createdAtTimestamp
      }
      userOperations(first: $userOpsFirst, orderBy: executedAtTimestamp, orderDirection: desc) {
        id
        userOpHash
        sender
        actualGasCost
        executedAtTimestamp
      }
      revenueWithdrawals(first: $withdrawalsFirst, orderBy: withdrawnAtTimestamp, orderDirection: desc) {
        id
        recipient
        amount
        withdrawnAtTimestamp
      }
    }
  }
`;

/**
 * ========================================
 * POOL QUERIES
 * ========================================
 */

/**
 * Get all pools across all networks
 */
export const GET_ALL_POOLS = `
  query GetAllPools($first: Int!, $skip: Int!) {
    pools(first: $first, skip: $skip, orderBy: createdAtTimestamp, orderDirection: desc) {
      id
      poolId
      network
      chainId
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
 * Get pools by network
 */
export const GET_POOLS_BY_NETWORK = `
  query GetPoolsByNetwork($network: String!, $first: Int!, $skip: Int!) {
    pools(
      where: { network: $network }
      first: $first
      skip: $skip
      orderBy: createdAtTimestamp
      orderDirection: desc
    ) {
      id
      poolId
      network
      chainId
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
 * Get pools by paymaster
 */
export const GET_POOLS_BY_PAYMASTER = `
  query GetPoolsByPaymaster($paymasterAddress: String!, $network: String!, $first: Int!, $skip: Int!) {
    pools(
      where: { paymaster_: { address: $paymasterAddress }, network: $network }
      first: $first
      skip: $skip
      orderBy: createdAtTimestamp
      orderDirection: desc
    ) {
      id
      poolId
      network
      chainId
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
 * Get pool details with members and merkle roots
 */
export const GET_POOL_DETAILS = `
  query GetPoolDetails($id: ID!, $membersFirst: Int!, $rootsFirst: Int!) {
    pool(id: $id) {
      id
      poolId
      network
      chainId
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
        network
      }
      members(first: $membersFirst, orderBy: addedAtTimestamp, orderDirection: desc) {
        id
        memberIndex
        identityCommitment
        merkleRootWhenAdded
        rootIndexWhenAdded
        addedAtTimestamp
        gasUsed
        nullifierUsed
        nullifier
      }
      merkleRoots(first: $rootsFirst, orderBy: createdAtTimestamp, orderDirection: desc) {
        id
        root
        rootIndex
        createdAtTimestamp
      }
    }
  }
`;

/**
 * Get pools with minimum member count
 */
export const GET_POOLS_WITH_MIN_MEMBERS = `
  query GetPoolsWithMinMembers($minMembers: BigInt!, $network: String!, $first: Int!, $skip: Int!) {
    pools(
      where: { memberCount_gte: $minMembers, network: $network }
      first: $first
      skip: $skip
      orderBy: memberCount
      orderDirection: desc
    ) {
      id
      poolId
      network
      chainId
      joiningFee
      totalDeposits
      memberCount
      currentMerkleRoot
      currentRootIndex
      rootHistoryCount
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
 * ========================================
 * POOL MEMBER QUERIES
 * ========================================
 */

/**
 * Get pool members by pool ID
 */
export const GET_POOL_MEMBERS = `
  query GetPoolMembers($poolId: String!, $network: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { pool_: { poolId: $poolId }, network: $network }
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
      network
      chainId
      pool {
        id
        poolId
        joiningFee
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
 * Get pool member by ID
 */
export const GET_POOL_MEMBER_BY_ID = `
  query GetPoolMemberById($id: ID!) {
    poolMember(id: $id) {
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
      network
      chainId
      pool {
        id
        poolId
        joiningFee
        memberCount
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
 * Get pools by identity commitment (find all pools a user belongs to)
 */
export const GET_POOLS_BY_IDENTITY = `
  query GetPoolsByIdentity($identityCommitment: BigInt!, $network: String!, $first: Int!, $skip: Int!) {
    poolMembers(
      where: { identityCommitment: $identityCommitment, network: $network }
      first: $first
      skip: $skip
      orderBy: addedAtTimestamp
      orderDirection: desc
    ) {
      id
      memberIndex
      addedAtTimestamp
      gasUsed
      nullifierUsed
      pool {
        id
        poolId
        joiningFee
        memberCount
        totalDeposits
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
 * Get pool root history
 */
export const GET_POOL_ROOT_HISTORY = `
  query GetPoolRootHistory($poolId: String!, $network: String!, $first: Int!, $skip: Int!) {
    merkleRoots(
      where: { pool_: { poolId: $poolId }, network: $network }
      first: $first
      skip: $skip
      orderBy: rootIndex
      orderDirection: desc
    ) {
      id
      root
      rootIndex
      createdAtBlock
      createdAtTransaction
      createdAtTimestamp
      network
      chainId
      pool {
        id
        poolId
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
 * Get valid root indices for a pool
 */
export const GET_VALID_ROOT_INDICES = `
  query GetValidRootIndices($poolId: String!, $network: String!, $first: Int!) {
    merkleRoots(
      where: { pool_: { poolId: $poolId }, network: $network }
      first: $first
      orderBy: rootIndex
      orderDirection: desc
    ) {
      rootIndex
      root
      createdAtTimestamp
    }
  }
`;

/**
 * Find root index for a specific root
 */
export const FIND_ROOT_INDEX = `
  query FindRootIndex($poolId: String!, $network: String!, $root: BigInt!) {
    merkleRoots(
      where: { pool_: { poolId: $poolId }, network: $network, root: $root }
      first: 1
    ) {
      rootIndex
      root
      createdAtTimestamp
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
  query GetUserOperationsByPaymaster($paymasterAddress: String!, $network: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { paymaster_: { address: $paymasterAddress }, network: $network }
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
    }
  }
`;

/**
 * Get user operations by pool
 */
export const GET_USER_OPERATIONS_BY_POOL = `
  query GetUserOperationsByPool($poolId: String!, $network: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { pool_: { poolId: $poolId }, network: $network }
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
    }
  }
`;

/**
 * Get user operations by sender
 */
export const GET_USER_OPERATIONS_BY_SENDER = `
  query GetUserOperationsBySender($sender: String!, $network: String!, $first: Int!, $skip: Int!) {
    userOperations(
      where: { sender: $sender, network: $network }
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
    }
  }
`;

/**
 * Get user operation by hash
 */
export const GET_USER_OPERATION_BY_HASH = `
  query GetUserOperationByHash($userOpHash: String!, $network: String!) {
    userOperations(
      where: { userOpHash: $userOpHash, network: $network }
      first: 1
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
        memberCount
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
  query GetRevenueWithdrawalsByPaymaster($paymasterAddress: String!, $network: String!, $first: Int!, $skip: Int!) {
    revenueWithdrawals(
      where: { paymaster_: { address: $paymasterAddress }, network: $network }
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
      network
      chainId
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
  query GetRevenueWithdrawalsByRecipient($recipient: String!, $network: String!, $first: Int!, $skip: Int!) {
    revenueWithdrawals(
      where: { recipient: $recipient, network: $network }
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
      network
      chainId
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
 * ENHANCED NULLIFIER USAGE QUERIES
 * ========================================
 */

/**
 * Get nullifier usage by paymaster
 */
export const GET_NULLIFIER_USAGE_BY_PAYMASTER = `
  query GetNullifierUsageByPaymaster($paymasterAddress: String!, $network: String!, $first: Int!, $skip: Int!) {
    nullifierUsages(
      where: { paymaster_: { address: $paymasterAddress }, network: $network }
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
      userOperation {
        id
        userOpHash
        sender
        actualGasCost
        executedAtTimestamp
      }
    }
  }
`;

/**
 * Get nullifier usage by pool
 */
export const GET_NULLIFIER_USAGE_BY_POOL = `
  query GetNullifierUsageByPool($poolId: String!, $network: String!, $first: Int!, $skip: Int!) {
    nullifierUsages(
      where: { pool_: { poolId: $poolId }, network: $network }
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
      userOperation {
        id
        userOpHash
        sender
        actualGasCost
        executedAtTimestamp
      }
    }
  }
`;

/**
 * Get nullifier usage by nullifier value
 */
export const GET_NULLIFIER_USAGE_BY_NULLIFIER = `
  query GetNullifierUsageByNullifier($nullifier: BigInt!, $network: String!) {
    nullifierUsages(
      where: { nullifier: $nullifier, network: $network }
      first: 1
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
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
        joiningFee
      }
      userOperation {
        id
        userOpHash
        sender
        actualGasCost
        executedAtTimestamp
      }
    }
  }
`;

/**
 * Get used nullifiers (OneTimeUse tracking)
 */
export const GET_USED_NULLIFIERS = `
  query GetUsedNullifiers($network: String!, $first: Int!, $skip: Int!) {
    nullifierUsages(
      where: { isUsed: true, network: $network }
      first: $first
      skip: $skip
      orderBy: firstUsedAtTimestamp
      orderDirection: desc
    ) {
      id
      nullifier
      gasUsed
      firstUsedAtTimestamp
      network
      chainId
      paymaster {
        id
        contractType
        address
      }
      pool {
        id
        poolId
      }
      userOperation {
        id
        userOpHash
        sender
      }
    }
  }
`;

/**
 * ========================================
 * ANALYTICS QUERIES
 * ========================================
 */

/**
 * Get daily pool stats
 */
export const GET_DAILY_POOL_STATS = `
  query GetDailyPoolStats($poolId: String!, $network: String!, $first: Int!, $skip: Int!) {
    dailyPoolStats(
      where: { pool_: { poolId: $poolId }, network: $network }
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
      network
      chainId
      pool {
        id
        poolId
        joiningFee
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
 * Get daily pool stats by date range
 */
export const GET_DAILY_POOL_STATS_BY_DATE_RANGE = `
  query GetDailyPoolStatsByDateRange($poolId: String!, $network: String!, $startDate: String!, $endDate: String!, $first: Int!) {
    dailyPoolStats(
      where: { 
        pool_: { poolId: $poolId },
        network: $network,
        date_gte: $startDate,
        date_lte: $endDate
      }
      first: $first
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
      network
      chainId
      pool {
        id
        poolId
      }
    }
  }
`;

/**
 * Get daily global stats
 */
export const GET_DAILY_GLOBAL_STATS = `
  query GetDailyGlobalStats($network: String!, $first: Int!, $skip: Int!) {
    dailyGlobalStats(
      where: { network: $network }
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
      network
      chainId
    }
  }
`;

/**
 * Get daily global stats by date range
 */
export const GET_DAILY_GLOBAL_STATS_BY_DATE_RANGE = `
  query GetDailyGlobalStatsByDateRange($network: String!, $startDate: String!, $endDate: String!, $first: Int!) {
    dailyGlobalStats(
      where: { 
        network: $network,
        date_gte: $startDate,
        date_lte: $endDate
      }
      first: $first
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
      network
      chainId
    }
  }
`;

/**
 * ========================================
 * NETWORK INFO QUERIES
 * ========================================
 */

/**
 * Get network information
 */
export const GET_NETWORK_INFO = `
  query GetNetworkInfo($network: String!) {
    networkInfo(id: $network) {
      id
      name
      chainId
      totalPaymasters
      totalPools
      totalMembers
      totalUserOperations
      totalGasSpent
      totalRevenue
      firstDeploymentBlock
      firstDeploymentTimestamp
      lastActivityBlock
      lastActivityTimestamp
    }
  }
`;

/**
 * Get all network information
 */
export const GET_ALL_NETWORK_INFO = `
  query GetAllNetworkInfo($first: Int!) {
    networkInfos(first: $first, orderBy: chainId) {
      id
      name
      chainId
      totalPaymasters
      totalPools
      totalMembers
      totalUserOperations
      totalGasSpent
      totalRevenue
      firstDeploymentBlock
      firstDeploymentTimestamp
      lastActivityBlock
      lastActivityTimestamp
    }
  }
`;

/**
 * ========================================
 * QUERY BUILDERS (for dynamic queries)
 * ========================================
 */

/**
 * Build dynamic pools query with custom fields and filters
 */
export function buildPoolsQuery(
  fields: string[],
  where: Record<string, any> = {},
  orderBy: string = "createdAtTimestamp",
  orderDirection: "asc" | "desc" = "desc",
  first: number = 100,
  skip: number = 0,
): string {
  const whereClause =
    Object.keys(where).length > 0
      ? `where: { ${Object.entries(where)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(", ")} }`
      : "";

  return `
    query GetPools($first: Int!, $skip: Int!) {
      pools(
        ${whereClause}
        first: $first
        skip: $skip
        orderBy: ${orderBy}
        orderDirection: ${orderDirection}
      ) {
        ${fields.join("\n        ")}
      }
    }
  `;
}

/**
 * Build dynamic paymaster query with custom fields and filters
 */
export function buildPaymasterQuery(
  fields: string[],
  where: Record<string, any> = {},
  orderBy: string = "deployedAtTimestamp",
  orderDirection: "asc" | "desc" = "desc",
  first: number = 100,
  skip: number = 0,
): string {
  const whereClause =
    Object.keys(where).length > 0
      ? `where: { ${Object.entries(where)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(", ")} }`
      : "";

  return `
    query GetPaymasterContracts($first: Int!, $skip: Int!) {
      paymasterContracts(
        ${whereClause}
        first: $first
        skip: $skip
        orderBy: ${orderBy}
        orderDirection: ${orderDirection}
      ) {
        ${fields.join("\n        ")}
      }
    }
  `;
}

/**
 * Build dynamic user operations query with custom fields and filters
 */
export function buildUserOperationsQuery(
  fields: string[],
  where: Record<string, any> = {},
  orderBy: string = "executedAtTimestamp",
  orderDirection: "asc" | "desc" = "desc",
  first: number = 100,
  skip: number = 0,
): string {
  const whereClause =
    Object.keys(where).length > 0
      ? `where: { ${Object.entries(where)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join(", ")} }`
      : "";

  return `
    query GetUserOperations($first: Int!, $skip: Int!) {
      userOperations(
        ${whereClause}
        first: $first
        skip: $skip
        orderBy: ${orderBy}
        orderDirection: ${orderDirection}
      ) {
        ${fields.join("\n        ")}
      }
    }
  `;
}
