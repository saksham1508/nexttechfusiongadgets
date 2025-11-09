// Azure CDN Configuration for NextTechFusionGadgets

param location string = resourceGroup().location
param environment string = 'prod'
param domainName string = 'yourdomain.com'

// Storage Account for Static Assets
resource storageAccount 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: 'nexttechfusion${environment}storage'
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    allowBlobPublicAccess: false
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    isHnsEnabled: true
  }
}

// Static Website Configuration
resource storageAccountStaticWebsite 'Microsoft.Storage/storageAccounts/staticSites@2021-09-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    templateLocation: '/index.html'
    errorDocument404Path: '/index.html'
  }
}

// CDN Profile
resource cdnProfile 'Microsoft.Cdn/profiles@2021-06-01' = {
  name: 'nexttechfusion-cdn-${environment}'
  location: location
  sku: {
    name: 'Standard_Microsoft'
  }
  properties: {
    // CDN profile properties
  }
}

// CDN Endpoint for Static Assets
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnProfile
  name: 'static-${environment}'
  location: location
  properties: {
    originHostHeader: '${storageAccount.name}.z13.web.core.windows.net'
    isHttpAllowed: false
    isHttpsAllowed: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    optimizationType: 'GeneralWebDelivery'
    origins: [
      {
        name: 'static-origin'
        properties: {
          hostName: '${storageAccount.name}.z13.web.core.windows.net'
          httpPort: 80
          httpsPort: 443
          originHostHeader: '${storageAccount.name}.z13.web.core.windows.net'
        }
      }
    ]
  }
}

// CDN Endpoint for API
resource cdnApiEndpoint 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnProfile
  name: 'api-${environment}'
  location: location
  properties: {
    originHostHeader: domainName
    isHttpAllowed: false
    isHttpsAllowed: true
    queryStringCachingBehavior: 'UseQueryString'
    optimizationType: 'GeneralWebDelivery'
    origins: [
      {
        name: 'api-origin'
        properties: {
          hostName: domainName
          httpPort: 80
          httpsPort: 443
          originHostHeader: domainName
        }
      }
    ]
  }
}

// Custom Domain for CDN
resource customDomain 'Microsoft.Cdn/profiles/endpoints/customDomains@2021-06-01' = {
  parent: cdnEndpoint
  name: domainName
  properties: {
    hostName: domainName
  }
}

// SSL Certificate for Custom Domain
resource sslCert 'Microsoft.Cdn/profiles/endpoints/customDomains@2021-06-01' = {
  parent: customDomain
  name: 'ssl-cert'
  properties: {
    customDomainHttpsParameters: {
      certificateSource: 'Cdn'
      minimumTlsVersion: 'TLS12'
      protocolType: 'ServerNameIndication'
    }
  }
}

// CDN Rules Engine

// URL Rewrite Rules
resource urlRewriteRule 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnEndpoint
  name: 'url-rewrite-rule'
  properties: {
    deliveryPolicy: {
      rules: [
        {
          name: 'SPA-routing'
          order: 1
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                operator: 'NotEqual'
                negateCondition: false
                matchValues: ['/api/*']
                transforms: []
              }
            }
            {
              name: 'UrlFileExtension'
              parameters: {
                operator: 'LessThan'
                negateCondition: true
                matchValues: ['*']
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'UrlRewrite'
              parameters: {
                sourcePattern: '/(.*)'
                destination: '/index.html'
                preserveUnmatchedPath: false
              }
            }
          ]
        }
      ]
    }
  }
}

// Security Headers Rule
resource securityHeadersRule 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnEndpoint
  name: 'security-headers-rule'
  properties: {
    deliveryPolicy: {
      rules: [
        {
          name: 'security-headers'
          order: 2
          conditions: []
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Strict-Transport-Security'
                value: 'max-age=31536000; includeSubDomains; preload'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'X-Content-Type-Options'
                value: 'nosniff'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'X-Frame-Options'
                value: 'DENY'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'X-XSS-Protection'
                value: '1; mode=block'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Referrer-Policy'
                value: 'strict-origin-when-cross-origin'
              }
            }
          ]
        }
      ]
    }
  }
}

