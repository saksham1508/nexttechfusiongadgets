// Cookie Policy Page
import React from 'react';
import { Shield, Cookie, Eye, Target, Settings, Calendar, Trash2 } from 'lucide-react';
import { useCookieConsent } from '../hooks/useCookieConsent';

const CookiePolicyPage: React.FC = () => {
  const { preferences, hasConsent, consentDate, clearConsent } = useCookieConsent();

  const cookieTypes = [
    {
      icon: Shield,
      title: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly and cannot be disabled.',
      examples: [
        'Authentication tokens',
        'Shopping cart contents',
        'Security settings',
        'Session management'
      ],
      retention: 'Session or up to 30 days',
      enabled: preferences.necessary
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'These cookies enhance your experience by remembering your preferences.',
      examples: [
        'Language preferences',
        'Theme settings',
        'Chat widget preferences',
        'User interface customizations'
      ],
      retention: 'Up to 1 year',
      enabled: preferences.functional
    },
    {
      icon: Eye,
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: [
        'Google Analytics',
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring'
      ],
      retention: 'Up to 2 years',
      enabled: preferences.analytics
    },
    {
      icon: Target,
      title: 'Marketing Cookies',
      description: 'These cookies are used for advertising and tracking marketing effectiveness.',
      examples: [
        'Facebook Pixel',
        'Google Ads tracking',
        'Retargeting pixels',
        'Conversion tracking'
      ],
      retention: 'Up to 2 years',
      enabled: preferences.marketing
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Cookie className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about how NextTechFusionGadgets uses cookies to enhance your browsing experience
          </p>
        </div>

        {/* Current Cookie Status */}
        {hasConsent && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Cookie Preferences</h2>
              <button
                onClick={clearConsent}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Reset Preferences</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.necessary ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-gray-900">Necessary</p>
                <p className="text-xs text-gray-600">Always On</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.functional ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-gray-900">Functional</p>
                <p className="text-xs text-gray-600">{preferences.functional ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.analytics ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-gray-900">Analytics</p>
                <p className="text-xs text-gray-600">{preferences.analytics ? 'Enabled' : 'Disabled'}</p>
              </div>
              
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${preferences.marketing ? 'bg-green-500' : 'bg-gray-300'}`} />
                <p className="text-sm font-medium text-gray-900">Marketing</p>
                <p className="text-xs text-gray-600">{preferences.marketing ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            
            {consentDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Preferences saved on {new Date(consentDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}

        {/* What are cookies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What are cookies?</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide a better user experience.
            </p>
            <p className="text-gray-600 mb-4">
              Cookies contain information about your preferences and activities on the website. They help us remember 
              your settings, keep you logged in, and provide personalized content and advertisements.
            </p>
            <p className="text-gray-600">
              You can control and manage cookies through your browser settings. However, please note that disabling 
              certain cookies may affect the functionality of our website.
            </p>
          </div>
        </div>

        {/* Cookie Types */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Types of cookies we use</h2>
          
          {cookieTypes.map((type, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-lg ${
                  type.enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <type.icon className={`h-6 w-6 ${
                    type.enabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      type.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {type.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{type.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Examples:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {type.examples.map((example, idx) => (
                          <li key={idx} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Data Retention:</h4>
                      <p className="text-sm text-gray-600">{type.retention}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Third-party services */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-party services</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Google Analytics</h3>
              <p className="text-gray-600 mb-2">
                We use Google Analytics to analyze website traffic and user behavior. This helps us improve our website and services.
              </p>
              <p className="text-sm text-gray-500">
                Learn more: <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Facebook Pixel</h3>
              <p className="text-gray-600 mb-2">
                We use Facebook Pixel to measure the effectiveness of our advertising campaigns and provide personalized ads.
              </p>
              <p className="text-sm text-gray-500">
                Learn more: <a href="https://www.facebook.com/privacy/explanation" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Managing cookies */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing your cookies</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              You can control cookies in several ways:
            </p>
            <ul className="text-gray-600 space-y-2 mb-4">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 mt-2" />
                <span><strong>Browser Settings:</strong> Most browsers allow you to view, manage, and delete cookies through their settings.</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 mt-2" />
                <span><strong>Cookie Banner:</strong> Use our cookie consent banner to customize your preferences.</span>
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 mt-2" />
                <span><strong>Opt-out Tools:</strong> Use industry opt-out tools for advertising cookies.</span>
              </li>
            </ul>
            <p className="text-gray-600">
              Please note that disabling cookies may affect your experience on our website and limit access to certain features.
            </p>
          </div>
        </div>

        {/* Contact information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions about cookies?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our use of cookies or this cookie policy, please contact us:
          </p>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> privacy@nexttechfusiongadgets.com</p>
            <p><strong>Address:</strong> 123 Tech Street, Innovation City, TC 12345</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;