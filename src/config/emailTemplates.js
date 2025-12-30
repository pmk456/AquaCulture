const defaultTemplates = {
  welcome: `Welcome {{user_name}},

Thank you for joining B.Tech AquaCulture. Your account has been created successfully.

You can sign in here: {{login_link}}

Best regards,
B.Tech AquaCulture Team`,
  visitReminder: `Reminder: You have a visit scheduled with {{dealer_name}} on {{visit_date}}.

Location: {{dealer_address}}

Please confirm your attendance.`,
  passwordReset: `You requested a password reset for your B.Tech AquaCulture account.

Click the link below to reset your password:
{{reset_link}}

If you didn't request this, please ignore this email.`
};

function renderTemplate(template, data = {}) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined && value !== null ? value : '';
  });
}

module.exports = {
  defaultTemplates,
  renderTemplate
};

