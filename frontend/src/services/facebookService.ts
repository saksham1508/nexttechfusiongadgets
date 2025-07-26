declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

class FacebookService {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      try {
        // Load Facebook SDK if not already loaded
        if (!document.getElementById('facebook-jssdk')) {
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.crossOrigin = 'anonymous';
          document.head.appendChild(script);
        }

        // Initialize Facebook SDK
        window.fbAsyncInit = () => {
          const appId = process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id';
          
          if (window.FB) {
            window.FB.init({
              appId: appId,
              cookie: true,
              xfbml: true,
              version: 'v18.0'
            });
            
            this.isInitialized = true;
            resolve();
          } else {
            reject(new Error('Facebook SDK failed to load'));
          }
        };

        // If FB is already loaded, initialize immediately
        if (window.FB) {
          window.fbAsyncInit();
        }
      } catch (error) {
        reject(error);
      }
    });

    return this.initPromise;
  }

  async login(): Promise<any> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not initialized'));
        return;
      }

      window.FB.login((response: any) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('Facebook login failed'));
        }
      }, { scope: 'email,public_profile' });
    });
  }

  async logout(): Promise<void> {
    await this.initialize();
    
    return new Promise((resolve) => {
      if (window.FB) {
        window.FB.logout(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async getLoginStatus(): Promise<any> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not initialized'));
        return;
      }

      window.FB.getLoginStatus((response: any) => {
        resolve(response);
      });
    });
  }

  async getUserInfo(): Promise<any> {
    await this.initialize();
    
    return new Promise((resolve, reject) => {
      if (!window.FB) {
        reject(new Error('Facebook SDK not initialized'));
        return;
      }

      window.FB.api('/me', { fields: 'name,email,picture' }, (response: any) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(new Error('Failed to get user info'));
        }
      });
    });
  }
}

export const facebookService = new FacebookService();
export default facebookService;