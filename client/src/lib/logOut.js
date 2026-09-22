import api from './apiConfig';
import { toast } from 'react-hot-toast';
import { errorToastOptions, successToastOptions } from './toastConfig';
import { setAccessToken } from './apiConfig';

export const logoutUser = async ({ logout, navigate }) => {
    try {
        const response = await api.post('/auth/logout');
        toast.success(response?.data?.message, successToastOptions);
    } catch (error) {
        console.error('Logout error:', error);
        toast.error('Your local session was cleared', errorToastOptions);
    } finally {
        setAccessToken(null);
        await logout();
        navigate('/signin');
    }
};

export default logoutUser;