// components/PrepTimeSetter.tsx
import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Order } from "@/types/index";

interface PrepTimeSetterProps {
  order: Order;
  open: boolean;
  onClose: () => void;
  onConfirm: (prepTime: number) => void;
}

const PrepTimeSetter: FC<PrepTimeSetterProps> = ({
  order,
  open,
  onClose,
  onConfirm,
}) => {
  const [prepTime, setPrepTime] = useState<number>(30); // Default 30 mins

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Preparation Time</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            Set preparation time for order #{order?.orderNumber}
          </p>
          <div className="flex items-center">
            <Input
              type="number"
              value={prepTime}
              onChange={(e) => setPrepTime(parseInt(e.target.value, 10))}
              className="mr-2"
              min="1"
            />
            <span>minutes</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(prepTime)}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrepTimeSetter;
