import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { UserRole } from "@/lib/types";
import { checkAuth } from "@/lib/auth/utils";

/**
 * API endpoint to clone an existing persona/assistant
 * 
 * POST /api/persona/:id/clone
 * 
 * Clones all assistant properties including:
 * - Basic information (name, description)
 * - Prompts
 * - Tools
 * - Document sets
 * - Settings and configuration
 * 
 * @returns The newly created assistant object
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const personaId = parseInt(params.id);
    if (isNaN(personaId)) {
      return NextResponse.json({ error: "Invalid persona ID" }, { status: 400 });
    }

    // Get the original persona using raw SQL
    const [originalPersona] = await db.execute<{
      id: number;
      name: string;
      description: string;
      owner_id: string;
      is_public: boolean;
      is_default_persona: boolean;
      icon_color: string;
      icon_shape: string;
      num_chunks: number;
      search_start_date: string;
      llm_relevance_filter: boolean;
      llm_model_provider_override: string;
      llm_model_version_override: string;
      prompts: any[];
      document_sets: any[];
      tools: any[];
      starter_messages: any[];
    }>(sql`
      SELECT p.*, 
        (SELECT json_agg(pr.*) FROM prompts pr WHERE pr.persona_id = p.id) as prompts,
        (SELECT json_agg(ds.*) FROM persona_document_sets pds 
          JOIN document_sets ds ON pds.document_set_id = ds.id 
          WHERE pds.persona_id = p.id) as document_sets,
        (SELECT json_agg(t.*) FROM persona_tools pt 
          JOIN tools t ON pt.tool_id = t.id 
          WHERE pt.persona_id = p.id) as tools,
        (SELECT json_agg(sm.*) FROM starter_messages sm WHERE sm.persona_id = p.id) as starter_messages
      FROM personas p
      WHERE p.id = ${personaId}
    `);

    if (!originalPersona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Check if user has access to this persona
    const isAdmin = auth.role === UserRole.ADMIN;
    const isOwner = originalPersona.owner_id === auth.userId;
    const isPublic = originalPersona.is_public;

    if (!isAdmin && !isOwner && !isPublic) {
      // Check if user is in persona mappings
      const [userMapping] = await db.execute<{ count: number }>(sql`
        SELECT COUNT(*) as count FROM assistant_mappings
        WHERE persona_id = ${personaId} AND user_id = ${auth.userId}
      `);

      if (!userMapping || userMapping.count === 0) {
        return NextResponse.json({ error: "Unauthorized access to this persona" }, { status: 403 });
      }
    }

    // Create a new persona with the same data
    const [newPersona] = await db.execute<{ id: number }>(sql`
      INSERT INTO personas (
        name, description, owner_id, is_public, is_default_persona,
        icon_color, icon_shape, num_chunks, search_start_date,
        llm_relevance_filter, llm_model_provider_override, llm_model_version_override,
        created_at, updated_at
      ) VALUES (
        ${`${originalPersona.name} - Copy`}, ${originalPersona.description}, ${auth.userId}, 
        false, false, ${originalPersona.icon_color}, ${originalPersona.icon_shape},
        ${originalPersona.num_chunks}, ${originalPersona.search_start_date},
        ${originalPersona.llm_relevance_filter}, ${originalPersona.llm_model_provider_override},
        ${originalPersona.llm_model_version_override}, NOW(), NOW()
      )
      RETURNING id
    `);

    if (!newPersona) {
      return NextResponse.json({ error: "Failed to create new persona" }, { status: 500 });
    }

    const newPersonaId = newPersona.id;

    // Clone prompts
    if (originalPersona.prompts && originalPersona.prompts.length > 0) {
      for (const prompt of originalPersona.prompts) {
        await db.execute(sql`
          INSERT INTO prompts (
            persona_id, system_prompt, task_prompt, datetime_aware, include_citations
          ) VALUES (
            ${newPersonaId}, ${prompt.system_prompt}, ${prompt.task_prompt}, 
            ${prompt.datetime_aware}, ${prompt.include_citations}
          )
        `);
      }
    }

    // Clone document set connections
    if (originalPersona.document_sets && originalPersona.document_sets.length > 0) {
      for (const ds of originalPersona.document_sets) {
        await db.execute(sql`
          INSERT INTO persona_document_sets (persona_id, document_set_id)
          VALUES (${newPersonaId}, ${ds.id})
        `);
      }
    }

    // Clone tool connections
    if (originalPersona.tools && originalPersona.tools.length > 0) {
      for (const tool of originalPersona.tools) {
        await db.execute(sql`
          INSERT INTO persona_tools (persona_id, tool_id)
          VALUES (${newPersonaId}, ${tool.id})
        `);
      }
    }

    // Clone starter messages
    if (originalPersona.starter_messages && originalPersona.starter_messages.length > 0) {
      for (const msg of originalPersona.starter_messages) {
        await db.execute(sql`
          INSERT INTO starter_messages (persona_id, message, name)
          VALUES (${newPersonaId}, ${msg.message}, ${msg.name})
        `);
      }
    }

    // Add the current user to the assistant mappings
    await db.execute(sql`
      INSERT INTO assistant_mappings (persona_id, user_id)
      VALUES (${newPersonaId}, ${auth.userId})
    `);

    // Return the newly created assistant
    const [newlyCreatedPersona] = await db.execute<{
      id: number;
      name: string;
      description: string;
      prompts: any[];
      document_sets: any[];
      tools: any[];
      starter_messages: any[];
      owner: any;
    }>(sql`
      SELECT p.*, 
        (SELECT json_agg(pr.*) FROM prompts pr WHERE pr.persona_id = p.id) as prompts,
        (SELECT json_agg(ds.*) FROM persona_document_sets pds 
          JOIN document_sets ds ON pds.document_set_id = ds.id 
          WHERE pds.persona_id = p.id) as document_sets,
        (SELECT json_agg(t.*) FROM persona_tools pt 
          JOIN tools t ON pt.tool_id = t.id 
          WHERE pt.persona_id = p.id) as tools,
        (SELECT json_agg(sm.*) FROM starter_messages sm WHERE sm.persona_id = p.id) as starter_messages,
        (SELECT json_agg(u.*) FROM users u WHERE u.id = p.owner_id) as owner
      FROM personas p
      WHERE p.id = ${newPersonaId}
    `);

    return NextResponse.json(newlyCreatedPersona);
  } catch (error) {
    console.error("Error cloning persona:", error);
    return NextResponse.json(
      { error: "Failed to clone persona" },
      { status: 500 }
    );
  }
}