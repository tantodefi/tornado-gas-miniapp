/**
 * Central type exports for the web application
 * Single source of truth for all type definitions
 */

// Pool-related types
export type {
  Pool,
  DetailedPool,
  PoolMember,
  PoolNetwork,
  FilterState,
  PoolOverviewData,
  PoolTechnicalData,
  MemberData,
  MerkleRootHistory,
  PoolStats,
  PoolQueryOptions,
  PoolSearchOptions,
} from "./pool";

// Card-related types
export type {
  PoolCard,
  CardIdentity,
  CardStatus,
  CardPoolDetails,
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

// API-related types
export type {
  ApiResponse,
  ApiError,
  PaginationOptions,
  PaginatedResponse,
  QueryResult,
  RequestMetadata,
  PoolQueryParams,
  PoolDetailsParams,
  ApiClientConfig,
  RequestOptions,
  CacheConfig,
  ValidationError,
  RateLimitInfo,
  HealthCheckResponse,
  ApiAnalytics,
  JobStatus,
  WebSocketMessage,
  SubscriptionConfig,
  SyncStatus,
} from "./api";

// Component prop types
export type {
  PageHeaderProps,
  FilterBarProps,
  CardItemProps,
  PoolCardProps,
  EnhancedPoolCardProps,
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
  SuccessScreenProps,
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
