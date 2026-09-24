/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-service-role-key') &&
  !supabaseKey.includes('your-anon-key')
);

let serverSupabaseClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) {
    return null;
  }

  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serverSupabaseClient;
}

/**
 * Upload file to Supabase Storage if configured
 */
export async function uploadToSupabaseStorage(
  bucket: 'college-images' | 'college-videos' | 'college-documents' | 'student-documents',
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string | null> {
  const client = getServerSupabase();
  if (!client) return null;

  try {
    const filePath = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data, error } = await client.storage.from(bucket).upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return null;
    }

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload to Supabase storage:', err);
    return null;
  }
}
