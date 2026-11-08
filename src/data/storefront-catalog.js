/* Sample catalog for the OmniStudio-style storefront demo.
   In the real build this comes from a DataRaptor / Integration
   Procedure that feeds the FlexCards. */

export const catalog = [
  {
    id: 'LAP-14',
    name: 'Laptop 14"',
    category: 'Hardware',
    icon: 'laptop',
    price: 1299,
    stock: 8,
    description: 'Standard-issue laptop, 16 GB RAM, 512 GB SSD. Ships imaged and enrolled in device management.',
    options: { label: 'Keyboard layout', values: ['US English', 'US International', 'Spanish'] },
  },
  {
    id: 'MON-27',
    name: '27" Monitor',
    category: 'Hardware',
    icon: 'monitor',
    price: 329,
    stock: 3,
    description: 'QHD monitor with USB-C power delivery, so one cable runs video and charges the laptop.',
    options: { label: 'Stand', values: ['Height-adjustable', 'Monitor arm'] },
  },
  {
    id: 'HDS-01',
    name: 'Noise-Cancelling Headset',
    category: 'Accessories',
    icon: 'headset',
    price: 179,
    stock: 14,
    description: 'Wireless headset certified for the phone system. Includes a USB dongle and a charging stand.',
    options: { label: 'Fit', values: ['Over-ear', 'On-ear'] },
  },
  {
    id: 'DCK-02',
    name: 'Docking Station',
    category: 'Accessories',
    icon: 'dock',
    price: 219,
    stock: 0,
    description: 'Dual-display dock with Ethernet and 100 W charging. Back-ordered: new stock expected next month.',
    options: null,
  },
  {
    id: 'PHN-11',
    name: 'Mobile Phone',
    category: 'Hardware',
    icon: 'phone',
    price: 699,
    stock: 5,
    description: 'Company-managed phone with the Salesforce mobile app pre-installed and an unlimited data plan.',
    options: { label: 'Color', values: ['Graphite', 'Silver'] },
  },
  {
    id: 'LIC-CRM',
    name: 'CRM User License',
    category: 'Software',
    icon: 'license',
    price: 150,
    stock: 25,
    description: 'Annual user license. Provisioned by the admin team with the role and permission sets you pick.',
    options: { label: 'Access level', values: ['Standard user', 'Service agent', 'Read only'] },
  },
];

// Simple stroke icons keyed by `icon`.
export const icons = {
  laptop: 'M4 6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v9H4zM2 18h20',
  monitor: 'M3 4h18v12H3zM9 20h6M12 16v4',
  headset: 'M4 15v-3a8 8 0 0 1 16 0v3M4 15a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2z',
  dock: 'M3 9h18v6H3zM7 12h.01M11 12h6',
  phone: 'M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 18h2',
  license: 'M4 4h16v16H4zM8 9h8M8 13h5M15 16l1.5 1.5L19 15',
};
