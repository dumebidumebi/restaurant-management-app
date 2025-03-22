
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.3.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.3.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  data: 'data',
  createdAt: 'createdAt'
};

exports.Prisma.StoreScalarFieldEnum = {
  id: 'id',
  name: 'name',
  ownerId: 'ownerId',
  settings: 'settings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  site_subdomain: 'site_subdomain',
  site_logo: 'site_logo',
  site_cover_image: 'site_cover_image',
  site_custom_domain: 'site_custom_domain'
};

exports.Prisma.LocationScalarFieldEnum = {
  id: 'id',
  address: 'address',
  storeId: 'storeId',
  openHours: 'openHours',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MenuScalarFieldEnum = {
  id: 'id',
  name: 'name',
  storeId: 'storeId',
  isAvailable: 'isAvailable',
  availability: 'availability',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  menuId: 'menuId',
  isAvailable: 'isAvailable',
  availability: 'availability',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.ItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  imageUrl: 'imageUrl',
  displayName: 'displayName',
  description: 'description',
  price: 'price',
  options: 'options',
  allergens: 'allergens',
  categoryId: 'categoryId',
  isAvailable: 'isAvailable',
  availability: 'availability',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  stripeProductId: 'stripeProductId',
  stripePriceId: 'stripePriceId'
};

exports.Prisma.ModifierGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  minSelect: 'minSelect',
  maxSelect: 'maxSelect',
  isAvailable: 'isAvailable',
  availability: 'availability',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.ModifierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  price: 'price',
  imageUrl: 'imageUrl',
  displayName: 'displayName',
  description: 'description',
  minSelect: 'minSelect',
  maxSelect: 'maxSelect',
  isAvailable: 'isAvailable',
  availability: 'availability',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId',
  stripeProductId: 'stripeProductId',
  stripePriceId: 'stripePriceId'
};

exports.Prisma.OrderScalarFieldEnum = {
  stripeCheckoutSessionId: 'stripeCheckoutSessionId',
  id: 'id',
  orderNumber: 'orderNumber',
  status: 'status',
  subtotal: 'subtotal',
  tax: 'tax',
  deliveryFee: 'deliveryFee',
  tip: 'tip',
  total: 'total',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  customerEmail: 'customerEmail',
  customerAddress: 'customerAddress',
  notes: 'notes',
  prepTime: 'prepTime',
  deliveryQuoteId: 'deliveryQuoteId',
  deliveryId: 'deliveryId',
  deliveryStatus: 'deliveryStatus',
  uberStatus: 'uberStatus',
  uberTrackingUrl: 'uberTrackingUrl',
  dasherName: 'dasherName',
  dasherPhone: 'dasherPhone',
  courierLocationLat: 'courierLocationLat',
  courierLocationLng: 'courierLocationLng',
  courierVehicleType: 'courierVehicleType',
  courierVehicleMake: 'courierVehicleMake',
  courierVehicleModel: 'courierVehicleModel',
  courierVehicleColor: 'courierVehicleColor',
  courierRating: 'courierRating',
  estimatedPickupTime: 'estimatedPickupTime',
  estimatedDropoffTime: 'estimatedDropoffTime',
  refundAmount: 'refundAmount',
  refundReason: 'refundReason',
  refundPartyAtFault: 'refundPartyAtFault',
  refundItems: 'refundItems',
  refundFees: 'refundFees',
  refundedAt: 'refundedAt',
  paymentIntentId: 'paymentIntentId',
  paymentStatus: 'paymentStatus',
  storeId: 'storeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastUpdated: 'lastUpdated',
  doordashTrackingUrl: 'doordashTrackingUrl',
  doordashFee: 'doordashFee',
  doordashStatus: 'doordashStatus',
  pickupTimeEstimated: 'pickupTimeEstimated',
  dropoffTimeEstimated: 'dropoffTimeEstimated',
  supportReference: 'supportReference'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  quantity: 'quantity',
  price: 'price',
  modifiers: 'modifiers',
  notes: 'notes',
  itemId: 'itemId',
  orderId: 'orderId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  customerEmail: 'customerEmail',
  deliveryAddress: 'deliveryAddress',
  deliveryFee: 'deliveryFee',
  storeId: 'storeId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  quantity: 'quantity',
  price: 'price',
  modifiers: 'modifiers',
  notes: 'notes',
  itemId: 'itemId',
  cartId: 'cartId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.OrderStatus = exports.$Enums.OrderStatus = {
  NEW: 'NEW',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED'
};

exports.DeliveryStatus = exports.$Enums.DeliveryStatus = {
  PENDING: 'PENDING',
  SCHEDULED: 'SCHEDULED',
  COURIER_ASSIGNED: 'COURIER_ASSIGNED',
  COURIER_ARRIVED: 'COURIER_ARRIVED',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Store: 'Store',
  Location: 'Location',
  Menu: 'Menu',
  Category: 'Category',
  Item: 'Item',
  ModifierGroup: 'ModifierGroup',
  Modifier: 'Modifier',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
