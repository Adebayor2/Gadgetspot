import api from './apiConfig';
import { toast } from 'react-hot-toast';
import { errorToastOptions, successToastOptions } from './toastConfig';
import { setAccessToken } from './apiConfig';

export const logoutUser = async ({ logout, navigate }) => {
    try {
        const response = await api.post('/auth/logout');
        setAccessToken(null);
        logout();
        navigate('/signin');
        toast.success(response?.data?.message, successToastOptions);
    } catch (error) {
        console.error('Logout error:', error);
        toast.error('Error logging out', errorToastOptions);
    }
};

export default logoutUser;