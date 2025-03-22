// components/CreateOrderModal.tsx
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Modifier {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
}

interface ModifierWithQuantity extends Modifier {
  quantity: number;
}

interface ModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  modifiers: Modifier[];
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  id?: string;
  imageUrl?: string;
  modifiers?: ModifierWithQuantity[];
}

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreateOrder: (orderData: CreateOrderData) => void;
}

interface CreateOrderData {
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  notes?: string;
  items: OrderItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  modifierGroups?: ModifierGroup[];
  stripePriceId?: string;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  categories: Category[];
}

async function getSiteMenu() {
  try {
    const response = await fetch("/api/menu/get-menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }

    return await response.json() as Menu[];
  } catch (error) {
    console.error("Error fetching menu:", error);
    throw error;
  }
}

export default function CreateOrderModal({
  open,
  onClose,
  onCreateOrder,
}: CreateOrderModalProps) {
  const [formData, setFormData] = useState<CreateOrderData>({
    storeId: "your-store-id",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    notes: "",
    items: [],
  });
  const [siteMenu, setSiteMenu] = useState<Menu[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedModifiers, setSelectedModifiers] = useState<{
    [key: string]: ModifierWithQuantity;
  }>({});

  const { removeFromCart } = useCartStore();

  useEffect(() => {
    async function loadMenu() {
      try {
        const menu = await getSiteMenu();
        setSiteMenu(menu);
        if (menu?.[0]?.categories?.length) {
          setActiveTab(menu[0].categories[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load menu.");
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemQuantityChange = (index: number, newQuantity: number) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = newQuantity;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const modifiersTotal = item.modifiers?.reduce(
        (modSum, modifier) => modSum + modifier.price * modifier.quantity,
        0
      ) || 0;
      return sum + (item.price * item.quantity) + modifiersTotal;
    }, 0);
    
    const tax = subtotal * 0.08;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone) {
      alert("Customer name and phone are required");
      return;
    }
    onCreateOrder(formData);
  };

  const handleAddToCart = (item: MenuItem) => {
    const currentQuantity = quantities[item.id] || 1;
    const modifiersArray = Object.values(selectedModifiers)
      .filter(m => m.quantity > 0)
      .map(({ id, name, price, stripePriceId, quantity }) => ({
        id,
        name,
        price,
        stripePriceId,
        quantity: quantity || 1
      }));

    const newItem: OrderItem = {
      id: item.id,
      name: item.name,
      quantity: currentQuantity,
      price: item.price,
      imageUrl: item.imageUrl,
      modifiers: modifiersArray,
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
    setSelectedModifiers({});
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const calculateItemTotal = (item: MenuItem, quantity: number) => {
    const modifiersTotal = Object.values(selectedModifiers).reduce(
      (sum, modifier) => sum + modifier.price * modifier.quantity,
      0
    );
    return (item.price * quantity + modifiersTotal).toFixed(2);
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto grid grid-cols-3 gap-6">
        <DialogHeader className="col-span-3">
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        {/* Customer Information */}
        <div className="col-span-1">
          <CustomerInfoSection formData={formData} handleChange={handleChange} />
        </div>

        {/* Menu Selection */}
        <div className="col-span-1 flex flex-col">
          <h3 className="font-medium">Select Items</h3>
          {siteMenu && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="sticky top-0 bg-white">
                {siteMenu[0].categories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                {siteMenu[0].categories.map(category => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="grid gap-4">
                      {category.items.map(item => (
                        <MenuItemComponent
                          key={item.id}
                          item={item}
                          quantities={quantities}
                          selectedModifiers={selectedModifiers}
                          setQuantities={setQuantities}
                          setSelectedModifiers={setSelectedModifiers}
                          calculateItemTotal={calculateItemTotal}
                          handleAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          )}
        </div>

        {/* Cart */}
        <div className="col-span-1">
          <OrderSummary
            items={formData.items}
            totals={calculateTotals()}
            handleItemQuantityChange={handleItemQuantityChange}
            removeItem={removeItem}
          />
        </div>

        <DialogFooter className="col-span-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Sub-components for better organization
const LoadingState = () => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Loading Menu...</DialogTitle>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

const ErrorState = ({ error }: { error: string }) => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Error</DialogTitle>
        <DialogDescription>{error}</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

const CustomerInfoSection = ({ formData, handleChange }: {
  formData: CreateOrderData,
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) => (
  <div className="grid gap-4 py-4">
    <div>
      <Label>Name*</Label>
      <Input
        name="customerName"
        value={formData.customerName}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <Label>Phone*</Label>
      <Input
        name="customerPhone"
        value={formData.customerPhone}
        onChange={handleChange}
        required
      />
    </div>
    <div>
      <Label>Email</Label>
      <Input
        name="customerEmail"
        value={formData.customerEmail}
        onChange={handleChange}
      />
    </div>
    <div>
      <Label>Address</Label>
      <Input
        name="customerAddress"
        value={formData.customerAddress}
        onChange={handleChange}
      />
    </div>
    <div>
      <Label>Order Notes</Label>
      <Textarea
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
      />
    </div>
  </div>
);

const MenuItemComponent = ({
  item,
  quantities,
  selectedModifiers,
  setQuantities,
  setSelectedModifiers,
  calculateItemTotal,
  handleAddToCart
}: {
  item: MenuItem;
  quantities: { [key: string]: number };
  selectedModifiers: { [key: string]: ModifierWithQuantity };
  setQuantities: (value: React.SetStateAction<{ [key: string]: number }>) => void;
  setSelectedModifiers: (value: React.SetStateAction<{ [key: string]: ModifierWithQuantity }>) => void;
  calculateItemTotal: (item: MenuItem, quantity: number) => string;
  handleAddToCart: (item: MenuItem) => void;
}) => {
  const currentQuantity = quantities[item.id] || 1;

  return (
    <Dialog onOpenChange={(open) => !open && setSelectedModifiers({})}>
      <DialogTrigger asChild>
        <div className="border rounded-lg p-4 flex items-center cursor-pointer hover:shadow-lg">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={80}
            height={80}
            className="rounded-lg mr-4"
          />
          <div>
            <h4 className="font-bold">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p>${item.price.toFixed(2)}</p>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>

        {item.modifierGroups?.map(group => (
          <ModifierGroupComponent
            key={group.id}
            group={group}
            selectedModifiers={selectedModifiers}
            setSelectedModifiers={setSelectedModifiers}
          />
        ))}

        <div className="flex justify-between items-center mt-4">
          <QuantitySelector
            itemId={item.id}
            currentQuantity={currentQuantity}
            setQuantities={setQuantities}
          />
          <DialogClose asChild>
            <Button onClick={() => handleAddToCart(item)} className="gap-2">
              Add ${calculateItemTotal(item, currentQuantity)}
              <ChevronRight size={16} />
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ModifierGroupComponent = ({
  group,
  selectedModifiers,
  setSelectedModifiers
}: {
  group: ModifierGroup;
  selectedModifiers: { [key: string]: ModifierWithQuantity };
  setSelectedModifiers: (value: React.SetStateAction<{ [key: string]: ModifierWithQuantity }>) => void;
}) => {
  const currentTotal = Object.values(selectedModifiers).reduce(
    (sum, m) => sum + m.quantity, 0
  );

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">{group.name}</h4>
      <p className="text-sm text-gray-500 mb-3">
        {[group.minSelect > 0 && `Minimum ${group.minSelect}`, 
          group.maxSelect > 0 && `Maximum ${group.maxSelect}`]
          .filter(Boolean).join(' / ')} selections
      </p>
      
      <div className="space-y-2">
        {group.modifiers.map(modifier => {
          const currentQty = selectedModifiers[modifier.id]?.quantity || 0;
          
          return (
            <div key={modifier.id} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModifiers(prev => {
                    const newState = { ...prev };
                    if (currentQty > 1) {
                      newState[modifier.id].quantity--;
                    } else {
                      delete newState[modifier.id];
                    }
                    return newState;
                  })}
                  disabled={currentQty === 0}
                >
                  -
                </Button>
                <span>{currentQty}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedModifiers(prev => ({
                    ...prev,
                    [modifier.id]: {
                      ...modifier,
                      quantity: (prev[modifier.id]?.quantity || 0) + 1
                    }
                  }))}
                  disabled={group.maxSelect > 0 && currentTotal >= group.maxSelect}
                >
                  +
                </Button>
              </div>
              
              <div>
                <span>{modifier.name}</span>
                {modifier.price > 0 && (
                  <span className="ml-2">+${modifier.price.toFixed(2)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuantitySelector = ({
  itemId,
  currentQuantity,
  setQuantities
}: {
  itemId: string;
  currentQuantity: number;
  setQuantities: (value: React.SetStateAction<{ [key: string]: number }>) => void;
}) => (
  <Select
    value={currentQuantity.toString()}
    onValueChange={value => setQuantities(prev => ({
      ...prev,
      [itemId]: Number(value)
    }))}
  >
    <SelectTrigger className="w-32">
      <SelectValue placeholder="1" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Quantity</SelectLabel>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
);

const OrderSummary = ({
  items,
  totals,
  handleItemQuantityChange,
  removeItem
}: {
  items: OrderItem[];
  totals: { subtotal: number; tax: number; total: number };
  handleItemQuantityChange: (index: number, newQuantity: number) => void;
  removeItem: (index: number) => void;
}) => (
  <div className="space-y-4">
    {items.map((item, index) => (
      <div key={index} className="border-b pb-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={40}
              height={40}
              className="rounded"
            />
          )}
          <div>
            <p>{item.name} x{item.quantity}</p>
            {item.modifiers?.map((modifier, modIndex) => (
              <p key={modIndex} className="text-xs text-gray-500">
                {modifier.name} x{modifier.quantity} (+${(modifier.price * modifier.quantity).toFixed(2)})
              </p>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={e => handleItemQuantityChange(index, Number(e.target.value))}
            className="w-16 text-center"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(index)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    ))}

    <div className="space-y-2 pt-4">
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>${totals.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (8%):</span>
        <span>${totals.tax.toFixed(2)}</span>
      </div>
      <div className="flex justify-between font-bold">
        <span>Total:</span>
        <span>${totals.total.toFixed(2)}</span>
      </div>
    </div>
  </div>
);