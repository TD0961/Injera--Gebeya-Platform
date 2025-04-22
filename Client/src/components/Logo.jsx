import React from 'react';
import { Utensils } from 'lucide-react';

const Logo = (props) => {
    const { className = '', textClassName = '' } = props;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <Utensils className="h-8 w-8 text-amber-600" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full" />
            </div>
            <span className={`text-2xl font-bold ${textClassName || 'text-amber-800'}`}>
                Injera Gebeya
            </span>
        </div>
    );
};

export default Logo;