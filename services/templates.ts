import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { WorkoutTemplate, TemplateExercise } from '../types';

/**
 * Database template row type
 */
interface DBTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  muscle_focus: string[];
  exercises: unknown;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  last_performed: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Convert Supabase Template to app WorkoutTemplate
 */
function toWorkoutTemplate(dbTemplate: DBTemplate): WorkoutTemplate {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description || undefined,
    muscleFocus: dbTemplate.muscle_focus,
    exercises: dbTemplate.exercises as TemplateExercise[],
    duration: dbTemplate.duration,
    difficulty: dbTemplate.difficulty,
    lastPerformed: dbTemplate.last_performed || undefined,
  };
}

/**
 * Convert app WorkoutTemplate to Supabase Template insert
 */
function toTemplateInsert(template: WorkoutTemplate, userId: string) {
  return {
    id: template.id,
    user_id: userId,
    name: template.name,
    description: template.description || null,
    muscle_focus: template.muscleFocus,
    exercises: JSON.parse(JSON.stringify(template.exercises)),
    duration: template.duration,
    difficulty: template.difficulty,
    last_performed: template.lastPerformed || null,
  };
}

/**
 * Fetch all templates for the current user
 */
export async function fetchTemplates(userId: string): Promise<WorkoutTemplate[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    return [];
  }

  return (data as DBTemplate[] || []).map(toWorkoutTemplate);
}

/**
 * Create a new template
 */
export async function createTemplate(
  template: WorkoutTemplate,
  userId: string
): Promise<WorkoutTemplate | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const insert = toTemplateInsert(template, userId);

  const { data, error } = await supabase
    .from('templates')
    .insert(insert as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    return null;
  }

  return toWorkoutTemplate(data as DBTemplate);
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<WorkoutTemplate>
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description || null;
  if (updates.muscleFocus !== undefined) dbUpdates.muscle_focus = updates.muscleFocus;
  if (updates.exercises !== undefined) dbUpdates.exercises = JSON.parse(JSON.stringify(updates.exercises));
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.difficulty !== undefined) dbUpdates.difficulty = updates.difficulty;
  if (updates.lastPerformed !== undefined) dbUpdates.last_performed = updates.lastPerformed || null;

  const { error } = await supabase
    .from('templates')
    .update(dbUpdates as any)
    .eq('id', templateId);

  if (error) {
    console.error('Error updating template:', error);
    return false;
  }

  return true;
}

/**
 * Delete a template
 */
export async function deleteTemplateFromDB(templateId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    return false;
  }

  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId);

  if (error) {
    console.error('Error deleting template:', error);
    return false;
  }

  return true;
}

/**
 * Upsert template (create or update)
 */
export async function upsertTemplate(
  template: WorkoutTemplate,
  userId: string
): Promise<WorkoutTemplate | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const insert = toTemplateInsert(template, userId);

  const { data, error } = await supabase
    .from('templates')
    .upsert(insert as any, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting template:', error);
    return null;
  }

  return toWorkoutTemplate(data as DBTemplate);
}
