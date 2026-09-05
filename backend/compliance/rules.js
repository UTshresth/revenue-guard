// Compliance Guard — Real-world outreach rules
// Enforces DND hours, max contact frequency, amount ceilings, and channel restrictions

const { AuditTrail } = require('../db');

const COMPLIANCE_CONFIG = {
  dnd_start_hour: 21,          // 9 PM
  dnd_end_hour: 9,             // 9 AM
  max_contacts_per_day: 3,     // Max 3 outreach attempts per case per day
  max_amount_auto_retry: 1000000, // ₹10,000 in paise — above this gets human review
  forbidden_channels_dnd: ['sms', 'voice', 'whatsapp'],
  cool_down_hours: 4           // Min 4 hours between contacts
};

const checkCompliance = async (caseId, diagnosis) => {
  const violations = [];
  const hour = new Date().getHours();

  // Rule 1: DND Hours (TRAI regulation)
  if (hour >= COMPLIANCE_CONFIG.dnd_start_hour || hour < COMPLIANCE_CONFIG.dnd_end_hour) {
    if (COMPLIANCE_CONFIG.forbidden_channels_dnd.includes(diagnosis.channel)) {
      violations.push({
        rule: 'DND_HOURS',
        severity: 'hard_block',
        detail: `Cannot send ${diagnosis.channel.toUpperCase()} between ${COMPLIANCE_CONFIG.dnd_start_hour}:00-${COMPLIANCE_CONFIG.dnd_end_hour}:00 (TRAI regulation).`
      });
    }
  }

  // Rule 2: Contact frequency cap
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const contactsToday = await AuditTrail.count({
    where: {
      case_id: caseId,
      action: 'payment_link_created'
    }
  });
  if (contactsToday >= COMPLIANCE_CONFIG.max_contacts_per_day) {
    violations.push({
      rule: 'MAX_DAILY_CONTACTS',
      severity: 'soft_block',
      detail: `Already contacted ${contactsToday} times today. Max is ${COMPLIANCE_CONFIG.max_contacts_per_day}.`
    });
  }

  // Rule 3: Cool-down period
  const lastContact = await AuditTrail.findOne({
    where: { case_id: caseId, action: 'payment_link_created' },
    order: [['createdAt', 'DESC']]
  });
  if (lastContact) {
    const hoursSinceLast = (Date.now() - new Date(lastContact.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < COMPLIANCE_CONFIG.cool_down_hours) {
      violations.push({
        rule: 'COOL_DOWN',
        severity: 'soft_block',
        detail: `Only ${hoursSinceLast.toFixed(1)}h since last contact. Need ${COMPLIANCE_CONFIG.cool_down_hours}h cool-down.`
      });
    }
  }

  // Rule 4: Amount ceiling — large amounts need human review
  if (diagnosis.amount && diagnosis.amount > COMPLIANCE_CONFIG.max_amount_auto_retry) {
    violations.push({
      rule: 'AMOUNT_CEILING',
      severity: 'human_review',
      detail: `Amount ₹${diagnosis.amount / 100} exceeds auto-retry ceiling of ₹${COMPLIANCE_CONFIG.max_amount_auto_retry / 100}.`
    });
  }

  const hasHardBlock = violations.some(v => v.severity === 'hard_block');

  return {
    allowed: !hasHardBlock,
    violations,
    reason: hasHardBlock ? violations.find(v => v.severity === 'hard_block').detail : null
  };
};

module.exports = {
  checkCompliance,
  COMPLIANCE_CONFIG
};
