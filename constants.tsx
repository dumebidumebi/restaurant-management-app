import { Icon } from '@iconify/react';
import { SideNavItem } from './types';
import { Folder, HandCoins, Home, Users } from 'lucide-react';

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: <Home className='stroke-zinc-100'/>
  },
  {
    title: 'Setup',
    path: '/onboarding',
    icon: <Folder/>
  },
  {
    title: 'Payroll',
    path: '/payroll',
    icon: <HandCoins />,
    submenu: true,
    subMenuItems: [
      { title: 'Run payroll', path: '/payroll/run-payroll' },
      { title: 'Pay contractors', path: '/payroll/pay-contractors' },
      { title: 'Payroll settings', path: '/payroll/payroll-settings' },
      { title: 'Payroll history', path: '/payroll/payroll-history' },
    ],
  },
  {
    title: 'People',
    path: '/people',
    icon: <Users />,
    submenu: true,
    subMenuItems: [
      { title: 'Employees', path: '/people/employees' },
      { title: 'Contractors', path: '/people/contractors' },
    ],
  },
];


export const MENU = {
  categories: {
    Combos: [
      {
        id: "combo-1",
        name: "Half Peruvian Rotisserie Chik'n - Meal",
        description:
          "2 sides, 1 Aji Verde, Drink, 1 Alfajor Cookie. (Gluten-free except for Alfajor)",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617252549271-89PZOWBYOGEMYYU3Z9NK/Half_rotisserie.png",
        price: 19.89,
        subItems: [
          {
            id: "entree-1",
            name: "Half Peruvian Rotisserie Chik’n",
            price: 8.99,
          },
          { id: "entree-2", name: "Veggie Machu Bowl", price: 10.99 },
        ],
      },
      {
        id: "combo-2",
        name: "Whole Peruvian Rotisserie Chik'n - BIG Family Meal",
        description:
          "XL Arroz Chaufa, XL Potato Fries, XL Veggie Salad, 4 Alfajores Cookies, 2 Aji Verde. (Gluten-free except for Alfajor)",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617160759902-ZHU9EOU9I8E7TZ5ECNB3/Big_fam_meal.png",
        price: 43.49,
        subItems: [
          {
            id: "entree-3",
            name: "Whole Peruvian Rotisserie Chik'n",
            price: 14.91,
          },
          { id: "entree-4", name: "Chik'n Strips", price: 7.59 },
        ],
      },
    ],
    Entrees: [
      {
        id: "entree-1",
        name: "Half Peruvian Rotisserie Chik’n",
        description:
          "A half rotisserie chicken served with your choice of sides.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617252549271-89PZOWBYOGEMYYU3Z9NK/Half_rotisserie.png",
        price: 8.99,
      },
      {
        id: "entree-2",
        name: "Veggie Machu Bowl",
        description:
          "Arroz Chaufa, Salsa Criolla, Turtle Beans, 1 Aji Verde. (Gluten-free)",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617160514847-CXG8CF8GGO2M3W4SFEFA/Big_fam_meal+Copy.png",
        price: 10.99,
      },
      {
        id: "entree-3",
        name: "Chik'n Sandwich",
        description: "Crispy chicken sandwich served with a choice of side.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1607238930409-Y6OVR4F7R5K03ER8AWVR/Menu+Copy.png",
        price: 6.99,
      },
      {
        id: "entree-4",
        name: "Deluxe Chik'n Sandwich",
        description:
          "Deluxe crispy chicken sandwich served with a choice of side.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1607238644368-17P0T196QT1IT7AQUN10/Menu+Copy+6.png",
        price: 7.49,
      },
      {
        id: "entree-5",
        name: "Spicy Chik'n Sandwich",
        description:
          "Spicy crispy chicken sandwich served with a choice of side.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1607238567159-7IG3JDI9LYPBTECH6PQL/Menu+Copy+9.png",
        price: 6.99,
      },
      {
        id: "entree-6",
        name: "Spicy Deluxe Chik'n Sandwich",
        description:
          "Deluxe spicy crispy chicken sandwich served with a choice of side.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617162468598-UYOIWDHK0JH883481QUH/Menu+Copy+2.png",
        price: 7.49,
      },
      {
        id: "entree-7",
        name: "Chik'n Nuggets",
        description: "Crispy chicken nuggets served with dipping sauce.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617162233029-365PV2K8V1RA0DYE8Q27/Menu+Copy+3.png",
        price: 5.45,
      },
      {
        id: "entree-8",
        name: "Spicy Chik'n Nuggets",
        description: "Spicy crispy chicken nuggets served with dipping sauce.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617162173767-64ZFYRI04ATQ3V9L483S/Menu+Copy+7.png",
        price: 5.59,
      },
      {
        id: "entree-9",
        name: "Chik'n Strips",
        description: "Spicy crispy chicken strips served with dipping sauce.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617162206472-L8LTRO5D8JBK32DHMRUL/Menu+Copy+8.png",
        price: 5.59,
      },
      {
        id: "entree-10",
        name: "Spicy Chik'n Strips",
        description: "Spicy crispy chicken strips served with dipping sauce.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1617162221359-3ZXUJUMJH4OK7SAH9L18/Menu+Copy+5.png",
        price: 5.59,
      },
    ],
    Sauces: [
      {
        id: "sauce-1",
        name: "Aji Verde",
        description: "A delicious, tangy sauce.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/197323cb-5d0c-414a-b356-0e4cca6985a7/Just+Chik%27n+Sauces_1123.png",
        price: 0.59,
      },
    ],
    Drinks: [
      {
        id: "drink-1",
        name: "Inca Cola",
        description: "Classic Peruvian soda.",
        imageUrl:
          "https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/9ff8a9dc-8d8b-4c46-bb4b-d0ae47725665/Loaded+Fries.png",
        price: 2.49,
      },
    ],
  },
};


export const BANNER = 'https://images.squarespace-cdn.com/content/v1/5eec4b7cea59d87144008a03/1619241242574-GKLBL69XMQ3T2DNJESP1/web_banner+copy.jpg'