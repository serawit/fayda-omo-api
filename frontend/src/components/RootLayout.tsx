import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const RootLayout = () => {
    return (
        /**
         * 1. flex-col: The primary spine of the app. Stacks Header, Main, and Footer.
         * 2. min-h-screen: Ensures Footer is always at the bottom of the viewport.
         */
        <div className="flex flex-col min-h-screen home-background font-sans antialiased selection:bg-[#00adef]/20">
            
            {/* STICKY HEADER: Spans full width, content centered inside via Navbar */}
            <Navbar />
            
            {/* 
                MAIN CONTENT AREA:
                - flex-grow: Takes up all available space between Header and Footer.
                - grid place-items-center: Robustly centers the content (Home Card) in the middle.
            */}
            <main className="flex-grow w-full px-4 py-12 pt-24 grid place-items-center">
                <Suspense 
                    fallback={
                        <div className="flex flex-col items-center justify-center w-full min-h-[40vh]">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#00adef] border-r-transparent border-l-transparent border-b-2"></div>
                            <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#00adef] opacity-60">Secure Loading</span>
                        </div>
                    }
                >
                    {/* 
                        The Outlet renders the Home.tsx. 
                        Because of the flex-center above, the card will never 'stretch' 
                        or stack vertically with the header/footer incorrectly.
                    */}
                    <Outlet />
                </Suspense>
            </main>

            {/* PROFESSIONAL FOOTER: Stays at the bottom */}
            <Footer />
        </div>
    );
};

export default RootLayout;
