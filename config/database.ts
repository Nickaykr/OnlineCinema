import mysql from 'mysql2/promise';

export interface DatabaseConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;
}

const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ' ',
    database: process.env.DB_NAME || 'onlinecinema',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let connectionPool: mysql.Pool | null = null;

export const getConnection = async (): Promise<mysql.Pool> => {
    if (!connectionPool) {
        connectionPool = mysql.createPool(dbConfig);
    }
    return connectionPool;
};

export const testConnection = async (): Promise<boolean> => {
    try {
        const pool = await getConnection();
        const connection = await pool.getConnection();
        console.log('✅ MySQL подключение успешно');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Ошибка подключения к MySQL:', error);
        return false;
    }
};