
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart';
import { toast } from 'sonner';
import { convertMarketplaceProductToCartItem } from '@/hooks/cart/cartUtils';
import { formatIndianRupees } from '@/utils/invoice/formatUtils';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  seller: string;
  sellerId: string;
  rating: number;
  image: string;
  expiryDate: string;
  discountPercentage?: number;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  showExpiryAlerts: boolean;
  getAiExpiryAlert: (days: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  showExpiryAlerts,
  getAiExpiryAlert 
}) => {
  const { addToCart } = useCart();
  
  const calculateDaysToExpiry = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysToExpiry = product.expiryDate ? calculateDaysToExpiry(product.expiryDate) : null;
  const showAlert = showExpiryAlerts && daysToExpiry !== null && daysToExpiry <= 7;

  const handleAddToCart = () => {
    const cartItem = convertMarketplaceProductToCartItem(product);
    addToCart(cartItem);
    toast.success(`${product.name} added to cart`);
    onAddToCart(product);
  };

  const getExpiryAlertColor = (): string => {
    if (!daysToExpiry || daysToExpiry > 5) return 'bg-amber-50 text-amber-800';
    if (daysToExpiry > 2) return 'bg-orange-50 text-orange-800';
    return 'bg-red-50 text-red-800';
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      className="rounded-lg overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow"
      variants={cardVariants}
    >
      {/* Product Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        
        {/* Discount Tag */}
        {product.discountPercentage && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {product.discountPercentage}% OFF
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        
        <div className="flex justify-between items-center mt-1">
          <div>
            <span className="text-lg font-semibold">INR {product.price}</span>
          </div>
          
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-1">{product.seller}</p>
        
        {/* Expiry Alert */}
        {showAlert && (
          <div className={`mt-3 p-2 rounded-md ${getExpiryAlertColor()} flex items-center text-xs`}>
            <Clock className="h-3 w-3 mr-1" />
            <span>
              {daysToExpiry === 0 ? "Expires today!" : 
               daysToExpiry === 1 ? "Expires tomorrow!" :
               `Expires in ${daysToExpiry} days`}
            </span>
          </div>
        )}
        
        {/* AI-generated expiry insight */}
        {showAlert && daysToExpiry !== null && (
          <p className="text-xs italic text-gray-500 mt-1">
            {getAiExpiryAlert(daysToExpiry)}
          </p>
        )}
        
        {/* Add to Cart Button */}
        <Button 
          className="w-full mt-4 flex items-center justify-center"
          variant="default"
          onClick={handleAddToCart}
          disabled={product.inStock === false}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
