import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { checkAuthentication } from '../utils/authHelpers';

const AuthTestComponent: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const authResult = checkAuthentication(user);
  
  // Get raw localStorage data
  const rawUser = localStorage.getItem('user');
  const rawToken = localStorage.getItem('token');
  
  let parsedUserData = null;
  try {
    if (rawUser) {
      parsedUserData = JSON.parse(rawUser);
    }
  } catch (error) {
    parsedUserData = { error: 'Failed to parse' };
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm max-h-96 overflow-y-auto">
      <h3 className="font-bold text-lg mb-2">Auth Debug</h3>
      <div className="space-y-2 text-xs">
        <div>
          <strong>Redux User:</strong> {user ? '✅ Present' : '❌ None'}
        </div>
        <div>
          <strong>Redux User ID:</strong> {user?._id || 'None'}
        </div>
        <div>
          <strong>Redux User Name:</strong> {user?.name || 'None'}
        </div>
        <div>
          <strong>Raw Token:</strong> {rawToken ? '✅ Present' : '❌ None'}
        </div>
        <div>
          <strong>Raw User:</strong> {rawUser ? '✅ Present' : '❌ None'}
        </div>
        {parsedUserData && (
          <div>
            <strong>Parsed User Structure:</strong>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(parsedUserData, null, 2)}
            </pre>
          </div>
        )}
        <div className={`font-bold ${authResult.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          <strong>Final Auth Result:</strong> {authResult.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
        </div>
        {authResult.error && (
          <div className="text-red-600">
            <strong>Error:</strong> {authResult.error}
          </div>
        )}
        <div>
          <strong>Final User ID:</strong> {authResult.user?._id || (authResult.user as any)?.id || 'None'}
        </div>
        <div>
          <strong>Final User Name:</strong> {authResult.user?.name || 'None'}
        </div>
        <div>
          <strong>Final Token:</strong> {authResult.token ? '✅ Present' : '❌ None'}
        </div>
        {authResult.token && (
          <div>
            <strong>Token Preview:</strong> {authResult.token.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTestComponent;