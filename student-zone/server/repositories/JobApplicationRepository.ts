/**
 * Job Applications Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';

export interface JobApplication {
  job_id?: string;
  application_id?: string;
  position_title: string;
  department: string;
  posted_date: string;
  deadline: string;
  description: string;
  qualifications: string[];
  is_active: boolean;
  applicant_count?: number;
  created_at?: string;
  updated_at?: string;
}

export class JobApplicationRepository {
  /**
   * Find all active job postings (public)
   */
  static async findActivePostings(): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching job postings:', error);
        return [];
      }

      return (data || []) as JobApplication[];
    } catch (err) {
      console.error('❌ Failed to fetch job postings:', err);
      return [];
    }
  }

  /**
   * Find all job postings (admin only)
   */
  static async findAll(): Promise<JobApplication[]> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('posted_date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching job postings:', error);
        return [];
      }

      return (data || []) as JobApplication[];
    } catch (err) {
      console.error('❌ Failed to fetch job postings:', err);
      return [];
    }
  }

  /**
   * Find job posting by ID
   */
  static async findById(job_id: string): Promise<JobApplication | null> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', job_id)
        .single();

      if (error) {
        console.error('❌ Error finding job posting:', error);
        return null;
      }

      return data as JobApplication;
    } catch (err) {
      console.error('❌ Job posting lookup failed:', err);
      return null;
    }
  }

  /**
   * Create a new job posting (admin only)
   */
  static async create(jobPosting: Partial<JobApplication>): Promise<JobApplication | null> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert([jobPosting])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating job posting:', error);
        return null;
      }

      return data as JobApplication;
    } catch (err) {
      console.error('❌ Failed to create job posting:', err);
      return null;
    }
  }

  /**
   * Update job posting
   */
  static async update(job_id: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('job_id', job_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating job posting:', error);
        return null;
      }

      return data as JobApplication;
    } catch (err) {
      console.error('❌ Failed to update job posting:', err);
      return null;
    }
  }

  /**
   * Close job posting
   */
  static async close(job_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ is_active: false })
        .eq('job_id', job_id);

      if (error) {
        console.error('❌ Error closing job posting:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to close job posting:', err);
      return false;
    }
  }

  /**
   * Delete job posting
   */
  static async delete(job_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('job_id', job_id);

      if (error) {
        console.error('❌ Error deleting job posting:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to delete job posting:', err);
      return false;
    }
  }
}

export default JobApplicationRepository;
