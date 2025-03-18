import { useState } from "react";

interface QuantitySelectorProps {
    size?: "small" | "medium" | "large";
}

export const QuantitySelector = ({ size = "medium" }: QuantitySelectorProps) => {
    const [quantity, setQuantity] = useState(1);

    const increase = () => {
        if (quantity < 99) setQuantity(quantity + 1);
    };

    const decrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const sizeClasses = {
        small: "px-2 py-1 w-10 h-10 text-base",
        medium: "px-4 py-2 w-12 h-12 text-xl",
        large: "px-6 py-3 w-14 h-14 text-2xl",
    };

    return (
        <div className="flex flex-row items-center gap-3">
            <div className="flex items-center">
                <button
                    className={`bg-gray-200 hover:bg-gray-200 transition ${sizeClasses[size]}`}
                    onClick={decrease}>
                    <div className="text-2xl">-</div>
                </button>
                
                <div className={`text-center ${sizeClasses[size]}`}>{quantity}</div>
                
                <button
                    className={`bg-gray-200 hover:bg-gray-200 transition ${sizeClasses[size]}`}
                    onClick={increase}>
                    <div className="text-2xl">+</div>
                </button>
            </div>
        </div>
    );
};
