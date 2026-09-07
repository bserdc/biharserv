/**
 * Notice Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { NoticeCircular } from '../../src/types';

export class NoticeRepository {
  /**
   * Find all published notices (public endpoint)
   */
  static async findPublished(): Promise<NoticeCircular[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching published notices:', error);
        return [];
      }

      return (data || []) as NoticeCircular[];
    } catch (err) {
      console.error('❌ Failed to fetch notices:', err);
      return [];
    }
  }

  /**
   * Find all notices (admin only)
   */
  static async findAll(): Promise<NoticeCircular[]> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching notices:', error);
        return [];
      }

      return (data || []) as NoticeCircular[];
    } catch (err) {
      console.error('❌ Failed to fetch notices:', err);
      return [];
    }
  }

  /**
   * Search notices by title or content
   */
  static async search(query: string, publishedOnly: boolean = true): Promise<NoticeCircular[]> {
    try {
      let searchQuery = supabase
        .from('notices')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

      if (publishedOnly) {
        searchQuery = searchQuery.eq('is_published', true);
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching notices:', error);
        return [];
      }

      return (data || []) as NoticeCircular[];
    } catch (err) {
      console.error('❌ Notice search failed:', err);
      return [];
    }
  }

  /**
   * Create a new notice (admin only)
   */
  static async create(notice: Partial<NoticeCircular>): Promise<NoticeCircular | null> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .insert([notice])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating notice:', error);
        return null;
      }

      return data as NoticeCircular;
    } catch (err) {
      console.error('❌ Failed to create notice:', err);
      return null;
    }
  }

  /**
   * Update notice
   */
  static async update(notice_id: string, updates: Partial<NoticeCircular>): Promise<NoticeCircular | null> {
    try {
      const { data, error } = await supabase
        .from('notices')
        .update(updates)
        .eq('notice_id', notice_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating notice:', error);
        return null;
      }

      return data as NoticeCircular;
    } catch (err) {
      console.error('❌ Failed to update notice:', err);
      return null;
    }
  }

  /**
   * Publish notice
   */
  static async publish(notice_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notices')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('notice_id', notice_id);

      if (error) {
        console.error('❌ Error publishing notice:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to publish notice:', err);
      return false;
    }
  }

  /**
   * Unpublish notice
   */
  static async unpublish(notice_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notices')
        .update({ is_published: false })
        .eq('notice_id', notice_id);

      if (error) {
        console.error('❌ Error unpublishing notice:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to unpublish notice:', err);
      return false;
    }
  }

  /**
   * Delete notice
   */
  static async delete(notice_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('notice_id', notice_id);

      if (error) {
        console.error('❌ Error deleting notice:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to delete notice:', err);
      return false;
    }
  }
}

export default NoticeRepository;
