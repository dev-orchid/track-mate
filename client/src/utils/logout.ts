import Cookies from "js-cookie";
import { useRouter } from "next/router";

export function useLogout() {
    const router = useRouter();

    const logout = () => {
        // Remove token from cookies and localStorage
        Cookies.remove("authToken");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refresh_token");        

        // Optional: clear other user data
        sessionStorage.clear();

        // Redirect to login page
        router.push("/login");
    };

    return logout;
}
