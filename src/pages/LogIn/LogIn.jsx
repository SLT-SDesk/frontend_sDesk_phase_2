import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuthState } from '../../redux/auth/authSlice';
import './LogIn.css';
import SLTMobitelLogo from './SLTMobitel_Logo.png';

function LogIn() {
const dispatch = useDispatch();
const { loading, error } = useSelector((state) => state.auth);

useEffect(() => {
    dispatch(resetAuthState());
}, [dispatch]);

const handleMicrosoftLogin = () => {
   


    const appUrl = (import.meta.env.VITE_APP_URL).replace(/\/$/, '');

    const params = new URLSearchParams({
        client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
        response_type: 'code',
        redirect_uri: `${appUrl}/auth/callback`,
        response_mode: 'query',
        scope: 'openid profile email User.Read',
        state: '12345',
    });
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;



    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
};

return (
    <div className="signup-container">
        
        <div className="slt-header">
            <div className="slt-logo">
                <img 
                    src={SLTMobitelLogo} 
                    alt="SLTMOBITEL Logo" 
                    className="slt-logo-image"
                />
            </div>
        </div>

        <div className="signup-card">
            <h3 className="signup-title">Sign In</h3>
            <p className="login-subtitle">Access your SLTMOBITEL account</p>
            
            <button
                type="button"
                className="register-button"
                onClick={handleMicrosoftLogin}
                disabled={loading}
            >
                <div className="microsoft-icon">
                    <div className="microsoft-square red-square"></div>
                    <div className="microsoft-square green-square"></div>
                    <div className="microsoft-square blue-square"></div>
                    <div className="microsoft-square yellow-square"></div>
                </div>
                {loading ? 'Processing...' : 'Login with Microsoft'}
            </button>
            
            {error && <p className="error">{error}</p>}
        </div>
    </div>
);
}

export default LogIn;