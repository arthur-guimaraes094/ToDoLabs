import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, name, email, avatar_url, role 
      FROM users 
      ORDER BY role DESC, name ASC
    `;
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, avatar_url, role } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Nome e Email são obrigatórios' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Validação preventiva de e-mail duplicado
    const [existing] = await sql`
      SELECT id, name FROM users 
      WHERE LOWER(email) = ${trimmedEmail}
    `;

    if (existing) {
      return NextResponse.json(
        { error: `O e-mail "${trimmedEmail}" já está cadastrado para ${existing.name}.` }, 
        { status: 409 }
      );
    }

    const defaultAvatar = avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`;
    const userRole = role || 'DEV';

    const [newUser] = await sql`
      INSERT INTO users (name, email, avatar_url, role)
      VALUES (${trimmedName}, ${trimmedEmail}, ${defaultAvatar}, ${userRole})
      RETURNING id, name, email, avatar_url, role
    `;

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('users_email_key')) {
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado para outro desenvolvedor.' }, 
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Falha ao criar desenvolvedor no banco de dados' }, { status: 500 });
  }
}
