import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Phone, MapPin, Clock, Plus, Minus, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/kirana-hero.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  rating: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
}

const products: Product[] = [
  { id: 1, name: "Basmati Rice", price: 120, unit: "kg", category: "Grains", inStock: true, rating: 4.5 },
  { id: 2, name: "Whole Wheat Flour", price: 45, unit: "kg", category: "Grains", inStock: true, rating: 4.3 },
  { id: 3, name: "Toor Dal", price: 85, unit: "kg", category: "Pulses", inStock: true, rating: 4.4 },
  { id: 4, name: "Refined Oil", price: 110, unit: "L", category: "Oils", inStock: true, rating: 4.2 },
  { id: 5, name: "Onions", price: 25, unit: "kg", category: "Vegetables", inStock: true, rating: 4.1 },
  { id: 6, name: "Potatoes", price: 20, unit: "kg", category: "Vegetables", inStock: true, rating: 4.0 },
  { id: 7, name: "Tomatoes", price: 35, unit: "kg", category: "Vegetables", inStock: true, rating: 4.2 },
  { id: 8, name: "Milk", price: 50, unit: "L", category: "Dairy", inStock: true, rating: 4.6 },
  { id: 9, name: "Eggs", price: 6, unit: "piece", category: "Dairy", inStock: true, rating: 4.3 },
  { id: 10, name: "Bread", price: 25, unit: "loaf", category: "Bakery", inStock: true, rating: 4.1 },
  { id: 11, name: "Sugar", price: 42, unit: "kg", category: "Essentials", inStock: true, rating: 4.2 },
  { id: 12, name: "Salt", price: 18, unit: "kg", category: "Essentials", inStock: true, rating: 4.4 },
];

const Index = () => {
  const [customerName, setCustomerName] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const updateQuantity = (product: Product, quantity: number) => {
    if (quantity === 0) {
      setOrderItems(prev => prev.filter(item => item.product.id !== product.id));
    } else {
      setOrderItems(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.product.id === product.id ? { ...item, quantity } : item
          );
        } else {
          return [...prev, { product, quantity }];
        }
      });
    }
  };

  const getItemQuantity = (productId: number) => {
    return orderItems.find(item => item.product.id === productId)?.quantity || 0;
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (!customerName.trim()) {
      toast({
        title: "Please enter your name",
        description: "We need your name to process the order.",
        variant: "destructive"
      });
      return;
    }

    if (orderItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add some items to your order.",
        variant: "destructive"
      });
      return;
    }

    const orderText = `🛒 *New Order from ${customerName}*\n\n` +
      orderItems.map(item => 
        `• ${item.product.name} - ${item.quantity} ${item.product.unit} @ ₹${item.product.price}/${item.product.unit} = ₹${item.product.price * item.quantity}`
      ).join('\n') +
      `\n\n*Total Amount: ₹${getTotalAmount()}*\n\n` +
      `Please confirm the order and let me know the delivery time.\n\n` +
      `Customer: ${customerName}`;

    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(orderText)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Order placed successfully!",
      description: "You will be redirected to WhatsApp to confirm your order.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[500px] bg-hero-gradient flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 text-center text-white animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Sharma Ji's <span className="text-secondary">Kirana Store</span>
          </h1>
          <p className="text-xl md:text-2xl mb-6">Fresh • Quality • Affordable</p>
          <p className="text-lg opacity-90">Your neighborhood grocery store with the best prices</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Order Form */}
        <Card className="mb-8 shadow-card animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="text-primary" />
              Place Your Order
            </CardTitle>
            <CardDescription>
              Enter your details and select items to place an order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProducts.map(product => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow animate-fade-in">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">{product.rating}</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">₹{product.price}</span>
                  <span className="text-sm text-muted-foreground">/{product.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(product, Math.max(0, getItemQuantity(product.id) - 1))}
                      disabled={getItemQuantity(product.id) === 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {getItemQuantity(product.id)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(product, getItemQuantity(product.id) + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge variant={product.inStock ? "default" : "destructive"}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <Card className="mb-8 shadow-card animate-scale-in">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {orderItems.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <span>{item.product.name} x {item.quantity} {item.product.unit}</span>
                    <span className="font-medium">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{getTotalAmount()}</span>
              </div>
              <Button 
                onClick={handlePlaceOrder}
                className="w-full mt-4 bg-fresh-gradient hover:opacity-90 text-white"
                size="lg"
              >
                Place Order via WhatsApp
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="text-primary" />
                Store Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Shop No. 15, Green Market Complex<br />
                Sector 21, Dwarka<br />
                New Delhi - 110075
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="text-primary" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Open: 7:00 AM - 10:00 PM
                </p>
                <p className="text-muted-foreground">Daily</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
