import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { sanitizeText } from '@/lib/validation';

export async function GET() {
  try {
    const activities = await sql`
      SELECT id, action_type, description, entity_type, entity_id, metadata, created_at
      FROM activities
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Erro ao buscar histórico de atividades:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar log de atividades' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action_type, description, entity_type = 'SYSTEM', entity_id = null, metadata = {} } = body;

    if (!action_type || !description) {
      return NextResponse.json(
        { error: 'action_type e description são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanDescription = sanitizeText(description);
    const cleanActionType = sanitizeText(action_type);

    const [newActivity] = await sql`
      INSERT INTO activities (action_type, description, entity_type, entity_id, metadata)
      VALUES (${cleanActionType}, ${cleanDescription}, ${entity_type}, ${entity_id ? entity_id : null}, ${JSON.stringify(metadata)}::jsonb)
      RETURNING id, action_type, description, entity_type, entity_id, metadata, created_at;
    `;

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar atividade:', error);
    return NextResponse.json(
      { error: 'Erro ao gravar no histórico de atividades' },
      { status: 500 }
    );
  }
}
