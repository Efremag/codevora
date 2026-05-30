import mysql from 'mysql2/promise'
import type { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'codevora_link',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
})

type QueryParams = (string | number | boolean | null | Buffer)[]

export async function query<T = RowDataPacket[]>(
  sql: string,
  params?: QueryParams
): Promise<T> {
  const [rows] = await pool.execute(sql, params)
  return rows as T
}

export type { RowDataPacket, OkPacket, ResultSetHeader }
export default pool
