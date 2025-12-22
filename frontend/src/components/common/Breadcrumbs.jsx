import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Skip rendering on dashboard home pages to avoid clutter
    if (pathnames.length === 0 || (pathnames.length === 2 && pathnames[1] === 'dashboard')) {
        return null;
    }

    return (
        <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
            <Link to="/" className="hover:text-secondary transition-colors">
                <Home size={16} />
            </Link>
            {pathnames.map((value, index) => {
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                // Format the label: capitalize and remove hyphens
                const label = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={14} className="mx-2 text-slate-300" />
                        {isLast ? (
                            <span className="text-secondary font-bold">{label}</span>
                        ) : (
                            <Link to={to} className="hover:text-secondary transition-colors">
                                {label}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
