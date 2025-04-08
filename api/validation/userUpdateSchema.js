import * as yup from 'yup';

export const userUpdateSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Must be at least 3 characters long')
    .required('Username is required'),
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required'),
});
