/**
 * Student Repository - Supabase-backed data access layer
 */

import { supabase } from '../lib/supabase';
import { Student } from '../../src/types';

export class StudentRepository {
  private static fromDatabase(row: any): Student {
    return {
      _id: row.id,
      registration_id: row.registration_id,
      form_id: row.form_id,
      personal_data: {
        name: row.name,
        father_name: row.father_name,
        dob: row.dob,
        mobile: row.mobile,
        email: row.email,
        photo_url: row.photo_url,
        gender: row.gender,
        category: row.category,
        address: row.address,
        custom_responses: row.custom_responses,
      },
      school_data: {
        udise_code: row.udise_code,
        school_name: row.school_name,
        district: row.district,
        block: row.block,
        panchayat: row.panchayat,
        current_class: row.current_class,
        previous_year_percentage: row.previous_year_percentage,
      },
      payment_info: {
        status: row.payment_status,
        amount: row.payment_amount,
        txn_id: row.transaction_id,
        order_id: row.order_id,
        paid_at: row.paid_at,
        payment_mode: row.payment_mode,
      },
      documents: {
        application_form_pdf: row.application_form_pdf,
        admit_card_pdf: row.admit_card_pdf,
        marksheet_pdf: row.marksheet_pdf,
      },
      exam_details: {
        roll_no: row.roll_no,
        exam_center: row.exam_center,
        exam_datetime: row.exam_datetime,
        reporting_time: row.reporting_time,
        room_no: row.room_no,
      },
      result_details: {
        marks_obtained: row.marks_obtained,
        total_marks: row.result_total_marks,
        percentage: row.percentage,
        status: row.result_status,
        grade: row.grade,
        rank: row.rank,
        subject_breakup: row.subject_breakup,
      },
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private static toDatabase(student: Partial<Student>): Record<string, any> {
    return {
      registration_id: student.registration_id,
      form_id: student.form_id,
      name: student.personal_data?.name,
      father_name: student.personal_data?.father_name,
      dob: student.personal_data?.dob,
      mobile: student.personal_data?.mobile,
      email: student.personal_data?.email,
      photo_url: student.personal_data?.photo_url,
      gender: student.personal_data?.gender,
      category: student.personal_data?.category,
      address: student.personal_data?.address,
      custom_responses: student.personal_data?.custom_responses,
      udise_code: student.school_data?.udise_code,
      school_name: student.school_data?.school_name,
      district: student.school_data?.district,
      block: student.school_data?.block,
      panchayat: student.school_data?.panchayat,
      current_class: student.school_data?.current_class,
      previous_year_percentage: student.school_data?.previous_year_percentage,
      payment_status: student.payment_info?.status,
      payment_amount: student.payment_info?.amount,
      transaction_id: student.payment_info?.txn_id,
      order_id: student.payment_info?.order_id,
      paid_at: student.payment_info?.paid_at,
      payment_mode: student.payment_info?.payment_mode,
      application_form_pdf: student.documents?.application_form_pdf,
      admit_card_pdf: student.documents?.admit_card_pdf,
      marksheet_pdf: student.documents?.marksheet_pdf,
      roll_no: student.exam_details?.roll_no,
      exam_center: student.exam_details?.exam_center,
      exam_datetime: student.exam_details?.exam_datetime,
      reporting_time: student.exam_details?.reporting_time,
      room_no: student.exam_details?.room_no,
      marks_obtained: student.result_details?.marks_obtained,
      result_total_marks: student.result_details?.total_marks,
      percentage: student.result_details?.percentage,
      result_status: student.result_details?.status,
      grade: student.result_details?.grade,
      rank: student.result_details?.rank,
      subject_breakup: student.result_details?.subject_breakup,
      created_at: student.created_at,
      updated_at: student.updated_at,
    };
  }

  private static cleanPayload(payload: Record<string, any>): Record<string, any> {
    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
  }

  /**
   * Find student by registration ID
   */
  static async findByRegistrationId(registration_id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('registration_id', registration_id)
        .single();

      if (error) {
        console.error('❌ Error finding student by registration ID:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Student lookup failed:', err);
      return null;
    }
  }

  /**
   * Find student by mobile and DOB
   */
  static async findByMobileAndDOB(
    mobile: string,
    dob: string
  ): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('mobile', mobile)
        .eq('dob', dob)
        .single();

      if (error) {
        console.error('❌ Error finding student:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Student lookup failed:', err);
      return null;
    }
  }

  /**
   * Find all students (with optional filtering)
   */
  static async findAll(filters?: {
    form_id?: string;
    district?: string;
    school_id?: string;
  }): Promise<Student[]> {
    try {
      let query = supabase.from('students').select('*');

      if (filters?.form_id) {
        query = query.eq('form_id', filters.form_id);
      }
      if (filters?.district) {
        query = query.eq('district', filters.district);
      }
      if (filters?.school_id) {
        query = query.eq('school_id', filters.school_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching students:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Failed to fetch students:', err);
      return [];
    }
  }

  /**
   * Search students by name or registration ID
   */
  static async search(query: string): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .or(`name.ilike.%${query}%,registration_id.ilike.%${query}%`);

      if (error) {
        console.error('❌ Error searching students:', error);
        return [];
      }

      return (data || []).map((row) => this.fromDatabase(row));
    } catch (err) {
      console.error('❌ Student search failed:', err);
      return [];
    }
  }

  /**
   * Create a new student record
   */
  static async create(student: Partial<Student>): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([this.cleanPayload(this.toDatabase(student))])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating student:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to create student:', err);
      return null;
    }
  }

  /**
   * Update student record
   */
  static async update(registration_id: string, updates: Partial<Student>): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(this.cleanPayload(this.toDatabase(updates)))
        .eq('registration_id', registration_id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating student:', error);
        return null;
      }

      return data ? this.fromDatabase(data) : null;
    } catch (err) {
      console.error('❌ Failed to update student:', err);
      return null;
    }
  }

  /**
   * Delete student record (use with caution)
   */
  static async delete(registration_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('registration_id', registration_id);

      if (error) {
        console.error('❌ Error deleting student:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('❌ Failed to delete student:', err);
      return false;
    }
  }
}

export default StudentRepository;
