const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './revenue-guard.sqlite'
});

// Real Cases table to track our recoveries
const Case = sequelize.define('Case', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('payment_degradation', 'checkout_dropoff', 'subscription_churn', 'invoice_overdue', 'mandate_retry'),
    allowNull: false
  },
  razorpay_entity_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount_at_risk: {
    type: DataTypes.INTEGER, // in paise
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'recovered', 'failed', 'escalated', 'cool_down'),
    defaultValue: 'open'
  },
  customer_name: DataTypes.STRING,
  customer_email: DataTypes.STRING,
  customer_contact: DataTypes.STRING,
  recovered_amount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  recovered_at: DataTypes.DATE
});

// Audit Trail to log EVERY AI decision and action
const AuditTrail = sequelize.define('AuditTrail', {
  case_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  action: DataTypes.STRING,
  channel: DataTypes.STRING,
  message_sent: DataTypes.TEXT,
  llm_reasoning: DataTypes.TEXT,
  payment_link_id: DataTypes.STRING,
  payment_link_url: DataTypes.STRING,
  is_violation: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Promise-to-Pay Tracker
const PromiseToPay = sequelize.define('PromiseToPay', {
  case_id: DataTypes.STRING,
  promised_amount: DataTypes.INTEGER,
  promised_date: DataTypes.DATE,
  promised_method: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('pending', 'fulfilled', 'broken'),
    defaultValue: 'pending'
  }
});

const syncDb = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database synced');
};

module.exports = {
  sequelize,
  Case,
  AuditTrail,
  PromiseToPay,
  syncDb
};
