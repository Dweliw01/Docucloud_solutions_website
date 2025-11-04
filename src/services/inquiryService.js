// Inquiry service - handles contact form submissions
const supabase = require('../config/database');
const emailService = require('./emailService');

class InquiryService {
  // Create new inquiry
  async createInquiry(data, metadata = {}) {
    try {
      const { name, email, phone, company, message, source } = data;

      // Insert inquiry into database
      const { data: inquiry, error } = await supabase
        .from('inquiries')
        .insert([{
          name,
          email,
          phone,
          company,
          message,
          source: source || 'website',
          referrer: metadata.referrer,
          status: 'new'
        }])
        .select()
        .single();

      if (error) throw error;

      // Send notification emails (don't wait)
      this.sendNotifications(inquiry).catch(err =>
        console.error('Email notification error:', err)
      );

      return { success: true, inquiry };
    } catch (error) {
      console.error('Create inquiry error:', error);
      throw error;
    }
  }

  // Send email notifications
  async sendNotifications(inquiry) {
    try {
      await Promise.all([
        emailService.sendAdminNotification(inquiry),
        emailService.sendCustomerConfirmation(inquiry)
      ]);
    } catch (error) {
      console.error('Send notifications error:', error);
      throw error;
    }
  }

  // Get inquiry by ID
  async getInquiryById(id) {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get inquiry error:', error);
      throw error;
    }
  }

  // Update inquiry status
  async updateInquiryStatus(id, status, notes = null) {
    try {
      const updateData = { status };
      if (notes) updateData.notes = notes;

      const { data, error } = await supabase
        .from('inquiries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update inquiry error:', error);
      throw error;
    }
  }

  // Get recent inquiries
  async getRecentInquiries(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('recent_inquiries_with_context')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get recent inquiries error:', error);
      throw error;
    }
  }
}

module.exports = new InquiryService();
