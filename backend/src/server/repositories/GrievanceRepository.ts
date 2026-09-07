/**
 * Grievance Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { GrievanceTicket } from '../../types';

export class GrievanceRepository {
  /**
   * Find grievance by ticket ID
   */
  static async findByTicketId(ticket_id: string): Promise<GrievanceTicket | null> {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('ticket_id', ticket_id)
        .single();

      if (error) {
        console.error('❌ Error finding grievance:', error);
        return null;
      }

      return data as GrievanceTicket;
    } catch (err) {
      console.error('❌ Grievance lookup failed:', err);
      return null;
    }
  }

  /**
   * Find all grievances (admin only)
   */
  static async findAll(filters?: { status?: string; form_id?: string }): Promise<GrievanceTicket[]> {
    try {
      let query = supabase.from('grievances').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.form_id) {
        query = query.eq('form_id', filters.form_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching grievances:', error);
        return [];
      }

      return (data || []) as GrievanceTicket[];
    } catch (err) {
      console.error('❌ Failed to fetch grievances:', err);
      return [];
    }
  }

  /**
   * Find grievances by student registration ID
   */
  static async findByStudentId(registration_id: string): Promise<GrievanceTicket[]> {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .eq('registration_id', registration_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching grievances:', error);
        return [];
      }

      return (data || []) as GrievanceTicket[];
    } catch (err) {
      console.error('❌ Failed to fetch grievances:', err);
      return [];
    }
  }

  /**
   * Search grievances by ticket ID or subject
   */
  static async search(query: string): Promise<GrievanceTicket[]> {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .or(`ticket_id.ilike.%${query}%,subject.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error searching grievances:', error);
        return [];
      }

      return (data || []) as GrievanceTicket[];
    } catch (err) {
      console.error('❌ Grievance search failed:', err);
      return [];
    }
  }

  /**
   * Create a new grievance
   */
  static async create(grievance: Partial<GrievanceTicket>): Promise<GrievanceTicket | null> {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .insert([grievance])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating grievance:', error);
        return null;
      }

      return data as GrievanceTicket;
    } catch (err) {
      console.error('❌ Failed to create grievance:', err);
      return null;
    }
  }

  /**
   * Update grievance status
   */
  static async updateStatus(ticket_id: string, status: string, admin_response?: string): Promise<GrievanceTicket | null> {
    try {
      const updates: any = { status };
      if (admin_response) {
        updates.admin_response = admin_response;
        updates.response_date = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('grievances')
        .update(updates)
        .eq('ticket_id', ticket_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating grievance:', error);
        return null;
      }

      return data as GrievanceTicket;
    } catch (err) {
      console.error('❌ Failed to update grievance:', err);
      return null;
    }
  }

  /**
   * Get grievance statistics (admin only)
   */
  static async getStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('status')
        .throwOnError();

      if (error) {
        console.error('❌ Error fetching grievance stats:', error);
        return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
      }

      const stats = {
        total: (data || []).length,
        open: ((data || []) as any[]).filter((g) => g.status === 'OPEN').length,
        inProgress: ((data || []) as any[]).filter((g) => g.status === 'IN_PROGRESS').length,
        resolved: ((data || []) as any[]).filter((g) => g.status === 'RESOLVED').length,
        closed: ((data || []) as any[]).filter((g) => g.status === 'CLOSED').length,
      };

      return stats;
    } catch (err) {
      console.error('❌ Failed to fetch grievance stats:', err);
      return { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 };
    }
  }
}

export default GrievanceRepository;
