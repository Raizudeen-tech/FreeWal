import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'expense_tracker.db';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;
  // Track readiness so UI can guard DB calls until initialized
  public get isInitialized(): boolean {
    return this.db !== null;
  }

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Prevent multiple initializations
      if (this.db !== null) {
        console.log('Database already initialized');
        return;
      }
      
      this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create Categories table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Accounts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Expenses table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        category_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        note TEXT,
        date TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better query performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_account ON expenses(account_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
    `);
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      console.error('Database not initialized! Stack trace:');
      console.trace();
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execAsync(`DROP TABLE IF EXISTS expenses;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS categories;`);
    await this.db.execAsync(`DROP TABLE IF EXISTS accounts;`);
    await this.createTables();
  }
}

export default DatabaseService.getInstance();
