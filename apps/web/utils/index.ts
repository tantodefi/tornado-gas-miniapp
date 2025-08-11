// Helper function to format joining fee (already a string from API)
export const formatJoiningFee = (joiningFeeStr: string): string => {
  try {
    // If it's already in ETH format, return as is
    if (joiningFeeStr.includes(".")) {
      return joiningFeeStr;
    }
    // If it's in wei (large number), convert to ETH
    const wei = BigInt(joiningFeeStr);
    return (Number(wei) / 1e18).toString();
  } catch {
    return "0";
  }
};

// Helper function to format members count with anonymity rules
export const formatMembersCount = (membersCountStr: string): string => {
  try {
    const count = parseInt(membersCountStr);

    // Anonymity rules for Tornado Gas - obfuscate exact member counts
    if (count === 0) return "0";
    if (count < 5) return "2-5"; // Small pools show range
    if (count < 10) return "5-10";
    if (count < 25) return "10-25";
    if (count < 50) return "25-50";
    if (count < 100) return "50-100";
    if (count < 250) return "100-250";
    if (count < 500) return "250-500";
    if (count < 1000) return "500-1K";
    if (count < 2500) return "1K-2.5K";
    if (count < 5000) return "2.5K-5K";

    // For very large pools, show approximate ranges
    return "5K+";
  } catch {
    return "0";
  }
};

export const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch {
    return "Unknown time";
  }
};

export const getTimeAgo = (timestamp: string) => {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return "Recently";
  } catch {
    return "";
  }
};

export const getExplorerUrl = (chainId: string, txHash: string) => {
  const explorers: Record<string, string> = {
    "1": "https://etherscan.io/tx/", // Ethereum Mainnet
    "84532": "https://sepolia.basescan.org/tx/", // Base Sepolia
    "8453": "https://basescan.org/tx/", // Base Mainnet
    "137": "https://polygonscan.com/tx/", // Polygon
    "80001": "https://mumbai.polygonscan.com/tx/", // Polygon Mumbai
    "11155111": "https://sepolia.etherscan.io/tx/", // Sepolia
    "5": "https://goerli.etherscan.io/tx/", // Goerli
  };

  const baseUrl = explorers[chainId] || "https://etherscan.io/tx/";
  return `${baseUrl}${txHash}`;
};
