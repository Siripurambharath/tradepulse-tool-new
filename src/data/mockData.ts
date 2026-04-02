import { faker } from '@faker-js/faker';

faker.seed(42);

export type Contact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
};

export type Company = {
  id: string;
  name: string;
  country: string;
  type: 'Buyer' | 'Seller';
  product: string;
  hsn: string;
  volume: string;
  industry: string;
  shipmentCount: number;
  lastShipmentDate: string;
  contacts: Contact[];
  status: 'Not Contacted' | 'Email Sent' | 'Opened' | 'Replied' | 'Interested' | 'Not Interested';
  address: string;
  portOfLoading: string;
  portOfDischarge: string;
  buyerAddress: string;
  destinationCountry: string;
  productDescription: string;
  totalValue: string;
  verified: boolean;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
};

export type HistoryEntry = {
  id: string;
  product: string;
  date: string;
  companies: {
    companyName: string;
    contactName: string;
    email: string;
    sentAt: string;
    status: 'Sent' | 'Opened' | 'Replied' | 'No Response';
    templateUsed: string;
  }[];
};

export type Campaign = {
  id: string;
  name: string;
  product: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  type: 'Instant' | 'Scheduled';
  scheduledDate: string;
  createdAt: string;
  templateName: string;
  stats: { sent: number; opened: number; replied: number };
  contacts: { name: string; email: string; company: string; status: string }[];
};

const countries = ['USA', 'India', 'Germany', 'China', 'Japan', 'Brazil', 'UK', 'South Africa', 'Nigeria', 'Bangladesh', 'Indonesia', 'Malaysia', 'Argentina', 'Mexico', 'Canada', 'Australia', 'France', 'Italy', 'Turkey', 'Thailand'];

const products = ['Sugar', 'Rice', 'Coffee', 'Tea', 'Spices', 'Cotton', 'Petroleum', 'Steel', 'Copper Wire', 'Auto Parts', 'Machinery', 'Electronics', 'Textiles', 'Chemicals', 'Pharmaceutical APIs', 'Rubber', 'Cement', 'Fertilizers', 'Plastics', 'Green Tea'];

const hsnCodes: Record<string, string> = {
  Sugar: '1701', Rice: '1006', Coffee: '0901', Tea: '0902', Spices: '0910',
  Cotton: '5201', Petroleum: '2710', Steel: '7208', 'Copper Wire': '7408',
  'Auto Parts': '8708', Machinery: '8428', Electronics: '8542', Textiles: '5209',
  Chemicals: '2902', 'Pharmaceutical APIs': '3004', Rubber: '4001', Cement: '2523',
  Fertilizers: '3105', Plastics: '3901', 'Green Tea': '0902',
};

const ports = ['Mumbai Port', 'Chennai Sea (INMAA1)', 'Nhava Sheva', 'Kandla Port', 'Kolkata Port', 'Petrapole Road', 'Vizag Port', 'Cochin Port', 'Tuticorin Port', 'Mundra Port'];
const dischargePorts = ['Port Kelang', 'Benapole', 'Jebel Ali', 'Singapore Port', 'Colombo', 'Felixstowe', 'Hamburg', 'Rotterdam', 'Shanghai', 'Yokohama'];

const roles = ['CEO', 'Purchase Manager', 'Director', 'VP Sales', 'Import Manager', 'Procurement Head', 'Trade Manager', 'Business Development Manager'];
const departments = ['Management', 'Purchasing', 'Sales', 'Operations', 'Trade', 'Procurement', 'Business Development'];

function generateContacts(count: number): Contact[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(roles),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    department: faker.helpers.arrayElement(departments),
  }));
}

