import { PROGRAM_ID } from '../config/api';
import { publicRequest } from './apiClient';

const endpoints = {
  docentes: 'faculty',
  producoes: 'productions',
  orientacoes: 'advising',
  projetos: 'projects',
  formacoes: 'education',
};

let publicDataPromise = null;

export const loadPublicData = () => {
  if (!publicDataPromise) {
    publicDataPromise = Promise.all(
      Object.entries(endpoints).map(async ([key, endpoint]) => [
        key,
        await publicRequest(
          `/api/public/${endpoint}?program=${encodeURIComponent(PROGRAM_ID)}`,
        ),
      ]),
    )
      .then(Object.fromEntries)
      .catch((error) => {
        publicDataPromise = null;
        throw error;
      });
  }

  return publicDataPromise;
};
