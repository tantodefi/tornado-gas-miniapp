//file:prepaid-gas-website/apps/web/types/components.ts
/**
 * UI component prop and styling type definitions
 * Updated to use new field names from data package and PoolWithActivity
 */

import type { ReactNode } from "react";
import type { Pool, PoolMember, FilterState, PoolWithActivity } from "./pool";
import type { PoolCard, CardStats } from "./card";
import type { PaymentPool, PaymentState } from "./payment";

/**
 * Button variant options
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

/**
 * Button size options
 */
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/**
 * Icon variant for feature cards
 */
export type IconVariant = "blue" | "purple" | "pink";

/**
 * Modal size options
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Page header component props
 */
export interface PageHeaderProps {
  backText?: string;
  onBack?: () => void;
  rightContent?: ReactNode;
  className?: string;
}

/**
 * Filter bar component props
 */
export interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  poolCount: number;
  isLoading?: boolean;
}

/**
 * Card item component props for different card types
 */
export interface CardItemProps {
  card: PoolCard;
  index: number;
  onTopUp: () => void;
  onDelete: () => void;
  onShowMnemonic: () => void;
  showMnemonic: boolean;
  onHideMnemonic: () => void;
}

/**
 * Pool card component props
 */
export interface PoolCardProps {
  pool: Pool;
  onCardClick?: (poolId: string) => void;
  onViewDetails?: (poolId: string) => void;
}

/**
 * Enhanced pool card props for detail pages
 * Updated to use PoolWithActivity for pools with activity data
 */
export interface EnhancedPoolCardProps {
  pool: PoolWithActivity; // Updated to support activity data
  onJoin: () => void;
  isJoining: boolean;
  showPayment: boolean;
}

/**
 * Pool Activity Section Props - NEW
 * Updated to use PoolWithActivity specifically for activity display
 */
export interface PoolActivitySectionProps {
  pool?: PoolWithActivity; // Updated to use PoolWithActivity
  isLoading?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  showCloseButton?: boolean;
}

/**
 * Payment modal specific props
 */
export interface PaymentModalProps {
  isVisible: boolean;
  paymentPool: PaymentPool;
  generatedCard: PoolCard;
  poolId: string;
  onPaymentSuccess: (activatedCard: PoolCard) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

/**
 * Loading skeleton props
 */
export interface LoadingSkeletonProps {
  onBack: () => void;
}

/**
 * Error state component props
 */
export interface ErrorStateProps {
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
}

/**
 * Info row component props for detail displays
 */
export interface InfoRowProps {
  label: string;
  value: string;
  valueClass?: string;
  copyable?: string;
}

/**
 * Pool overview section props
 * Updated to use new field names from data package
 */
export interface PoolOverviewProps {
  pool: {
    joiningFee: string;
    totalDeposits: string;
    memberCount: string; // Updated from membersCount
    createdAtTimestamp: string; // Updated from createdAt
    network: string; // Simplified from network object
  };
}

/**
 * Technical details section props
 * Updated to use new field names from data package
 */
export interface TechnicalDetailsSectionProps {
  pool: {
    poolId: string;
    rootHistoryCount: number;
    currentRootIndex: number;
    memberCount: string; // Updated from membersCount
    createdAtBlock: string;
    createdAtTimestamp: string; // Updated from createdAt
    network: string; // Simplified from network object
    chainId: string;
    // Removed deprecated fields: merkleTreeDuration, merkleTreeDepth
  };
}

/**
 * Members section component props
 * Updated to use new field names from data package
 */
export interface MembersSectionProps {
  pool: {
    poolId: string;
    memberCount: string; // Updated from membersCount
    createdAtTimestamp: string; // Updated from createdAt
  };
  members: PoolMember[];
  showMembers: boolean;
  memberLimit: number;
  isLoading: boolean;
  onToggleMembers: () => void;
  onMemberLimitChange: (limit: number) => void;
}

/**
 * Pool members list props
 */
export interface PoolMembersListProps {
  members: PoolMember[];
  isLoading?: boolean;
  poolId: string;
}

/**
 * Feature card props for landing page
 */
export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  iconVariant: IconVariant;
}

/**
 * Process step props for landing page
 */
export interface ProcessStepProps {
  stepNumber: number;
  icon: string;
  title: string;
  description: string;
}

/**
 * Stat item props for statistics display
 */
export interface StatItemProps {
  number: string;
  label: string;
}

/**
 * Success screen props
 */
export interface SuccessScreenProps {
  card: PoolCard;
  identity: any; // GenerateIdentityResult
  pool: {
    poolId: string;
    joiningFee: string;
    network: string; // Simplified from network object
  };
  onComplete: () => void;
}

/**
 * Identity generation flow props
 */
export interface IdentityGenerationFlowProps {
  pool: Pool;
  onComplete: (card: PoolCard) => void;
  onCancel: () => void;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Form field props
 */
export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

/**
 * Search input props
 */
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Pagination component props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
}

/**
 * Card dashboard props
 */
export interface CardDashboardProps {
  stats: CardStats;
  isLoading: boolean;
}

/**
 * Payment state display props
 */
export interface PaymentStateDisplayProps {
  state: PaymentState;
  error?: string;
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
}
