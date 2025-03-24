import { showCustomErrorAlert } from "./Helper";

export const BASE_URL = 'http://localhost:8010/';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const refreshObj = {refreshToken: refreshToken};
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const response = await fetch(`${BASE_URL}auth/refresh`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    },
    body: JSON.stringify(refreshObj)
  });

  if (!response.ok) {
    
    throw new Error('Refresh token has expired or is invalid');
  }

  const data = await response.json();
  const newAccessToken = data.result.refreshToken;
  localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  return newAccessToken;
}

export const fetchDataFromApi = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    postData?: object
  ) => {
    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  
    const makeRequest = async (token: string|null) => {
      const baseUrl = `${BASE_URL}${url}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: postData ? JSON.stringify(postData) : null,
      };
  
      const response = await fetch(baseUrl, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      return await response.json();
    };
  
    try {
      return await makeRequest(accessToken);
    } catch (error:any) {
        if (error.message === 'Token expired! Please log in again.' || error.message=="Invalid token!") {
          try {
            accessToken = await refreshAccessToken();
          } catch (refreshError) {
              localStorage.removeItem(ACCESS_TOKEN_KEY);
              localStorage.removeItem(REFRESH_TOKEN_KEY);
              localStorage.removeItem('user');
              window.location.href = '/login';
              return;
          }

          try {
            return await makeRequest(accessToken);
          } catch (refreshError) {
              console.error('Failed to refresh token:', refreshError);
              return;
          }
        } else {
          showCustomErrorAlert(error.message);
        }
    }
};

export const uploadToApi = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  postData: FormData
) => {
  let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  const makeRequest = async (token: string|null) => {
    const baseUrl = `${BASE_URL}${url}`;
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: postData
    };

    const response = await fetch(baseUrl, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Network response was not ok');
    }
    return await response.json();
  };

  try {
    return await makeRequest(accessToken);
  } catch (error:any) {
      if (error.message === 'Token expired! Please log in again.' || error.message=="Invalid token!") {
        try {
            accessToken = await refreshAccessToken();
            return await makeRequest(accessToken);
        } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            //window.location.href = '/login';
            return;
        }
      } else {
        showCustomErrorAlert(error.message);
      }
  }
};