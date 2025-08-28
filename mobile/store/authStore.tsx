import { create } from 'zustand'
import  AsyncStorage  from '@react-native-async-storage/async-storage'
import BASE_URL from '@/constants/url';

type User = {
    _id: string;
    username: string;
    email: string;
    profileImage: string;
    createdAt: string;
    // add other user fields as needed
};

type AuthStore = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<{ success: boolean; message?: string }>;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
};

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: false,

    register: async (_username: string, _email: string, _password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: _username, email: _email, password: _password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            console.log("data from register:", data);
            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            await AsyncStorage.setItem('token', data.jwt);
            set({ token: data.jwt, user: data.user, isLoading: false });

            return { success: true };
        } catch (error) {
            console.log("Error in register:", error);
            let message = 'An error occurred';
            if (error instanceof Error) {
                message = error.message;
            }
            return { success: false, message };
        } finally {
            set({ isLoading: false });
        }
    },

    checkAuth: async() => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            set({ token, user });
        } catch (error) {
            console.log("Error checking auth:", error);
        }
    },
    logout: async() => {
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        set({ token: null, user: null });
    },
    login: async(email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            await AsyncStorage.setItem('user', JSON.stringify(data.user));
            await AsyncStorage.setItem('token', data.jwt);
            set({ token: data.jwt, user: data.user });

            return { success: true };
        } catch (error) {
            console.log("Error in login:", error);
            return { success: false, message: (error as Error).message || 'An error occurred at login.' };
        } finally {
            set({isLoading: false})
        }

    }

}));