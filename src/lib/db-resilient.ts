import { neon, NeonQueryFunction, Pool } from '@neondatabase/serverless';

interface DatabaseConfig {
  primary: string;
  secondary: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ResilientDatabase {
  private primaryPool: Pool;
  private secondaryPool: Pool;
  private currentPool: Pool;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private healthCheckInterval: number = 30000;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;
  private isPrimaryHealthy: boolean = true;
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes default

  constructor(config: DatabaseConfig) {
    this.primaryPool = new Pool({ 
      connectionString: config.primary,
      disableWarningInBrowsers: true
    });
    this.secondaryPool = new Pool({ 
      connectionString: config.secondary,
      disableWarningInBrowsers: true
    });
    this.currentPool = this.primaryPool;
    
    this.startHealthCheck();
  }

  private startHealthCheck() {
    setInterval(async () => {
      await this.checkDatabaseHealth();
    }, this.healthCheckInterval);
  }

  private async checkDatabaseHealth(): Promise<void> {
    try {
      await this.primaryPool.query('SELECT 1');
      if (!this.isPrimaryHealthy) {
        console.log('✓ Primary database recovered, switching back');
        this.isPrimaryHealthy = true;
        this.currentPool = this.primaryPool;
      }
    } catch (error) {
      console.error('Primary database health check failed:', error);
      if (this.isPrimaryHealthy) {
        console.log('⚠️ Primary database unhealthy, switching to secondary');
        this.isPrimaryHealthy = false;
        this.currentPool = this.secondaryPool;
      }
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Retry attempt ${this.maxRetries - retries + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        
        if (!this.isPrimaryHealthy && this.currentPool === this.primaryPool) {
          this.currentPool = this.secondaryPool;
        }
        
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private getCacheKey(query: string, params?: any[]): string {
    return `${query}_${JSON.stringify(params || [])}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache<T>(key: string, data: T, ttl: number = this.cacheTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private invalidateCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async query<T>(
    queryStr: string,
    params: any[] = [],
    options: { cache?: boolean; ttl?: number } = {}
  ): Promise<T> {
    const cacheKey = this.getCacheKey(queryStr, params);
    
    if (options.cache !== false) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await this.executeWithRetry(async () => {
      const queryResult = await this.currentPool.query(queryStr, params);
      return queryResult.rows as T;
    });

    if (options.cache !== false) {
      this.setCache(cacheKey, result, options.ttl);
    }

    return result;
  }

  async transaction<T>(operations: (client: any) => Promise<T>): Promise<T> {
    const client = await this.currentPool.connect();
    try {
      await client.query('BEGIN');
      const result = await operations(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  clearCache(pattern?: string): void {
    this.invalidateCache(pattern);
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      isPrimaryHealthy: this.isPrimaryHealthy,
      currentDatabase: this.isPrimaryHealthy ? 'primary' : 'secondary'
    };
  }
}

const dbConfig: DatabaseConfig = {
  primary: import.meta.env.VITE_DATABASE_URL,
  secondary: import.meta.env.VITE_SECONDARY_DB_URL
};

export const resilientDb = new ResilientDatabase(dbConfig);