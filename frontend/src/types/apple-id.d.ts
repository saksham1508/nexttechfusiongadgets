// Apple ID SDK TypeScript declarations

export interface AppleIDConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  usePopup: boolean;
}

export interface AppleIDUser {
  email?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface AppleIDAuthorization {
  id_token: string;
  code: string;
}

export interface AppleIDAuthResponse {
  authorization: AppleIDAuthorization;
  user?: AppleIDUser;
}

export interface AppleIDAuth {
  init: (config: AppleIDConfig) => void;
  signIn: (config?: any) => Promise<AppleIDAuthResponse>;
}

export interface AppleIDSDK {
  auth: AppleIDAuth;
}

declare global {
  interface Window {
    AppleID: AppleIDSDK;
  }
}

export {};