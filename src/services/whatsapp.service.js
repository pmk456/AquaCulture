// WhatsApp Notification Service (Mock Implementation)
// TODO: Integrate with actual WhatsApp Business API (Twilio, WhatsApp Cloud API, etc.)

const userModel = require('../models/user.model');

const WhatsAppService = {
  /**
   * Send WhatsApp notification to a user
   * @param {number} userId - User ID to send notification to
   * @param {string} message - Message to send
   * @returns {Promise<boolean>} - Returns true if message would be sent (mock)
   */
  async sendNotification(userId, message) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        console.warn(`[WhatsApp] User ${userId} not found`);
        return false;
      }

      // TODO: Replace with actual WhatsApp API integration
      // Example integrations:
      // - Twilio WhatsApp API
      // - WhatsApp Cloud API (Meta)
      // - WhatsApp Business API via third-party service

      // Mock implementation - log the message
      console.log(`[WhatsApp Mock] Sending to ${user.first_name} ${user.last_name} (${user.email}):`);
      console.log(`[WhatsApp Mock] Message: ${message}`);

      // In production, this would be:
      // const phoneNumber = user.phone_number; // Add phone_number field to users table
      // await twilioClient.messages.create({
      //   from: 'whatsapp:+14155238886',
      //   to: `whatsapp:${phoneNumber}`,
      //   body: message
      // });

      return true;
    } catch (error) {
      console.error('[WhatsApp] Error sending notification:', error);
      return false;
    }
  },

  /**
   * Send sale completion notification to rep
   * @param {number} repId - Rep user ID
   * @param {object} visitData - Visit information
   * @returns {Promise<boolean>}
   */
  async sendSaleCompletionNotification(repId, visitData) {
    const user = await userModel.findById(repId);
    if (!user) {
      return false;
    }

    const dealerName = visitData.dealer_name || 'Dealer';
    const visitId = visitData.id;

    const message = `🎉 Sale Completed!\n\n` +
      `Congratulations ${user.first_name}! Your visit #${visitId} to ${dealerName} has been marked as a completed sale by your manager.\n\n` +
      `Keep up the great work! 💪\n\n` +
      `View details in the B.Tech AquaCulture Field app.`;

    return await this.sendNotification(repId, message);
  },

  /**
   * Send visit status update notification
   * @param {number} repId - Rep user ID
   * @param {string} status - Visit status (accepted, denied, hold)
   * @param {object} visitData - Visit information
   * @returns {Promise<boolean>}
   */
  async sendVisitStatusNotification(repId, status, visitData) {
    const user = await userModel.findById(repId);
    if (!user) {
      return false;
    }

    const dealerName = visitData.dealer_name || 'Dealer';
    const visitId = visitData.id;

    let message = '';
    let emoji = '';

    switch (status) {
      case 'accepted':
        emoji = '✅';
        message = `Visit Approved!\n\n` +
          `Your visit #${visitId} to ${dealerName} has been approved by your manager.\n\n` +
          `Status: Sale Completed ${emoji}`;
        break;
      case 'denied':
        emoji = '❌';
        message = `Visit Denied\n\n` +
          `Your visit #${visitId} to ${dealerName} has been denied by your manager.\n\n` +
          `Please review and contact your manager if needed.`;
        break;
      case 'hold':
        emoji = '⏸️';
        message = `Visit On Hold\n\n` +
          `Your visit #${visitId} to ${dealerName} is currently on hold.\n\n` +
          `Your manager will review it shortly.`;
        break;
      default:
        return false;
    }

    return await this.sendNotification(repId, message);
  }
};

module.exports = WhatsAppService;

