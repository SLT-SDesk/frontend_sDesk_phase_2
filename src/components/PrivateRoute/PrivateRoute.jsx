import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLoggedUserRequest, refreshTokenRequest } from '../../redux/auth/authSlice';

const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  const { isLoggedIn, loading, authInitialized } = useAppSelector(
    (state) => state.auth
  );

  const hasJwtCookie = document.cookie.includes('jwt');

  useEffect(() => {
    if (!authInitialized && !loading) {
      if (hasJwtCookie) {
        dispatch(fetchLoggedUserRequest());
      } else {
        dispatch(refreshTokenRequest());
      }
    }
  }, [authInitialized, loading, dispatch, hasJwtCookie]);

  if (!authInitialized || loading) {
    return <div>Loading...</div>;
  }

  // ONLY check authentication
  if (!isLoggedIn) {
    return <Navigate to="/LogIn" replace />;
  }

  return <Outlet />;
};


export default PrivateRoute;