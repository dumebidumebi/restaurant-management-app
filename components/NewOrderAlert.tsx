// components/NewOrderAlert.tsx
import { FC } from "react";
import { Bell } from "lucide-react";
import { Order } from "@/types/index";

interface NewOrderAlertProps {
  order: Order;
  onAccept: (order: Order) => void;
  onDismiss: () => void;
}

const NewOrderAlert: FC<NewOrderAlertProps> = ({
  order,
  onAccept,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 w-80 z-50 border border-blue-200">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full mr-3">
          <Bell className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold">New Order #{order.orderNumber}</h4>
          <p className="text-sm text-gray-600">{order.customerName}</p>
          <p className="text-sm text-gray-600">${order.total.toFixed(2)}</p>
          <div className="mt-3 flex justify-end space-x-2">
            <button
              onClick={onDismiss}
              className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Dismiss
            </button>
            <button
              onClick={() => onAccept(order)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrderAlert;
