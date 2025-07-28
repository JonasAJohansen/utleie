import { sql } from '@vercel/postgres'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Get user's quick response templates
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = `
      SELECT 
        id,
        category,
        template_text,
        usage_count,
        is_system_template,
        created_at
      FROM quick_response_templates 
      WHERE (user_id = $1 OR is_system_template = true)
    `
    const params = [userId]

    if (category) {
      query += ` AND category = $2`
      params.push(category)
    }

    query += ` ORDER BY 
      is_system_template DESC, 
      usage_count DESC, 
      created_at DESC
    `

    const { rows } = await sql.query(query, params)

    // Group templates by category
    const groupedTemplates = rows.reduce((acc: any, template: any) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    }, {})

    return NextResponse.json({
      templates: rows,
      grouped: groupedTemplates,
      categories: Object.keys(groupedTemplates)
    })
  } catch (error) {
    console.error('[TEMPLATES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Create a new quick response template
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { category, templateText } = body

    if (!category || !templateText) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Check if user already has this exact template
    const { rows: existingRows } = await sql.query(`
      SELECT id FROM quick_response_templates 
      WHERE user_id = $1 AND template_text = $2
    `, [userId, templateText])

    if (existingRows.length > 0) {
      return new NextResponse('Template already exists', { status: 409 })
    }

    const templateId = uuidv4()
    const { rows } = await sql.query(`
      INSERT INTO quick_response_templates (
        id, user_id, category, template_text
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [templateId, userId, category, templateText])

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('[TEMPLATES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// Delete a user's template
export async function DELETE(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return new NextResponse('Template ID required', { status: 400 })
    }

    const { rows } = await sql.query(`
      DELETE FROM quick_response_templates 
      WHERE id = $1 AND user_id = $2 AND is_system_template = false
      RETURNING id
    `, [templateId, userId])

    if (rows.length === 0) {
      return new NextResponse('Template not found or cannot be deleted', { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TEMPLATES_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 