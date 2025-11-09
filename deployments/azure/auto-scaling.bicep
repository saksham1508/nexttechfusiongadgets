// Azure Auto Scaling Configuration for NextTechFusionGadgets
// Bicep template for Container Apps auto scaling

param location string = resourceGroup().location
param environmentName string = 'nexttechfusion-env'
param containerAppName string = 'nexttechfusion-backend'
param minReplicas int = 2
param maxReplicas int = 10

// Container App with Auto Scaling Rules
resource containerApp 'Microsoft.App/containerApps@2022-03-01' = {
  name: containerAppName
  location: location
  properties: {
    environmentId: environment.id
    template: {
      containers: [
        {
          name: 'nexttechfusion-backend'
          image: 'nexttechfusionacr.azurecr.io/nexttechfusion-backend:latest'
          resources: {
            cpu: 0.5
            memory: '1.0Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '5000'
            }
            // Add other environment variables
          ]
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          // CPU-based scaling
          {
            name: 'cpu-scaling'
            custom: {
              type: 'cpu'
              metadata: {
                type: 'Utilization'
                value: '70'
              }
            }
          }
          // Memory-based scaling
          {
            name: 'memory-scaling'
            custom: {
              type: 'memory'
              metadata: {
                type: 'Utilization'
                value: '80'
              }
            }
          }
          // HTTP request scaling
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

// Container App Environment
resource environment 'Microsoft.App/managedEnvironments@2022-03-01' = {
  name: environmentName
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

// Log Analytics Workspace for monitoring
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: 'nexttechfusion-loganalytics'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights for detailed monitoring
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'nexttechfusion-appinsights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

// Auto Scaling Alerts and Monitoring

// CPU Usage Alert
resource cpuAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'high-cpu-alert'
  location: location
  properties: {
    description: 'Alert when CPU usage is high'
    severity: 2
    enabled: true
    scopes: [
      containerApp.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighCPU'
          metricName: 'CPUUsage'
          metricNamespace: 'Microsoft.App/containerApps'
          operator: 'GreaterThan'
          threshold: 85
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webHookProperties: {}
      }
    ]
  }
}

// Memory Usage Alert
resource memoryAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'high-memory-alert'
  location: location
  properties: {
    description: 'Alert when memory usage is high'
    severity: 2
    enabled: true
    scopes: [
      containerApp.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighMemory'
          metricName: 'MemoryUsage'
          metricNamespace: 'Microsoft.App/containerApps'
          operator: 'GreaterThan'
          threshold: 90
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webHookProperties: {}
      }
    ]
  }
}

// Request Rate Alert
resource requestAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'high-request-rate-alert'
  location: location
  properties: {
    description: 'Alert when request rate is high'
    severity: 3
    enabled: true
    scopes: [
      containerApp.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighRequests'
          metricName: 'Requests'
          metricNamespace: 'Microsoft.App/containerApps'
          operator: 'GreaterThan'
          threshold: 1000
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webHookProperties: {}
      }
    ]
  }
}

// Action Group for Alerts
resource actionGroup 'Microsoft.Insights/actionGroups@2021-09-01' = {
  name: 'nexttechfusion-alerts'
  location: 'global'
  properties: {
    groupShortName: 'alerts'
    enabled: true
    emailReceivers: [
      {
        name: 'admin'
        emailAddress: 'admin@yourdomain.com'
        useCommonAlertSchema: true
      }
    ]
    smsReceivers: []
    webhookReceivers: []
  }
}

// Scheduled Scaling Rules (using Azure Automation or Logic Apps)
// Note: Azure Container Apps doesn't have built-in scheduled scaling like ECS
// This would need to be implemented using Azure Automation or Logic Apps

// Example: Scale up during business hours (9 AM - 6 PM EST, Mon-Fri)
// This would be implemented as a separate Logic App or Automation Runbook

/*
resource scaleUpSchedule 'Microsoft.Logic/workflows@2019-05-01' = {
  name: 'scale-up-business-hours'
  location: location
  properties: {
    state: 'Enabled'
    definition: {
      // Logic App definition for scheduled scaling
    }
  }
}
*/

// Scaling Recommendations
// Based on historical usage patterns, you can adjust:
// - minReplicas: Minimum number of instances
// - maxReplicas: Maximum number of instances
// - CPU threshold: Target CPU utilization percentage
// - Memory threshold: Target memory utilization percentage
// - Concurrent requests: Target concurrent requests per instance

// Monitoring Dashboard
// Create a dashboard to visualize scaling metrics
resource dashboard 'Microsoft.Portal/dashboards@2020-09-01-preview' = {
  name: 'nexttechfusion-scaling-dashboard'
  location: location
  properties: {
    lenses: {
      0: {
        order: 0
        parts: {
          // Dashboard parts for scaling metrics
        }
      }
    }
    metadata: {
      model: {
        timeRange: {
          value: {
            relative: {
              duration: 24
              timeUnit: 1
            }
          }
          type: 'MsPortalFx.Composition.Configuration.ValueTypes.TimeRange'
        }
      }
    }
  }
}