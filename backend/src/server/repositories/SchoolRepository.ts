/**
 * School Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { School } from '../../types';

export class SchoolRepository {
  private static fromDatabase(row: any): School {
    return { ...row, _id: row._id || row.id } as School;
  }

  /**
   * Find school by UDISE code
   */
  static async findByUdiseCode(udise_code: string): Promise<School | null> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('udise_code', udise_code)
        .single();

      if (error) {
        console.error('❌ Error finding school:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ School lookup failed:', err);
      return null;
    }
  }

  /**
   * Find all schools
   */
  static async findAll(): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('school_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching schools:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch schools:', err);
      return [];
    }
  }

  /**
   * Get all distinct districts
   */
  static async getDistinctDistricts(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('district')
        .order('district', { ascending: true });

      if (error) {
        console.error('❌ Error fetching districts:', error);
        return [];
      }

      const districts = Array.from(new Set((data || []).map((d: any) => d.district).filter(Boolean)));
      return districts;
    } catch (err) {
      console.error('❌ Failed to fetch districts:', err);
      return [];
    }
  }

  /**
   * Get blocks by district
   */
  static async getBlocksByDistrict(district: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('block')
        .eq('district', district)
        .order('block', { ascending: true });

      if (error) {
        console.error('❌ Error fetching blocks:', error);
        return [];
      }

      const blocks = Array.from(new Set((data || []).map((b: any) => b.block).filter(Boolean)));
      return blocks;
    } catch (err) {
      console.error('❌ Failed to fetch blocks:', err);
      return [];
    }
  }

  /**
   * Get schools by district and block
   */
  static async findByDistrictAndBlock(district: string, block: string): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('district', district)
        .eq('block', block)
        .order('school_name', { ascending: true });

      if (error) {
        console.error('❌ Error fetching schools:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch schools:', err);
      return [];
    }
  }

  /**
   * Search schools by name
   */
  static async search(query: string): Promise<School[]> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .or(`school_name.ilike.%${query}%,udise_code.ilike.%${query}%`)
        .order('school_name', { ascending: true });

      if (error) {
        console.error('❌ Error searching schools:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ School search failed:', err);
      return [];
    }
  }

  /**
   * Create a new school (admin only)
   */
  static async create(school: Partial<School>): Promise<School | null> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert([{ ...school, _id: undefined }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating school:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to create school:', err);
      return null;
    }
  }

  /**
   * Update school record
   */
  static async update(udise_code: string, updates: Partial<School>): Promise<School | null> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .update({ ...updates, _id: undefined })
        .eq('udise_code', udise_code)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating school:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to update school:', err);
      return null;
    }
  }
}

export default SchoolRepository;