function generateCompanies(count: number): Company[] {
  return Array.from({ length: count }, () => {
    const product = faker.helpers.arrayElement(products);
    const country = faker.helpers.arrayElement(countries);
    return {
      id: faker.string.uuid(),
      name: faker.company.name(),
      country,
      type: faker.helpers.arrayElement(['Buyer', 'Seller']) as 'Buyer' | 'Seller',
      product,
      hsn: hsnCodes[product] || '0000',
      volume: `$${faker.number.int({ min: 100, max: 9999 })}K`,
      industry: product,
      shipmentCount: faker.number.int({ min: 1, max: 500 }),
      lastShipmentDate: faker.date.past({ years: 2 }).toISOString().split('T')[0],
      contacts: generateContacts(faker.number.int({ min: 2, max: 5 })),
      status: faker.helpers.arrayElement(['Not Contacted', 'Email Sent', 'Opened', 'Replied', 'Interested', 'Not Interested']) as Company['status'],
      address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
      portOfLoading: faker.helpers.arrayElement(ports),
      portOfDischarge: faker.helpers.arrayElement(dischargePorts),
      buyerAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, ${country}`,
      destinationCountry: faker.helpers.arrayElement(countries),
      productDescription: `${product.toUpperCase()} - ${faker.commerce.productDescription()}`,
      totalValue: `₹${faker.number.int({ min: 50, max: 9999 })}.${faker.number.int({ min: 10, max: 99 })}K`,
      verified: faker.datatype.boolean(),
    };
  });
}

export const allCompanies = generateCompanies(5000);

export const defaultTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Initial Outreach',
    subject: 'Partnership Opportunity - {{product}}',
    body: `Dear {{contact_name}},\n\nI hope this message finds you well. We are reaching out regarding a potential partnership opportunity in the {{product}} trade.\n\nOur company specializes in international trade facilitation and we believe there's a strong synergy between our operations.\n\nWould you be available for a brief call this week to discuss further?\n\nBest regards,\nGlobal Trade Team`,
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Follow Up',
    subject: 'Following Up - {{product}} Trade Opportunity',
    body: `Dear {{contact_name}},\n\nI wanted to follow up on my previous email regarding our {{product}} trade partnership opportunity.\n\nWe have some exciting developments that could benefit your business significantly.\n\nPlease let me know if you'd like to schedule a meeting.\n\nBest regards,\nGlobal Trade Team`,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '3',
    name: 'Sample Offer',
    subject: 'Exclusive Offer on {{product}}',
    body: `Dear {{contact_name}},\n\nWe are pleased to offer you a competitive quote for {{product}} shipments.\n\nOur current pricing and terms are among the best in the industry.\n\nAttached you'll find our latest catalog. Looking forward to your response.\n\nWarm regards,\nGlobal Trade Team`,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: '4',
    name: 'Pricing Proposal',
    subject: 'Competitive Pricing - {{product}}',
    body: `Dear {{contact_name}},\n\nThank you for your interest in {{product}}. Please find below our competitive pricing structure.\n\nWe offer flexible MOQ, reliable shipping, and quality assurance.\n\nLet us know how we can proceed.\n\nBest,\nGlobal Trade Team`,
    createdAt: '2026-03-05T10:00:00Z',
  },
];

export function generateHistory(): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  const usedProducts = faker.helpers.arrayElements(products, 8);
  usedProducts.forEach((product) => {
    const count = faker.number.int({ min: 3, max: 8 });
    entries.push({
      id: faker.string.uuid(),
      product,
      date: faker.date.recent({ days: 30 }).toISOString(),
      companies: Array.from({ length: count }, () => ({
        companyName: faker.company.name(),
        contactName: faker.person.fullName(),
        email: faker.internet.email(),
        sentAt: faker.date.recent({ days: 30 }).toISOString(),
        status: faker.helpers.arrayElement(['Sent', 'Opened', 'Replied', 'No Response']),
        templateUsed: faker.helpers.arrayElement(defaultTemplates).name,
      })),
    });
  });
  return entries;
}

export function generateCampaigns(): Campaign[] {
  return Array.from({ length: 10 }, (_, i) => {
    const product = faker.helpers.arrayElement(products);
    const status = faker.helpers.arrayElement(['draft', 'active', 'completed', 'paused']) as Campaign['status'];
    const type = faker.helpers.arrayElement(['Instant', 'Scheduled']) as Campaign['type'];
    const sent = faker.number.int({ min: 1, max: 50 });
    return {
      id: faker.string.uuid(),
      name: `${product} - ${faker.helpers.arrayElement(['Launch Campaign', 'Outreach Campaign', 'Q1 Campaign', 'Spring Campaign', 'Market Push'])}`,
      product,
      status,
      type,
      scheduledDate: type === 'Scheduled' ? faker.date.future({ years: 1 }).toISOString() : '',
      createdAt: faker.date.past({ years: 1 }).toISOString(),
      templateName: faker.helpers.arrayElement(defaultTemplates).name,
      stats: {
        sent,
        opened: faker.number.int({ min: 0, max: sent }),
        replied: faker.number.int({ min: 0, max: Math.floor(sent / 2) }),
      },
      contacts: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        company: faker.company.name(),
        status: faker.helpers.arrayElement(['Sent', 'Opened', 'Replied', 'Pending']),
      })),
    };
  });
}
