export const tokenService = {
  getAccessToken: () => localStorage.getItem('depot_access_token'),
  setAccessToken: (token: string) => localStorage.setItem('depot_access_token', token),
  getRefreshToken: () => localStorage.getItem('depot_refresh_token'),
  setRefreshToken: (token: string) => localStorage.setItem('depot_refresh_token', token),
  clearTokens: () => {
    localStorage.removeItem('depot_access_token');
    localStorage.removeItem('depot_refresh_token');
  },
};
