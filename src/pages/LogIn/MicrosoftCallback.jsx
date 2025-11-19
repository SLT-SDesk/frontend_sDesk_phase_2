import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginWithMicrosoftFailure, loginWithMicrosoftRequest } from '../../redux/auth';


function MicrosoftCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code) {
      dispatch(loginWithMicrosoftFailure('No authorization code found'));
      return;
    }    const appUrl = (import.meta.env.VITE_APP_URL).replace(/\/$/, '');
    
    dispatch(loginWithMicrosoftRequest({ 
      code, 
      state, 
      redirect_uri: `${appUrl}/auth/callback` 
    }));
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/AdminDashBoard');
      } else if (user.role === 'user') {
        navigate('/user');
      } else if (user.role === 'technician') {
        navigate('/technician');
      }
      else if (user.role === 'superAdmin') {
        navigate('/superAdmin');
      }
    }
  }, [user, navigate]);

  if (loading) return <div>Signing you in with Microsoft...</div>;
  if (error) return <div>Error: {error}</div>;
  return null;
}

export default MicrosoftCallback;