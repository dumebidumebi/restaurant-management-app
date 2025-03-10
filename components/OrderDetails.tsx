// components/OrderDetails.jsx
import { format } from 'date-fns';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Printer } from 'lucide-react';

export default function OrderDetails({ order, open, onClose, onPrint }) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.orderNumber}</span>
            <Badge className={
              order.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' : 
              order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
              order.status === 'READY' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }>
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-2">
          <div className="text-sm space-y-1">
            <div className="font-bold">{order.customerName}</div>
            {order.customerAddress && <div>{order.customerAddress}</div>}
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.quantity}× {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <Separator />
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            {order.deliveryFee && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={() => onPrint(order.id)}>
            <Printer className="h-4 w-4 mr-1" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
