import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Phone, MapPin, Clock, Star, Settings } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import heroImage from "@/assets/kirana-hero.jpg";

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
  rating: number;
  availableUnits: string[];
}

interface OrderItem {
  product: Product;
  quantity: number;
  selectedUnit: string;
}

// Unit conversion factors (base unit prices are in kg/L)
const unitConversions: { [key: string]: number } = {
  'kg': 1,
  'gram': 1000,
  'L': 1,
  'ml': 1000
};

const products: Product[] = [
  { id: 1, name: "Basmati Rice", price: 120, unit: "kg", category: "Grains", inStock: true, rating: 4.5, availableUnits: ["kg", "gram"] },
  { id: 2, name: "Whole Wheat Flour", price: 45, unit: "kg", category: "Grains", inStock: true, rating: 4.3, availableUnits: ["kg", "gram"] },
  { id: 3, name: "Toor Dal", price: 85, unit: "kg", category: "Pulses", inStock: true, rating: 4.4, availableUnits: ["kg", "gram"] },
  { id: 4, name: "Refined Oil", price: 110, unit: "L", category: "Oils", inStock: true, rating: 4.2, availableUnits: ["L", "ml"] },
  { id: 5, name: "Onions", price: 25, unit: "kg", category: "Vegetables", inStock: true, rating: 4.1, availableUnits: ["kg", "gram"] },
  { id: 6, name: "Potatoes", price: 20, unit: "kg", category: "Vegetables", inStock: true, rating: 4.0, availableUnits: ["kg", "gram"] },
  { id: 7, name: "Tomatoes", price: 35, unit: "kg", category: "Vegetables", inStock: true, rating: 4.2, availableUnits: ["kg", "gram"] },
  { id: 8, name: "Milk", price: 50, unit: "L", category: "Dairy", inStock: true, rating: 4.6, availableUnits: ["L", "ml"] },
  { id: 9, name: "Eggs", price: 6, unit: "piece", category: "Dairy", inStock: true, rating: 4.3, availableUnits: ["piece"] },
  { id: 10, name: "Bread", price: 25, unit: "loaf", category: "Bakery", inStock: true, rating: 4.1, availableUnits: ["loaf"] },
  { id: 11, name: "Sugar", price: 42, unit: "kg", category: "Essentials", inStock: true, rating: 4.2, availableUnits: ["kg", "gram"] },
  { id: 12, name: "Salt", price: 18, unit: "kg", category: "Essentials", inStock: true, rating: 4.4, availableUnits: ["kg", "gram"] },
];

const Index = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { toast } = useToast();

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const updateQuantity = (product: Product, quantity: number, selectedUnit: string) => {
    if (quantity === 0 || isNaN(quantity)) {
      setOrderItems(prev => prev.filter(item => item.product.id !== product.id));
    } else {
      setOrderItems(prev => {
        const existingItem = prev.find(item => item.product.id === product.id);
        if (existingItem) {
          return prev.map(item =>
            item.product.id === product.id ? { ...item, quantity, selectedUnit } : item
          );
        } else {
          return [...prev, { product, quantity, selectedUnit }];
        }
      });
    }
  };

  const getItemQuantity = (productId: number) => {
    return orderItems.find(item => item.product.id === productId)?.quantity || 0;
  };

  const getItemUnit = (productId: number) => {
    return orderItems.find(item => item.product.id === productId)?.selectedUnit || products.find(p => p.id === productId)?.unit || '';
  };

  const calculateItemPrice = (product: Product, quantity: number, selectedUnit: string) => {
    const basePrice = product.price;
    const baseUnit = product.unit;
    
    // If units are the same, no conversion needed
    if (baseUnit === selectedUnit) {
      return basePrice * quantity;
    }
    
    // Convert price based on unit
    const conversionFactor = unitConversions[selectedUnit] / unitConversions[baseUnit];
    const pricePerSelectedUnit = basePrice / conversionFactor;
    return pricePerSelectedUnit * quantity;
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => 
      total + calculateItemPrice(item.product, item.quantity, item.selectedUnit), 0
    );
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

    if (!customerAddress.trim()) {
      toast({
        title: "Please enter your address",
        description: "We need your delivery address to process the order.",
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
      orderItems.map(item => {
        const totalPrice = calculateItemPrice(item.product, item.quantity, item.selectedUnit);
        const basePrice = item.product.price;
        const baseUnit = item.product.unit;
        
        // Calculate price per selected unit
        const conversionFactor = unitConversions[item.selectedUnit] / unitConversions[baseUnit];
        const pricePerSelectedUnit = basePrice / conversionFactor;
        
        return `• ${item.product.name} - ${item.quantity} ${item.selectedUnit} @ ₹${pricePerSelectedUnit.toFixed(2)}/${item.selectedUnit} = ₹${totalPrice.toFixed(2)}`;
      }).join('\n') +
      `\n\n*Total Amount: ₹${getTotalAmount().toFixed(2)}*\n\n` +
      `📍 *Delivery Address:*\n${customerAddress}\n\n` +
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
      {/* Navigation */}
      <nav className="absolute top-4 right-4 z-20">
        <Link to="/admin">
          <Button variant="outline" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </nav>

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
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Address</label>
                <Input
                  placeholder="Enter your complete address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
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

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Quantity</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0"
                        value={getItemQuantity(product.id) || ''}
                        onChange={(e) => {
                          const quantity = parseFloat(e.target.value) || 0;
                          const selectedUnit = getItemUnit(product.id);
                          updateQuantity(product, quantity, selectedUnit);
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium mb-1">Unit</label>
                      <Select 
                        value={getItemUnit(product.id)} 
                        onValueChange={(value) => {
                          const quantity = getItemQuantity(product.id);
                          if (quantity > 0) {
                            updateQuantity(product, quantity, value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.availableUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge variant={product.inStock ? "default" : "destructive"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                    
                    {getItemQuantity(product.id) > 0 && (
                      <div className="text-sm">
                        <span className="font-medium text-primary">
                          Total: ₹{calculateItemPrice(product, getItemQuantity(product.id), getItemUnit(product.id)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
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
                    <span>{item.product.name} x {item.quantity} {item.selectedUnit}</span>
                    <span className="font-medium">₹{calculateItemPrice(item.product, item.quantity, item.selectedUnit).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-primary">₹{getTotalAmount().toFixed(2)}</span>
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
