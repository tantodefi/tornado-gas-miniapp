import { QueryConfig } from "../types.js";

/**
 * Base query builder with common functionality
 *
 * This abstract class provides the foundation for all entity-specific query builders.
 * It implements the fluent interface pattern for building GraphQL queries.
 *
 * @template TEntity - The entity type being queried (Pool, PoolMember, etc.)
 * @template TFields - Union type of available fields for the entity
 * @template TWhereInput - Type for where condition input for the entity
 */
export abstract class BaseQueryBuilder<
  TEntity,
  TFields extends string,
  TWhereInput,
> {
  protected config: QueryConfig = {};
  protected selectedFields?: TFields[];

  /**
   * Select specific fields to fetch
   *
   * @param fields - Fields to include in the query result
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.select("poolId", "joiningFee", "membersCount")
   * ```
   */
  select(...fields: TFields[]): this {
    this.selectedFields = fields;
    return this;
  }

  /**
   * Add where conditions for filtering
   *
   * @param conditions - Object containing field filters
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.where({
   *   membersCount: { gte: "10" },
   *   joiningFee: { lte: "1000000000000000000" }
   * })
   * ```
   */
  where(conditions: TWhereInput): this {
    this.config.where = { ...this.config.where, ...conditions };
    return this;
  }

  /**
   * Set pagination limit (number of items to fetch)
   *
   * @param count - Maximum number of items to return
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.limit(50) // Get up to 50 items
   * ```
   */
  limit(count: number): this {
    if (count < 0) {
      throw new Error("Limit must be non-negative");
    }
    if (count > 1000) {
      throw new Error("Limit cannot exceed 1000 items");
    }
    this.config.first = count;
    return this;
  }

  /**
   * Set pagination skip (number of items to skip)
   *
   * @param count - Number of items to skip
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.skip(20) // Skip first 20 items
   * ```
   */
  skip(count: number): this {
    if (count < 0) {
      throw new Error("Skip must be non-negative");
    }
    this.config.skip = count;
    return this;
  }

  /**
   * Set order direction
   *
   * @param direction - "asc" for ascending, "desc" for descending
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.orderBy("createdAt").direction("desc")
   * ```
   */
  direction(direction: "asc" | "desc"): this {
    this.config.orderDirection = direction;
    return this;
  }

  /**
   * Execute the query and return results
   * Must be implemented by concrete classes
   *
   * @returns Promise resolving to array of entities
   */
  abstract execute(): Promise<TEntity[]>;

  /**
   * Execute the query and return serialized results
   * Must be implemented by concrete classes to use appropriate serializers
   *
   * @returns Promise resolving to array of serialized entities (SerializedPool[], SerializedPoolMember[], etc.)
   *
   * @example
   * ```typescript
   * const serializedPools = await query.pools()
   *   .withMinMembers(10)
   *   .limit(20)
   *   .executeAndSerialize();
   * ```
   */
  abstract executeAndSerialize(): Promise<any[]>;

  /**
   * Get the first result that matches the query
   *
   * @returns Promise resolving to first entity or null if none found
   *
   * @example
   * ```typescript
   * const pool = await query.pools().byId("1").first();
   * ```
   */
  async first(): Promise<TEntity | null> {
    const originalLimit = this.config.first;
    this.config.first = 1;

    try {
      const results = await this.execute();
      return results.length > 0 ? (results[0] ?? null) : null;
    } finally {
      // Restore original limit
      if (originalLimit !== undefined) {
        this.config.first = originalLimit;
      } else {
        delete this.config.first;
      }
    }
  }

  /**
   * Get the first result serialized
   *
   * @returns Promise resolving to first serialized entity or null
   *
   * @example
   * ```typescript
   * const serializedPool = await query.pools().byId("1").firstSerialized();
   * ```
   */
  async firstSerialized(): Promise<any | null> {
    const result = await this.first();
    if (result === null) {
      return null;
    }

    // Execute with limit 1 and get the first serialized result
    const tempQuery = this.clone();
    tempQuery.config = { ...tempQuery.config, first: 1 };
    const serializedArray = await tempQuery.executeAndSerialize();
    return serializedArray[0] || null;
  }

  /**
   * Count total results matching the query
   * Subclasses can override for more efficient counting.
   *
   * @returns Promise resolving to count of matching entities
   *
   * @example
   * ```typescript
   * const poolCount = await query
   *   .where({ membersCount: { gte: "10" } })
   *   .count();
   * ```
   */
  async count(): Promise<number> {
    const originalConfig = { ...this.config };

    // Remove pagination for counting
    delete this.config.first;
    delete this.config.skip;

    try {
      const results = await this.execute();
      return results.length;
    } finally {
      // Restore original config
      this.config = originalConfig;
    }
  }

  /**
   * Check if any results exist for the current query
   *
   * @returns Promise resolving to true if any results exist
   *
   * @example
   * ```typescript
   * const hasLargePools = await query
   *   .where({ membersCount: { gte: "100" } })
   *   .exists();
   * ```
   */
  async exists(): Promise<boolean> {
    const result = await this.first();
    return result !== null;
  }

  /**
   * Get current query configuration (for debugging or advanced usage)
   *
   * @returns Current query configuration including selected fields
   *
   * @example
   * ```typescript
   * const config = query.getConfig();
   * console.log("Query config:", config);
   * ```
   */
  getConfig(): QueryConfig & { fields?: TFields[] } {
    return {
      ...this.config,
      fields: this.selectedFields,
    };
  }

  /**
   * Reset the query builder to initial state
   *
   * @returns this for method chaining
   *
   * @example
   * ```typescript
   * query.reset().where({ poolId: { eq: "1" } }) // Start fresh
   * ```
   */
  reset(): this {
    this.config = {};
    this.selectedFields = undefined;
    return this;
  }

  /**
   * Clone the current query builder with the same configuration
   * Useful for creating variations of a base query
   *
   * @returns New query builder instance with same configuration
   */
  abstract clone(): BaseQueryBuilder<TEntity, TFields, TWhereInput>;
}
