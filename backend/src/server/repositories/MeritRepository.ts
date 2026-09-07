/**
 * Merit Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { MeritTopper } from '../../types';

export class MeritRepository {
  private static fromDatabase(row: any): MeritTopper {
    return {
      ...row,
      rank: row.rank,
      name: row.student_name,
      award_scholarship: row.grade || '',
    } as MeritTopper;
  }

  /**
   * Find all merit results (published only for public)
   */
  static async findPublished(form_id?: string): Promise<MeritTopper[]> {
    try {
      let query = supabase
        .from('merit_results')
        .select('*');

      if (form_id) {
        query = query.eq('form_id', form_id);
      }

      const { data, error } = await query.order('rank', { ascending: true });

      if (error) {
        console.error('❌ Error fetching merit results:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch merit results:', err);
      return [];
    }
  }

  /**
   * Find all merit results (admin only)
   */
  static async findAll(form_id?: string): Promise<MeritTopper[]> {
    try {
      let query = supabase.from('merit_results').select('*');

      if (form_id) {
        query = query.eq('form_id', form_id);
      }

      const { data, error } = await query.order('rank', { ascending: true });

      if (error) {
        console.error('❌ Error fetching merit results:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch merit results:', err);
      return [];
    }
  }

  /**
   * Find top N results by form
   */
  static async findTop(form_id: string, limit: number = 10, publishedOnly: boolean = true): Promise<MeritTopper[]> {
    try {
      let query = supabase
        .from('merit_results')
        .select('*')
        .eq('form_id', form_id)
        .order('rank', { ascending: true })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching top merit results:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch top merit results:', err);
      return [];
    }
  }

  /**
   * Create merit record (bulk import from results)
   */
  static async create(merit: Partial<MeritTopper>): Promise<MeritTopper | null> {
    try {
      const { data, error } = await supabase
        .from('merit_results')
        .insert([{ form_id: (merit as any).form_id, registration_id: merit.registration_id, student_name: merit.name, school_name: merit.school_name, district: merit.district, rank: merit.rank, marks_obtained: merit.marks_obtained, total_marks: merit.total_marks, percentage: merit.percentage, grade: merit.award_scholarship }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating merit record:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to create merit record:', err);
      return null;
    }
  }

  /**
   * Bulk create merit records
   */
  static async createBulk(merits: Partial<MeritTopper>[]): Promise<number> {
    try {
      const { error } = await supabase.from('merit_results').insert(merits);

      if (error) {
        console.error('❌ Error bulk creating merit records:', error);
        return 0;
      }

      return merits.length;
    } catch (err) {
      console.error('❌ Failed to bulk create merit records:', err);
      return 0;
    }
  }

  /**
   * Update merit record
   */
  static async update(merit_id: string, updates: Partial<MeritTopper>): Promise<MeritTopper | null> {
    try {
      const { data, error } = await supabase
        .from('merit_results')
        .update(updates)
        .eq('merit_id', merit_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating merit record:', error);
        return null;
      }

      return data as MeritTopper;
    } catch (err) {
      console.error('❌ Failed to update merit record:', err);
      return null;
    }
  }

  /**
   * Publish merit results for a form
   */
  static async publishForForm(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('merit_results')
        .update({ is_published: true })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error publishing merit results:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to publish merit results:', err);
      return false;
    }
  }

  /**
   * Unpublish merit results for a form
   */
  static async unpublishForForm(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('merit_results')
        .update({ is_published: false })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error unpublishing merit results:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to unpublish merit results:', err);
      return false;
    }
  }
}

export default MeritRepository;
