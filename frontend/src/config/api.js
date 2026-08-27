export const API_BASE_URL = (
  process.env.REACT_APP_API_URL || 'https://sistema-ppgcc-api.onrender.com'
).replace(/\/$/, '');

export const PROGRAM_ID = process.env.REACT_APP_PROGRAM_ID || 'ppgcc-ufpi';
