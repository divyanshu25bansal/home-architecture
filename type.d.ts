interface AuthState{
    isSignedIn: boolean,
    userName: string | null,
    userId: string | null,
};

type AuthContext = {
    isSignedIn: boolean,
    userName: string | null,
    userId: string | null,
    refreshAuth: () => Promise<Boolean>,
    signIn: () => Promise<Boolean>,
    signOut: () => Promise<Boolean>,
};