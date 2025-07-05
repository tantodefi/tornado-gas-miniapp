import { SubgraphClient } from "../../client/subgraph-client.js";
import { convertBigIntsToStrings } from "../../transformers/index.js";
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
export class BaseQueryBuilder<
  TEntity,
  TFields extends string,
  TWhereInput,
  TOrderBy extends string,
> {
  protected config: QueryConfig<TWhereInput, TOrderBy> = {};
  protected entityName: string; // e.g., "pools", "paymasterContracts"
  protected defaultOrderBy: TOrderBy;
  protected defaultOrderDirection: "asc" | "desc";

  constructor(
    protected client: SubgraphClient,
    entityName: string,
    defaultOrderBy: TOrderBy,
    defaultOrderDirection: "asc" | "desc" = "desc",
  ) {
    this.entityName = entityName;
    this.defaultOrderBy = defaultOrderBy;
    this.defaultOrderDirection = defaultOrderDirection;
    this.config.orderBy = defaultOrderBy;
    this.config.orderDirection = defaultOrderDirection;
  }

  /**
   * Select specific fields to be returned.
   * @param fields - Array of field names to select.
   * @returns The query builder instance for chaining.
   */
  select(fields: TFields[]): this {
    this.config.selectedFields = fields;
    return this;
  }

  /**
   * Add a generic 'where' clause to the query.
   * This method is intended for advanced usage or when specific filter methods are not available.
   * @param where - An object representing the GraphQL 'where' input.
   * @returns The query builder instance for chaining.
   */
  where(where: Partial<TWhereInput>): this {
    this.config.where = { ...this.config.where, ...where };
    return this;
  }

  /**
   * Limit the number of results.
   * @param limit - Maximum number of results.
   * @returns The query builder instance for chaining.
   */
  limit(limit: number): this {
    this.config.first = limit;
    return this;
  }

  /**
   * Skip a number of results.
   * @param skip - Number of results to skip.
   * @returns The query builder instance for chaining.
   */
  skip(skip: number): this {
    this.config.skip = skip;
    return this;
  }

  /**
   * Set the ordering for the results.
   * @param orderBy - Field to order by.
   * @param orderDirection - Order direction ("asc" or "desc").
   * @returns The query builder instance for chaining.
   */
  orderBy(orderBy: TOrderBy, orderDirection: "asc" | "desc" = "desc"): this {
    this.config.orderBy = orderBy;
    this.config.orderDirection = orderDirection;
    return this;
  }

  /**
   * Execute the query and return all results.
   * @returns Promise resolving to an array of TEntity.
   */
  async execute(): Promise<TEntity[]> {
    const query = this.buildDynamicQuery();
    const variables = this.buildVariables();
    const result = await this.client.executeQuery<{ [key: string]: TEntity[] }>(
      query,
      variables,
    );

    return result[this.entityName] || [];
  }

  /**
   * Execute the query, serialize BigInts to strings, and return all results.
   * This method assumes a `serialize` function is available (e.g., from `transforms/index.ts`).
   * For demonstration, I'll provide a basic `bigIntToString` transform.
   * @returns Promise resolving to an array of serialized TEntity.
   */
  async executeAndSerialize(): Promise<any[]> {
    // Return type is `any[]` as serialized type is generic
    const rawResults = await this.execute();
    // In a real scenario, you'd import and use your specific serializer here.
    // Example: return rawResults.map(item => serializePool(item));
    // For now, a generic BigInt to string conversion:
    return rawResults.map((item) =>
      convertBigIntsToStrings(item as Record<string, any>),
    );
  }

  /**
   * Execute the query and return the first result.
   * @returns Promise resolving to the first TEntity or null.
   */
  async first(): Promise<TEntity | null> {
    const originalFirst = this.config.first;
    this.config.first = 1;

    const results = await this.execute();

    this.config.first = originalFirst; // Restore original limit

    return results.length > 0 ? (results[0] ?? null) : null;
  }

  /**
   * Execute the query and check if any results exist.
   * @returns Promise resolving to true if any results exist.
   */
  async exists(): Promise<boolean> {
    const result = await this.first();
    return result !== null;
  }

  /**
   * Execute the query and return the count of results.
   * Note: This fetches all results and counts them, which might be inefficient for large datasets.
   * For a true count, a separate `count` query would be ideal if supported by the subgraph.
   * @returns Promise resolving to the count of matching entities.
   */
  async count(): Promise<number> {
    const results = await this.execute();
    return results.length;
  }

  /**
   * Clone the current query builder instance.
   * @returns A new instance of the query builder with the same configuration.
   */
  clone(): this {
    const cloned = new (this.constructor as any)(
      this.client,
      this.entityName,
      this.defaultOrderBy,
      this.defaultOrderDirection,
    );
    // Deep clone config.where to avoid reference issues
    cloned.config = {
      ...this.config,
      where: this.config.where ? { ...this.config.where } : undefined,
      selectedFields: this.config.selectedFields
        ? [...this.config.selectedFields]
        : undefined,
    };
    return cloned;
  }

  /**
   * Builds the GraphQL query string dynamically based on the current configuration.
   * @private
   * @returns GraphQL query string.
   */
  protected buildDynamicQuery(): string {
    const fields =
      this.config.selectedFields && this.config.selectedFields.length > 0
        ? this.config.selectedFields.join("\n        ")
        : this.getDefaultFields(); // Use default fields if none selected

    const whereClause = this.buildWhereClauseString();
    const orderByClause = this.config.orderBy
      ? `orderBy: ${this.config.orderBy}`
      : "";
    const orderDirectionClause = this.config.orderDirection
      ? `orderDirection: ${this.config.orderDirection}`
      : "";

    const args = [
      whereClause,
      orderByClause,
      orderDirectionClause,
      "first: $first",
      "skip: $skip",
    ]
      .filter(Boolean)
      .join(", ");

    return `
      query Get${this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1)}($first: Int!, $skip: Int!, $network: String, $id: ID, $poolId: String, $paymasterAddress: String, $minMembers: BigInt, $maxMembers: BigInt, $minDeposits: BigInt, $maxDeposits: BigInt, $minJoiningFee: BigInt, $maxJoiningFee: BigInt, $createdAfter: BigInt, $createdBefore: BigInt, $hasMembers: Boolean, $isActive: Boolean, $root: BigInt, $identityCommitment: BigInt, $sender: String, $userOpHash: String, $recipient: String, $nullifier: BigInt, $startDate: String, $endDate: String) {
        ${this.entityName}(
          ${args}
        ) {
          ${fields}
        }
      }
    `;
  }

  /**
   * Builds the variables object for the GraphQL query.
   * @private
   * @returns Variables object.
   */
  protected buildVariables(): Record<string, any> {
    const variables: Record<string, any> = {
      first: this.config.first || 100,
      skip: this.config.skip || 0,
    };

    // Convert BigInts in the where clause to strings for GraphQL variables
    if (this.config.where) {
      Object.assign(
        variables,
        convertBigIntsToStrings(this.config.where as Record<string, any>),
      );
    }

    return variables;
  }

  /**
   * Generates the GraphQL 'where' clause string from the config.
   * @private
   * @returns GraphQL 'where' clause string.
   */
  protected buildWhereClauseString(): string {
    if (!this.config.where || Object.keys(this.config.where).length === 0) {
      return "";
    }

    const whereEntries = Object.entries(this.config.where).map(
      ([key, value]) => {
        // Handle nested objects for relationships (e.g., paymaster_: { address: $paymasterAddress })
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          const nestedEntries = Object.entries(value)
            .map(([nestedKey, nestedValue]) => {
              // Assume nested values are simple or variables
              if (
                typeof nestedValue === "string" &&
                nestedValue.startsWith("$")
              ) {
                return `${nestedKey}: ${nestedValue}`;
              }
              return `${nestedKey}: ${JSON.stringify(nestedValue)}`;
            })
            .join(", ");
          return `${key}: { ${nestedEntries} }`;
        }
        // For direct variables, use the variable name
        if (typeof value === "string" && value.startsWith("$")) {
          return `${key}: ${value}`;
        }
        // For direct values, stringify them
        return `${key}: ${JSON.stringify(value)}`;
      },
    );

    return `where: { ${whereEntries.join(", ")} }`;
  }

  /**
   * Returns the default fields for the entity if no specific fields are selected.
   * This method should be overridden by derived classes.
   * @protected
   * @returns Default GraphQL fields string.
   */
  protected getDefaultFields(): string {
    // This should be overridden by specific builders
    return "id";
  }
}
