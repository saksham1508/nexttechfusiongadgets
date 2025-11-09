const EventEmitter = require('events');
const winston = require('winston');

class MonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      payments: {
        total: 0,
        successful: 0,
        failed: 0,
        revenue: 0,
        averageAmount: 0,
        byMethod: {},
        byCurrency: {},
        hourlyStats: new Array(24).fill(0),
        dailyStats: new Array(30).fill(0)
      },
      performance: {
        responseTime: [],
        errorRate: 0,
        uptime: Date.now(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      security: {
        blockedRequests: 0,
        suspiciousActivity: 0,
        failedLogins: 0,
        rateLimitHits: 0
      },
      users: {
        active: 0,
        new: 0,
        returning: 0,
        sessions: new Map()
      }
    };

    this.alerts = [];
    this.thresholds = {
      errorRate: 5, // 5%
      responseTime: 2000, // 2 seconds
      failureRate: 10, // 10%
      memoryUsage: 80 // 80%
    };

    // Start monitoring intervals
    this.startMonitoring();
  }

  startMonitoring() {
    // Update performance metrics every minute
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 60000);

    // Check alerts every 30 seconds
    setInterval(() => {
      this.checkAlerts();
    }, 30000);

    // Clean old data every hour
    setInterval(() => {
      this.cleanOldData();
    }, 3600000);
  }

  // Payment Monitoring
  recordPaymentAttempt(paymentData) {
    this.metrics.payments.total++;

    const method = paymentData.method || 'unknown';
    const currency = paymentData.currency || 'USD';
    const amount = paymentData.amount || 0;

    // Update method stats
    if (!this.metrics.payments.byMethod[method]) {
      this.metrics.payments.byMethod[method] = { count: 0, revenue: 0, failures: 0 };
    }
    this.metrics.payments.byMethod[method].count++;

    // Update currency stats
    if (!this.metrics.payments.byCurrency[currency]) {
      this.metrics.payments.byCurrency[currency] = { count: 0, revenue: 0 };
    }
    this.metrics.payments.byCurrency[currency].count++;

    // Update hourly stats
    const hour = new Date().getHours();
    this.metrics.payments.hourlyStats[hour]++;

    this.emit('payment_attempt', paymentData);
  }

  recordPaymentSuccess(paymentData) {
    this.metrics.payments.successful++;

    const method = paymentData.method || 'unknown';
    const currency = paymentData.currency || 'USD';
    const amount = paymentData.amount || 0;

    // Update revenue
    this.metrics.payments.revenue += amount;
    this.metrics.payments.byMethod[method].revenue += amount;
    this.metrics.payments.byCurrency[currency].revenue += amount;

    // Update average
    this.metrics.payments.averageAmount =
      this.metrics.payments.revenue / this.metrics.payments.successful;

    this.emit('payment_success', paymentData);
  }

  recordPaymentFailure(paymentData, error) {
    this.metrics.payments.failed++;

    const method = paymentData.method || 'unknown';
    if (this.metrics.payments.byMethod[method]) {
      this.metrics.payments.byMethod[method].failures++;
    }

    this.emit('payment_failure', { paymentData, error });

    // Check if failure rate is too high
    const failureRate = (this.metrics.payments.failed / this.metrics.payments.total) * 100;
    if (failureRate > this.thresholds.failureRate) {
      this.createAlert('high_failure_rate', `Payment failure rate is ${failureRate.toFixed(1)}%`);
    }
  }

  // Performance Monitoring
  recordResponseTime(endpoint, duration) {
    this.metrics.performance.responseTime.push({
      endpoint,
      duration,
      timestamp: Date.now()
    });

    // Keep only last 1000 entries
    if (this.metrics.performance.responseTime.length > 1000) {
      this.metrics.performance.responseTime = this.metrics.performance.responseTime.slice(-1000);
    }

    // Alert on slow responses
    if (duration > this.thresholds.responseTime) {
      this.createAlert('slow_response', `Slow response on ${endpoint}: ${duration}ms`);
    }
  }

  recordError(error, context = {}) {
    this.metrics.performance.errorRate++;

    this.emit('error_occurred', { error, context, timestamp: Date.now() });

    // Log error
    winston.error('Application error', { error: error.message, stack: error.stack, context });
  }

  updatePerformanceMetrics() {
    // Update memory usage
    this.metrics.performance.memoryUsage = process.memoryUsage();

    // Update CPU usage
    this.metrics.performance.cpuUsage = process.cpuUsage();

    // Check memory usage
    const memoryUsagePercent = (this.metrics.performance.memoryUsage.heapUsed /
                               this.metrics.performance.memoryUsage.heapTotal) * 100;

    if (memoryUsagePercent > this.thresholds.memoryUsage) {
      this.createAlert('high_memory_usage', `Memory usage is ${memoryUsagePercent.toFixed(1)}%`);
    }
  }

  // Security Monitoring
  recordSecurityEvent(type, details = {}) {
    switch (type) {
    case 'blocked_request':
      this.metrics.security.blockedRequests++;
      break;
    case 'suspicious_activity':
      this.metrics.security.suspiciousActivity++;
      break;
    case 'failed_login':
      this.metrics.security.failedLogins++;
      break;
    case 'rate_limit_hit':
      this.metrics.security.rateLimitHits++;
      break;
    }

    this.emit('security_event', { type, details, timestamp: Date.now() });

    // Alert on security events
    if (type === 'suspicious_activity') {
      this.createAlert('security_threat', `Suspicious activity detected: ${JSON.stringify(details)}`);
    }
  }

  // User Activity Monitoring
  recordUserSession(userId, action) {
    if (!this.metrics.users.sessions.has(userId)) {
      this.metrics.users.sessions.set(userId, {
        startTime: Date.now(),
        lastActivity: Date.now(),
        actions: []
      });
      this.metrics.users.active++;
    }

    const session = this.metrics.users.sessions.get(userId);
    session.lastActivity = Date.now();
    session.actions.push({ action, timestamp: Date.now() });

    this.emit('user_activity', { userId, action, timestamp: Date.now() });
  }

  // Alert System
  createAlert(type, message, severity = 'medium') {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    this.emit('alert_created', alert);

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    return alert;
  }

  resolveAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      this.emit('alert_resolved', alert);
    }
  }

  checkAlerts() {
    // Check various conditions and create alerts if needed
    const now = Date.now();

    // Check if system is down (no recent activity)
    const recentActivity = this.metrics.performance.responseTime
      .filter(r => now - r.timestamp < 300000); // Last 5 minutes

    if (recentActivity.length === 0 && this.metrics.payments.total > 0) {
      this.createAlert('system_down', 'No recent activity detected', 'high');
    }

    // Check average response time
    if (recentActivity.length > 0) {
      const avgResponseTime = recentActivity.reduce((sum, r) => sum + r.duration, 0) / recentActivity.length;
      if (avgResponseTime > this.thresholds.responseTime) {
        this.createAlert('slow_system', `Average response time is ${avgResponseTime.toFixed(0)}ms`);
      }
    }
  }

  cleanOldData() {
    const oneHourAgo = Date.now() - 3600000;

    // Clean old response time data
    this.metrics.performance.responseTime = this.metrics.performance.responseTime
      .filter(r => r.timestamp > oneHourAgo);

    // Clean old user sessions
    for (const [userId, session] of this.metrics.users.sessions.entries()) {
      if (session.lastActivity < oneHourAgo) {
        this.metrics.users.sessions.delete(userId);
        this.metrics.users.active--;
      }
    }
  }

  // Analytics Methods
  getPaymentAnalytics(timeframe = '24h') {
    const now = Date.now();
    let startTime;

    switch (timeframe) {
    case '1h':
      startTime = now - 3600000;
      break;
    case '24h':
      startTime = now - 86400000;
      break;
    case '7d':
      startTime = now - 604800000;
      break;
    default:
      startTime = now - 86400000;
    }

    return {
      summary: {
        total: this.metrics.payments.total,
        successful: this.metrics.payments.successful,
        failed: this.metrics.payments.failed,
        revenue: this.metrics.payments.revenue,
        averageAmount: this.metrics.payments.averageAmount,
        successRate: (this.metrics.payments.successful / this.metrics.payments.total) * 100
      },
      byMethod: this.metrics.payments.byMethod,
      byCurrency: this.metrics.payments.byCurrency,
      hourlyStats: this.metrics.payments.hourlyStats
    };
  }

  getPerformanceMetrics() {
    const recentResponses = this.metrics.performance.responseTime.slice(-100);
    const avgResponseTime = recentResponses.length > 0
      ? recentResponses.reduce((sum, r) => sum + r.duration, 0) / recentResponses.length
      : 0;

    return {
      averageResponseTime: avgResponseTime,
      errorRate: this.metrics.performance.errorRate,
      uptime: Date.now() - this.metrics.performance.uptime,
      memoryUsage: this.metrics.performance.memoryUsage,
      cpuUsage: this.metrics.performance.cpuUsage
    };
  }

  getSecurityMetrics() {
    return {
      blockedRequests: this.metrics.security.blockedRequests,
      suspiciousActivity: this.metrics.security.suspiciousActivity,
      failedLogins: this.metrics.security.failedLogins,
      rateLimitHits: this.metrics.security.rateLimitHits
    };
  }

  getUserMetrics() {
    return {
      active: this.metrics.users.active,
      new: this.metrics.users.new,
      returning: this.metrics.users.returning,
      totalSessions: this.metrics.users.sessions.size
    };
  }

  getAlerts(unresolved = false) {
    return unresolved
      ? this.alerts.filter(a => !a.resolved)
      : this.alerts;
  }

  // Real-time dashboard data
  getDashboardData() {
    return {
      payments: this.getPaymentAnalytics(),
      performance: this.getPerformanceMetrics(),
      security: this.getSecurityMetrics(),
      users: this.getUserMetrics(),
      alerts: this.getAlerts(true), // Only unresolved alerts
      timestamp: Date.now()
    };
  }
}

module.exports = new MonitoringService();
