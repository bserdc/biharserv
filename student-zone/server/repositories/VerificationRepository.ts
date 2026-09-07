/**
 * Verification Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { VerificationResult } from '../../src/types';

export class VerificationRepository {
  /**
   * Find verification record by registration ID
   */
  static async findByRegistrationId(registration_id: string): Promise<VerificationResult | null> {
    try {
      const { data, error } = await supabase
        .from('verification_records')
        .select('*')
        .eq('registration_id', registration_id)
        .single();

      if (error) {
        console.error('❌ Error finding verification record:', error);
        return null;
      }

      return data as VerificationResult;
    } catch (err) {
      console.error('❌ Verification lookup failed:', err);
      return null;
    }
  }

  /**
   * Find all verification records (admin only)
   */
  static async findAll(filters?: { form_id?: string; status?: string }): Promise<VerificationResult[]> {
    try {
      let query = supabase.from('verification_records').select('*');

      if (filters?.form_id) {
        query = query.eq('form_id', filters.form_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching verification records:', error);
        return [];
      }

      return (data || []) as VerificationResult[];
    } catch (err) {
      console.error('❌ Failed to fetch verification records:', err);
      return [];
    }
  }

  /**
   * Create verification record
   */
  static async create(verification: Partial<VerificationResult>): Promise<VerificationResult | null> {
    try {
      const { data, error } = await supabase
        .from('verification_records')
        .insert([verification])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating verification record:', error);
        return null;
      }

      return data as VerificationResult;
    } catch (err) {
      console.error('❌ Failed to create verification record:', err);
      return null;
    }
  }

  /**
   * Update verification record
   */
  static async update(
    registration_id: string,
    updates: Partial<VerificationResult>
  ): Promise<VerificationResult | null> {
    try {
      const { data, error } = await supabase
        .from('verification_records')
        .update(updates)
        .eq('registration_id', registration_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating verification record:', error);
        return null;
      }

      return data as VerificationResult;
    } catch (err) {
      console.error('❌ Failed to update verification record:', err);
      return null;
    }
  }

  /**
   * Update verification status
   */
  static async updateStatus(
    registration_id: string,
    status: string,
    notes?: string
  ): Promise<VerificationResult | null> {
    try {
      const updates: any = { status };
      if (notes) {
        updates.verification_notes = notes;
      }

      const { data, error } = await supabase
        .from('verification_records')
        .update(updates)
        .eq('registration_id', registration_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating verification status:', error);
        return null;
      }

      return data as VerificationResult;
    } catch (err) {
      console.error('❌ Failed to update verification status:', err);
      return null;
    }
  }

  /**
   * Get verification statistics
   */
  static async getStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('verification_records')
        .select('status');

      if (error) {
        console.error('❌ Error fetching verification stats:', error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
      }

      const stats = {
        total: (data || []).length,
        pending: ((data || []) as any[]).filter((v) => v.status === 'PENDING').length,
        approved: ((data || []) as any[]).filter((v) => v.status === 'APPROVED').length,
        rejected: ((data || []) as any[]).filter((v) => v.status === 'REJECTED').length,
      };

      return stats;
    } catch (err) {
      console.error('❌ Failed to fetch verification stats:', err);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
}

export default VerificationRepository;
