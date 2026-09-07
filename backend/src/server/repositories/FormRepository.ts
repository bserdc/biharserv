/**
 * Form Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { FormConfig } from '../../types';

export class FormRepository {
  private static fromDatabase(row: any): FormConfig {
    return {
      ...row,
      _id: row._id || row.id,
      admit_card_status: {
        is_released: row.admit_card_is_released,
        release_date: row.admit_card_release_date,
      },
      result_status: {
        is_declared: row.result_is_declared,
        declare_date: row.result_declare_date,
      },
    } as FormConfig;
  }

  private static toDatabase(form: Partial<FormConfig>): Record<string, any> {
    return Object.fromEntries(Object.entries({
      form_id: form.form_id,
      title: form.title,
      description: form.description,
      academic_year: form.academic_year,
      fee_amount: form.fee_amount,
      is_active: form.is_active,
      custom_fields: form.custom_fields,
      admit_card_is_released: form.admit_card_status?.is_released,
      admit_card_release_date: form.admit_card_status?.release_date,
      result_is_declared: form.result_status?.is_declared,
      result_declare_date: form.result_status?.declare_date,
      exam_date: form.exam_date,
      exam_time: form.exam_time,
      exam_center_default: form.exam_center_default,
      total_marks: form.total_marks,
      passing_marks: form.passing_marks,
      instructions: form.instructions,
    }).filter(([, value]) => value !== undefined));
  }

  /**
   * Find form by form ID
   */
  static async findByFormId(form_id: string): Promise<FormConfig | null> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('form_id', form_id)
        .single();

      if (error) {
        console.error('❌ Error finding form:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Form lookup failed:', err);
      return null;
    }
  }

  /**
   * Find all forms
   */
  static async findAll(activeOnly: boolean = false): Promise<FormConfig[]> {
    try {
      let query = supabase.from('forms').select('*');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query.order('academic_year', { ascending: false });

      if (error) {
        console.error('❌ Error fetching forms:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch forms:', err);
      return [];
    }
  }

  /**
   * Find forms by academic year
   */
  static async findByAcademicYear(academic_year: string): Promise<FormConfig[]> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('academic_year', academic_year)
        .order('title', { ascending: true });

      if (error) {
        console.error('❌ Error fetching forms:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch forms:', err);
      return [];
    }
  }

  /**
   * Create a new form (admin only)
   */
  static async create(form: Partial<FormConfig>): Promise<FormConfig | null> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .insert([this.toDatabase(form)])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating form:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to create form:', err);
      return null;
    }
  }

  /**
   * Update form record
   */
  static async update(form_id: string, updates: Partial<FormConfig>): Promise<FormConfig | null> {
    try {
      const { data, error } = await supabase
        .from('forms')
        .update(this.toDatabase(updates))
        .eq('form_id', form_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating form:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to update form:', err);
      return null;
    }
  }

  /**
   * Activate form
   */
  static async activate(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_active: true })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error activating form:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to activate form:', err);
      return false;
    }
  }

  /**
   * Deactivate form
   */
  static async deactivate(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ is_active: false })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error deactivating form:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to deactivate form:', err);
      return false;
    }
  }

  /**
   * Release admit cards for a form
   */
  static async releaseAdmitCard(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          admit_card_is_released: true,
          admit_card_release_date: new Date().toISOString(),
        })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error releasing admit card:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to release admit card:', err);
      return false;
    }
  }

  /**
   * Declare results for a form
   */
  static async declareResults(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          result_is_declared: true,
          result_declare_date: new Date().toISOString(),
        })
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error declaring results:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to declare results:', err);
      return false;
    }
  }

  /**
   * Delete form (admin only)
   */
  static async delete(form_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('form_id', form_id);

      if (error) {
        console.error('❌ Error deleting form:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to delete form:', err);
      return false;
    }
  }
}

export default FormRepository;
