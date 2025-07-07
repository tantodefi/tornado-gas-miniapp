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

// Helper function to format members count (already a string from API)
export const formatMembersCount = (membersCountStr: string): string => {
  try {
    const count = parseInt(membersCountStr);
    return count.toLocaleString();
  } catch {
    return "0";
  }
};
