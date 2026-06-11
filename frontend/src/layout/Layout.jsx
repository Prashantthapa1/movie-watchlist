import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
    const location = useLocation();
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="min-h-screen">
                <div className={ "w-full px-1" }>
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;