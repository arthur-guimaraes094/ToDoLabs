import { neon } from '@neondatabase/serverless';

// Inicializa a conexão com o Neon usando a variável DATABASE_URL
const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BGMEsH1P8bok@ep-empty-poetry-aw0obo7a-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require');

export default sql;
