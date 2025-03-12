import logoShopee from "../../assets/logo_shopee_1.png";

interface Product {
    id: number;
    Name: string;
    image: string;
    price: number;
}

interface SearchProductDisplayProps {
    products: Product[];
}

export const ProductDisplay = ({ products }: SearchProductDisplayProps) => {
    return (
        <div className="relative my-5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(188px,2fr))] gap-1">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white shadow-md p-3 flex flex-col h-full justify-between group relative transition-all duration-300 ease-in-out border-2 border-transparent hover:border-orange-500 cursor-pointer"
                    >
                        <div className="flex flex-col justify-start flex-grow">
                            <div className="flex items-center justify-center">
                                <img
                                    src={product.image || logoShopee}
                                    alt={product.Name}
                                    className="w-auto h-30 mx-auto object-cover"
                                />
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1">
                                    -3%
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-left text-ellipsis overflow-hidden">
                                {product.Name}
                            </p>
                        </div>

                        <div className="flex flex-col mt-2">
                            <div className="flex gap-1">
                                <p className="mt-2 text-xs border border-red-500 px-1 text-red-500">
                                    Rẻ vô địch
                                </p>
                                <p className="mt-2 text-xs border w-auto flex justify-center text-white bg-orange-500 px-1">
                                    7% Giảm
                                </p>
                            </div>
                            <div className="flex flex-row justify-between">
                                <p className="mt-2 text-xs">{product.price}</p>
                                <p className="mt-2 text-xs">Đã bán 2.5k</p>
                            </div>
                        </div>

                        <button className="absolute bottom-[-33px] left-[-1.5px] z-10 w-[208.5px] py-2 bg-orange-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
                            Tìm sản phẩm tương tự
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};