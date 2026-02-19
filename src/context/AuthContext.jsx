import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [staff, setStaff] = useState(() => {
        const s = localStorage.getItem('staff');
        return s ? JSON.parse(s) : null;
    });
    const navigate = useNavigate();

    const login = useCallback(async (username, password) => {
        const res = await apiLogin(username, password);
        const { access_token } = res.data;
        localStorage.setItem('token', access_token);
        // Decode basic payload for display
        const payload = JSON.parse(atob(access_token.split('.')[1]));
        const staffData = { username: payload.sub, role: payload.role };
        localStorage.setItem('staff', JSON.stringify(staffData));
        setToken(access_token);
        setStaff(staffData);
        navigate('/');
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('staff');
        setToken(null);
        setStaff(null);
        navigate('/login');
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ token, staff, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
