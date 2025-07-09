//file:prepaid-gas-website/apps/web/types/index.ts
/**
 * Central type exports for the web application
 * REFACTORED: Updated exports to match new structure
 */

// Pool-related types
export type {
  Pool,
  PoolMember,
  FilterState,
  ActivityType,
  ActivityItem,
  BaseActivityItem,
  MemberAddedActivity,
  TransactionActivity,
  PoolWithActivity,
  ActivityOptions,
} from "./pool";

// Card-related types - UPDATED: Removed old interfaces
export type {
  PoolCard,
  CardIdentity,
  CardStatus,
  CardPoolInfo, // NEW: Replaces CardPoolDetails
  GenerateIdentityResult,
  MnemonicWord,
  CardStats,
  CreateCardParams,
  UpdateCardParams,
  CardFilterOptions,
  CardBackupData,
  CardSecurityCheck,
  CardTransaction,
  CardUsageStats,
} from "./card";

// Payment-related types
export type {
  PaymentPool,
  PaymentData,
  PaymentDetails,
  PaymentError,
  PaymentCallbacks,
  PaymentState,
  PaymentProvider,
  PaymentManagerConfig,
  PaymentButtonProps,
  DaimoPaymentEvent,
  RainbowTransactionEvent,
  WagmiError,
  DaimoError,
  PaymentProviderConfig,
  PaymentTransaction,
  PaymentAnalytics,
  PaymentFeeEstimate,
  PaymentMethod,
} from "./payment";

// Component prop types - UPDATED: Removed old, added new
export type {
  PageHeaderProps,
  FilterBarProps,
  CardsTableProps, // NEW: Replaces CardItemProps
  CardReceiptProps, // NEW: Common receipt component
  PoolCardProps,
  EnhancedPoolCardProps,
  PoolActivitySectionProps,
  ModalProps,
  PaymentModalProps,
  LoadingSkeletonProps,
  ErrorStateProps,
  InfoRowProps,
  PoolOverviewProps,
  TechnicalDetailsSectionProps,
  MembersSectionProps,
  PoolMembersListProps,
  FeatureCardProps,
  ProcessStepProps,
  StatItemProps,
  IdentityGenerationFlowProps,
  ToastProps,
  FormFieldProps,
  SearchInputProps,
  PaginationProps,
  CardDashboardProps,
  PaymentStateDisplayProps,
  ButtonVariant,
  ButtonSize,
  IconVariant,
  ModalSize,
  ThemeConfig,
} from "./components";

// Storage-related types
export type {
  StorageCard,
  IndexedDBConfig,
  StorageResult,
  StorageStats,
  BackupData,
  ImportValidationResult,
  MigrationConfig,
  EncryptionConfig,
  StorageQueryOptions,
  StorageTransaction,
  CleanupConfig,
  StorageMonitoring,
  SyncStatus as StorageSyncStatus,
  StorageEventType,
  StorageEvent,
  CacheConfig as StorageCacheConfig,
  ValidationRules,
  SecurityConfig,
  RecoveryOptions,
} from "./storage";