// Cache Control Rules
resource cacheControlRule 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnEndpoint
  name: 'cache-control-rule'
  properties: {
    deliveryPolicy: {
      rules: [
        {
          name: 'static-assets-cache'
          order: 3
          conditions: [
            {
              name: 'UrlFileExtension'
              parameters: {
                operator: 'Equal'
                negateCondition: false
                matchValues: ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2']
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Cache-Control'
                value: 'public, max-age=31536000, immutable'
              }
            }
          ]
        }
        {
          name: 'api-no-cache'
          order: 4
          conditions: [
            {
              name: 'UrlPath'
              parameters: {
                operator: 'BeginsWith'
                negateCondition: false
                matchValues: ['/api/']
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Cache-Control'
                value: 'no-cache, no-store, must-revalidate'
              }
            }
          ]
        }
      ]
    }
  }
}

// CORS Headers for API
resource corsRule 'Microsoft.Cdn/profiles/endpoints@2021-06-01' = {
  parent: cdnApiEndpoint
  name: 'cors-rule'
  properties: {
    deliveryPolicy: {
      rules: [
        {
          name: 'cors-headers'
          order: 1
          conditions: [
            {
              name: 'RequestMethod'
              parameters: {
                operator: 'Equal'
                negateCondition: false
                matchValues: ['OPTIONS']
                transforms: []
              }
            }
          ]
          actions: [
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Allow-Origin'
                value: '*'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Allow-Methods'
                value: 'GET, POST, PUT, DELETE, OPTIONS'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Allow-Headers'
                value: 'Content-Type, Authorization, X-Requested-With'
              }
            }
            {
              name: 'ModifyResponseHeader'
              parameters: {
                headerAction: 'Overwrite'
                headerName: 'Access-Control-Max-Age'
                value: '86400'
              }
            }
          ]
        }
      ]
    }
  }
}

// WAF Policy for Security
resource wafPolicy 'Microsoft.Network/frontDoorWebApplicationFirewallPolicies@2020-11-01' = {
  name: 'nexttechfusion-waf-${environment}'
  location: 'Global'
  properties: {
    policySettings: {
      enabledState: 'Enabled'
      mode: 'Prevention'
      customBlockResponseStatusCode: 403
      customBlockResponseBody: base64('Access denied by Web Application Firewall')
    }
    customRules: [
      // Rate limiting rule
      {
        name: 'RateLimit'
        priority: 100
        ruleType: 'RateLimitRule'
        rateLimitDurationInMinutes: 1
        rateLimitThreshold: 100
        matchConditions: [
          {
            matchVariable: 'RemoteAddr'
            operator: 'IPMatch'
            negationConditon: false
            matchValues: ['*']
            transforms: []
          }
        ]
        action: 'Block'
      }
      // SQL Injection protection
      {
        name: 'SQLInjection'
        priority: 200
        ruleType: 'MatchRule'
        matchConditions: [
          {
            matchVariable: 'QueryString'
            operator: 'Contains'
            negationConditon: false
            matchValues: ['select', 'union', 'insert', 'cast', 'declare', 'drop', 'update', 'md5', 'benchmark', 'script', 'javascript', 'vbscript', 'onload', 'onerror']
            transforms: ['Lowercase', 'UrlDecode']
          }
        ]
        action: 'Block'
      }
    ]
    managedRules: {
      managedRuleSets: [
        {
          ruleSetType: 'Microsoft_DefaultRuleSet'
          ruleSetVersion: '2.1'
          ruleSetAction: 'Block'
        }
        {
          ruleSetType: 'Microsoft_BotManagerRuleSet'
          ruleSetVersion: '1.0'
          ruleSetAction: 'Block'
        }
      ]
    }
  }
}

// Associate WAF with CDN
resource cdnWafAssociation 'Microsoft.Cdn/profiles@2021-06-01' = {
  parent: cdnProfile
  name: 'waf-association'
  properties: {
    wafPolicy: {
      id: wafPolicy.id
    }
  }
}

// Monitoring and Analytics

// Diagnostic Settings for CDN
resource diagnosticSetting 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'cdn-diagnostics'
  scope: cdnProfile.id
  properties: {
    logs: [
      {
        category: 'AzureCdnAccessLog'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
    workspaceId: logAnalyticsWorkspace.id
  }
}

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2020-08-01' = {
  name: 'nexttechfusion-analytics-${environment}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights for detailed monitoring
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'nexttechfusion-appinsights-${environment}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

// Outputs
output cdnEndpointUrl string = 'https://${cdnEndpoint.hostName}'
output cdnApiEndpointUrl string = 'https://${cdnApiEndpoint.hostName}'
output storageAccountName string = storageAccount.name