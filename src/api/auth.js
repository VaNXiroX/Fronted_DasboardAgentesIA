import apiClient from './client';

/**
 * Login: POST /auth/login
 * Retorna { access_token, token_type }
 */
export async function login(username, password) {
  // FastAPI espera form-data para OAuth2PasswordRequestForm
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);

  const { data } = await apiClient.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data; // { access_token, token_type }
}

/**
 * Obtener usuario actual: GET /auth/me
 * Requiere header Authorization: Bearer <token>
 */
export async function getMe(token) {
  const { data } = await apiClient.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
