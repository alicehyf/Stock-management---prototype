/*
  Simple localStorage-backed store for the procurement demo.
  Classic script (no ES-module imports) so it works on file://

  Data model (minimal):
  - settings (approvalsEnabled + thresholds)
  - prs (purchase requisitions)
  - pos (purchase orders)
  - receivings (goods receipts records)
  - credits (vendor credits)
*/
(function(){
  const STORE_KEY = 'procurement_demo_v5_realistic';
  // Item master migration/versioning
  const ITEM_MASTER_VERSION = 4;

  function nowISO(){ return new Date().toISOString(); }
  function id(prefix){
    const n = Math.floor(Math.random()*90000)+10000;
    return prefix + '-' + n;
  }

  function seedStore(){
    return {
      // Simple permission model
      // role: 'staff' (default) or 'owner' (boss)
      user: {
        role: 'staff'
      },
      settings: {
        approvalsEnabled: true,
        thresholds: [
          { level: 1, role: 'Outlet manager', rule: 'Required' },
          { level: 2, role: 'Finance', rule: 'If total > IDR 5,000,000' },
          { level: 3, role: 'Owner', rule: 'If total > IDR 20,000,000' }
        ],
        // Reorder points per SKU (used by Ingredients list status + suggested ordering)
        // Values are stored in the item's base unit (uom)
        reorderPoints: {
  // Spices & pantry
  '1001': 500,      // Anise Star (g)
  '1002': 1000,     // Balsamic Vinegar (g)
  '1005': 300,      // Black Pepper (g)

  // Dairy
  '1008': 8000,     // Butter (g)
  '1012': 20000,    // Milk (ml)
  '1016': 180,      // Eggs (pcs)

  // Produce
  '2001': 5000,     // Avocado (g)
  '2002': 2000,     // Lettuce (g)
  '2006': 8000,     // Tomatoes (g)

  // Meat & poultry
  '3001': 5000,     // Bacon (g)
  '5001': 15000     // Chicken breast (g)
}
      },
      prs: [
        {
          id: 'PR-12011',
          createdAt: nowISO(),
          requester: 'Kitchen',
          scope: 'Food & Beverage',
          location: 'Main kitchen',
          neededBy: new Date(Date.now()+3*86400000).toISOString().slice(0,10),
          status: 'Pending approval',
          approvals: [
            { role:'Outlet manager', status:'Pending' },
            { role:'Finance', status:'Blocked' },
            { role:'Owner', status:'Blocked' }
          ],
          items: [
            { name:'Milk', sku:'1012', uom:'ml', qty: 40000, estUnitPrice: 15, supplierId:'SUP-10001', supplier:'Dairy Co.' },
            { name:'Avocado', sku:'2001', uom:'g', qty: 8000, estUnitPrice: 120, supplierId:'SUP-10002', supplier:'Fresh Market' }
          ],
          activity: [
            { at: nowISO(), text: 'PR created by Kitchen' },
            { at: nowISO(), text: 'Submitted for approval' }
          ]
        },
        {
          id: 'PR-12012',
          createdAt: nowISO(),
          requester: 'Outlet Bar',
          scope: 'Beverage',
          location: 'Pool bar',
          neededBy: new Date(Date.now()+5*86400000).toISOString().slice(0,10),
          status: 'Pending approval',
          approvals: [
            { role:'Outlet manager', status:'Approved', at: nowISO(), by:'Outlet manager' },
            { role:'Finance', status:'Pending' },
            { role:'Owner', status:'Blocked' }
          ],
          items: [
            { name:'Butter', sku:'1008', uom:'g', qty: 5000, estUnitPrice: 140, supplierId:'SUP-10001', supplier:'Dairy Co.' },
            { name:'Tomatoes', sku:'2006', uom:'g', qty: 15000, estUnitPrice: 45, supplierId:'SUP-10002', supplier:'Fresh Market' }
          ],
          activity: [
            { at: nowISO(), text: 'PR created by Outlet Bar' },
            { at: nowISO(), text: 'Submitted for approval' },
            { at: nowISO(), text: 'Approved by Outlet manager' }
          ]
        },
        {
          id: 'PR-12013',
          createdAt: nowISO(),
          requester: 'Beach restaurant',
          scope: 'Food & Beverage',
          location: 'Beach restaurant',
          neededBy: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
          status: 'Pending approval',
          approvals: [
            { role:'Outlet manager', status:'Approved', at: nowISO(), by:'Outlet manager' },
            { role:'Finance', status:'Approved', at: nowISO(), by:'Finance' },
            { role:'Owner', status:'Pending' }
          ],
          items: [
            { name:'Chicken breast', sku:'5001', uom:'g', qty: 25000, estUnitPrice: 85, supplierId:'SUP-10003', supplier:'Butcher' },
            { name:'Eggs', sku:'1016', uom:'pcs', qty: 360, estUnitPrice: 2500, supplierId:'SUP-10001', supplier:'Dairy Co.' }
          ],
          activity: [
            { at: nowISO(), text: 'PR created by Maintenance' },
            { at: nowISO(), text: 'Submitted for approval' },
            { at: nowISO(), text: 'Approved by Outlet manager' },
            { at: nowISO(), text: 'Approved by Finance' }
          ]
        },
        {
          id: 'PR-11990',
          createdAt: nowISO(),
          requester: 'Chef',
          scope: 'Food & Beverage',
          location: 'Main kitchen',
          neededBy: new Date(Date.now()-2*86400000).toISOString().slice(0,10),
          status: 'Approved',
          approvals: [
            { role:'Outlet manager', status:'Approved', at: nowISO(), by:'Outlet manager' },
            { role:'Finance', status:'Approved', at: nowISO(), by:'Finance' },
            { role:'Owner', status:'Approved', at: nowISO(), by:'Owner' }
          ],
          items: [
            { name:'Lettuce', sku:'2002', uom:'g', qty: 9000, estUnitPrice: 40, supplierId:'SUP-10002', supplier:'Fresh Market' }
          ],
          activity: [
            { at: nowISO(), text: 'PR created by Chef' },
            { at: nowISO(), text: 'Submitted for approval' },
            { at: nowISO(), text: 'Approved (completed)' }
          ]
        },
        {
          id: 'PR-11991',
          createdAt: nowISO(),
          requester: 'Outlet Manager',
          scope: 'Food & Beverage',
          location: 'Beach restaurant',
          neededBy: new Date(Date.now()-1*86400000).toISOString().slice(0,10),
          status: 'Rejected',
          approvals: [
            { role:'Outlet manager', status:'Approved', at: nowISO(), by:'Outlet manager' },
            { role:'Finance', status:'Rejected', at: nowISO(), by:'Finance', note:'Budget not available this week' },
            { role:'Owner', status:'Blocked' }
          ],
          items: [
            { name:'Bacon', sku:'3001', uom:'g', qty: 15000, estUnitPrice: 65, supplierId:'SUP-10003', supplier:'Butcher' }
          ],
          activity: [
            { at: nowISO(), text: 'PR created by Outlet Manager' },
            { at: nowISO(), text: 'Submitted for approval' },
            { at: nowISO(), text: 'Rejected by Finance: Budget not available this week' }
          ]
        }
      ],
      pos: [
  {
    id: 'PO-10452',
    createdAt: '2026-01-29T02:10:00.000Z',
    supplierId: 'SUP-10001',
    supplier: 'Dairy Co.',
    deliveryTo: 'Main kitchen',
    expectedDate: '2026-01-31',
    linkedPR: 'PR-12011',
    status: 'Pending approval',
    approvals: [
      { role:'Outlet manager', status:'Approved', at:'2026-01-29T02:20:00.000Z', by:'Outlet manager' },
      { role:'Finance', status:'Pending' },
      { role:'Owner', status:'Blocked' }
    ],
    items: [
      { name:'Milk', sku:'1012', uom:'ml', orderedQty: 40000, receivedQty: 0, unitPrice: 15 },
      { name:'Butter', sku:'1008', uom:'g', orderedQty: 5000, receivedQty: 0, unitPrice: 140 }
    ],
    activity: [
      { at:'2026-01-29T02:10:00.000Z', text:'PO created from PR-12011' },
      { at:'2026-01-29T02:20:00.000Z', text:'Approved by Outlet manager' }
    ]
  },
  {
    id: 'PO-10440',
    createdAt: '2026-01-23T01:20:00.000Z',
    supplierId: 'SUP-10001',
    supplier: 'Dairy Co.',
    deliveryTo: 'Main kitchen',
    expectedDate: '2026-01-26',
    linkedPR: 'PR-12011',
    status: 'Received',
    items: [
      { name:'Milk', sku:'1012', uom:'ml', orderedQty: 24000, receivedQty: 24000, unitPrice: 15 },
      { name:'Butter', sku:'1008', uom:'g', orderedQty: 8000, receivedQty: 8000, unitPrice: 140 },
      { name:'Eggs', sku:'1016', uom:'pcs', orderedQty: 180, receivedQty: 180, unitPrice: 2500 }
    ],
    activity: [
      { at:'2026-01-23T01:20:00.000Z', text:'PO created' },
      { at:'2026-01-26T06:05:00.000Z', text:'Receiving completed: RCV-77120' }
    ]
  },
  {
    id: 'PO-10433',
    createdAt: '2026-01-25T00:40:00.000Z',
    supplierId: 'SUP-10002',
    supplier: 'Fresh Market',
    deliveryTo: 'Main kitchen',
    expectedDate: '2026-01-27',
    linkedPR: 'PR-12011',
    status: 'Partially received',
    items: [
      { name:'Avocado', sku:'2001', uom:'g', orderedQty: 6000, receivedQty: 6000, unitPrice: 120 },
      { name:'Lettuce', sku:'2002', uom:'g', orderedQty: 4000, receivedQty: 4000, unitPrice: 40 },
      { name:'Tomatoes', sku:'2006', uom:'g', orderedQty: 6000, receivedQty: 3000, unitPrice: 45 }
    ],
    activity: [
      { at:'2026-01-25T00:40:00.000Z', text:'PO created' },
      { at:'2026-01-27T03:10:00.000Z', text:'Partial receiving: RCV-77108 (short shipped tomatoes)' }
    ]
  },
  {
    id: 'PO-10410',
    createdAt: '2026-01-24T02:30:00.000Z',
    supplierId: 'SUP-10003',
    supplier: 'Butcher',
    deliveryTo: 'Main kitchen',
    expectedDate: '2026-01-26',
    linkedPR: 'PR-12013',
    status: 'Received',
    items: [
      { name:'Chicken breast', sku:'5001', uom:'g', orderedQty: 18000, receivedQty: 18000, unitPrice: 85 },
      { name:'Bacon', sku:'3001', uom:'g', orderedQty: 6000, receivedQty: 6000, unitPrice: 220 }
    ],
    activity: [
      { at:'2026-01-24T02:30:00.000Z', text:'PO created from PR-12013' },
      { at:'2026-01-26T05:20:00.000Z', text:'Receiving completed: RCV-77098' }
    ]
  }
],
receivings: [
  {
    id: 'RCV-77120',
    createdAt: '2026-01-26T06:05:00.000Z',
    poId: 'PO-10440',
    supplier: 'Dairy Co.',
    supplierId: 'SUP-10001',
    receivedDate: '2026-01-26',
    status: 'Completed',
    items: [
      { name:'Milk', sku:'1012', uom:'ml', orderedQty: 24000, receivedQty: 24000, unitPrice: 15 },
      { name:'Butter', sku:'1008', uom:'g', orderedQty: 8000, receivedQty: 8000, unitPrice: 140 },
      { name:'Eggs', sku:'1016', uom:'pcs', orderedQty: 180, receivedQty: 180, unitPrice: 2500 }
    ],
    activity: [{ at:'2026-01-26T06:05:00.000Z', text:'Receiving completed' }]
  },
  {
    id: 'RCV-77108',
    createdAt: '2026-01-27T03:10:00.000Z',
    poId: 'PO-10433',
    supplier: 'Fresh Market',
    supplierId: 'SUP-10002',
    receivedDate: '2026-01-27',
    status: 'Completed',
    items: [
      { name:'Avocado', sku:'2001', uom:'g', orderedQty: 6000, receivedQty: 6000, unitPrice: 120 },
      { name:'Lettuce', sku:'2002', uom:'g', orderedQty: 4000, receivedQty: 4000, unitPrice: 40 },
      { name:'Tomatoes', sku:'2006', uom:'g', orderedQty: 6000, receivedQty: 3000, unitPrice: 45 }
    ],
    activity: [{ at:'2026-01-27T03:10:00.000Z', text:'Receiving completed (tomatoes short shipped)' }]
  },
  {
    id: 'RCV-77098',
    createdAt: '2026-01-26T05:20:00.000Z',
    poId: 'PO-10410',
    supplier: 'Butcher',
    supplierId: 'SUP-10003',
    receivedDate: '2026-01-26',
    status: 'Completed',
    items: [
      { name:'Chicken breast', sku:'5001', uom:'g', orderedQty: 18000, receivedQty: 18000, unitPrice: 85 },
      { name:'Bacon', sku:'3001', uom:'g', orderedQty: 6000, receivedQty: 6000, unitPrice: 220 }
    ],
    activity: [{ at:'2026-01-26T05:20:00.000Z', text:'Receiving completed' }]
  }
],
credits: [
  {
    id: 'CRD-90021',
    createdAt: '2026-01-27T04:05:00.000Z',
    supplier: 'Fresh Market',
    poId: 'PO-10433',
    receivingId: 'RCV-77108',
    status: 'Open',
    reason: 'Short shipped',
    items: [
      { sku:'2006', name:'Tomatoes', uom:'g', orderedQty:6000, receivedQty:3000, unitPrice:45, amount:135000 }
    ],
    activity: [{ at:'2026-01-27T04:05:00.000Z', text:'Credit created from receiving variance' }]
  }
],
bills: [
  {
    id: 'BILL-88210',
    createdAt: '2026-01-26T08:00:00.000Z',
    status: 'Posted',
    supplierId: 'SUP-10001',
    supplier: 'Dairy Co.',
    poId: 'PO-10440',
    receivingId: 'RCV-77120',
    invoiceNo: 'INV-DAIRY-01108',
    invoiceDate: '2026-01-26',
    dueDate: '2026-02-09',
    currency: 'IDR',
    notes: '',
    appliedCredits: [],
    lines: [
      { sku:'1012', name:'Milk', uom:'ml', poOrderedQty:24000, receivedQty:24000, invoicedQty:24000, poUnitPrice:15, invoicedUnitPrice:15 },
      { sku:'1008', name:'Butter', uom:'g', poOrderedQty:8000, receivedQty:8000, invoicedQty:8000, poUnitPrice:140, invoicedUnitPrice:140 },
      { sku:'1016', name:'Eggs', uom:'pcs', poOrderedQty:180, receivedQty:180, invoicedQty:180, poUnitPrice:2500, invoicedUnitPrice:2500 }
    ],
    activity: [
      { at:'2026-01-26T08:00:00.000Z', text:'Bill created from PO PO-10440' },
      { at:'2026-01-26T08:05:00.000Z', text:'Bill posted' }
    ]
  },
  {
    id: 'BILL-88223',
    createdAt: '2026-01-27T06:30:00.000Z',
    status: 'Posted',
    supplierId: 'SUP-10002',
    supplier: 'Fresh Market',
    poId: 'PO-10433',
    receivingId: 'RCV-77108',
    invoiceNo: 'INV-FM-2388',
    invoiceDate: '2026-01-27',
    dueDate: '2026-01-27',
    currency: 'IDR',
    notes: 'Credit for tomatoes short ship will be applied on next invoice if not used here.',
    appliedCredits: [
      { creditId:'CRD-90021', amount:135000 }
    ],
    lines: [
      { sku:'2001', name:'Avocado', uom:'g', poOrderedQty:6000, receivedQty:6000, invoicedQty:6000, poUnitPrice:120, invoicedUnitPrice:120 },
      { sku:'2002', name:'Lettuce', uom:'g', poOrderedQty:4000, receivedQty:4000, invoicedQty:4000, poUnitPrice:40, invoicedUnitPrice:40 },
      { sku:'2006', name:'Tomatoes', uom:'g', poOrderedQty:6000, receivedQty:3000, invoicedQty:3000, poUnitPrice:45, invoicedUnitPrice:45 }
    ],
    activity: [
      { at:'2026-01-27T06:30:00.000Z', text:'Bill created from PO PO-10433' },
      { at:'2026-01-27T06:35:00.000Z', text:'Credit CRD-90021 applied (IDR 135,000)' }
    ]
  },
  {
    id: 'BILL-88207',
    createdAt: '2026-01-26T09:40:00.000Z',
    status: 'Posted',
    supplierId: 'SUP-10003',
    supplier: 'Butcher',
    poId: 'PO-10410',
    receivingId: 'RCV-77098',
    invoiceNo: 'INV-MEAT-1022',
    invoiceDate: '2026-01-26',
    dueDate: '2026-02-02',
    currency: 'IDR',
    notes: '',
    appliedCredits: [],
    lines: [
      { sku:'5001', name:'Chicken breast', uom:'g', poOrderedQty:18000, receivedQty:18000, invoicedQty:18000, poUnitPrice:85, invoicedUnitPrice:85 },
      { sku:'3001', name:'Bacon', uom:'g', poOrderedQty:6000, receivedQty:6000, invoicedQty:6000, poUnitPrice:220, invoicedUnitPrice:220 }
    ],
    activity: [
      { at:'2026-01-26T09:40:00.000Z', text:'Bill created from PO PO-10410' },
      { at:'2026-01-26T09:45:00.000Z', text:'Bill posted' }
    ]
  }
],
payments: [
  {
    id: 'PAY-88110',
    billId: 'BILL-88210',
    date: '2026-01-28',
    method: 'Bank transfer',
    reference: 'TRX-DAIRY-01108',
    amount: 1930000,
    createdAt: '2026-01-28T04:10:00.000Z'
  },
  {
    id: 'PAY-88135',
    billId: 'BILL-88223',
    date: '2026-01-27',
    method: 'Cash',
    reference: 'CASH-FM-2388',
    amount: 700000,
    createdAt: '2026-01-27T07:10:00.000Z'
  }
],
      // Inventory (Ingredients prototype)
inventory: {
  balances: {
    "1001": 790,
    "1002": 1100,
    "1005": 120,
    "1008": 6000,
    "1012": 18000,
    "1016": 120,
    "2001": 3200,
    "2002": 2500,
    "2006": 0,
    "3001": 7000,
    "3002": 0,
    "5001": 14000
  },
  movements: {
    "1012": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 4200, unit:"ml", balance: 18000, note:"Daily recipes (coffee + breakfast)" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77120", qty: 24000, unit:"ml", balance: 22200, note:"Dairy Co. delivery (24L)" },
      { date:"2026-01-24", type:"OUT", reference:"POS sales", qty: 5200, unit:"ml", balance: -1800, note:"Daily recipes (kitchen + bar)" },
      { date:"2026-01-23", type:"IN", reference:"PO-10440", qty: 24000, unit:"ml", balance: 3400, note:"PO receipt (milk)" }
    ],
    "1016": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 36, unit:"pcs", balance: 120, note:"Breakfast service" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77120", qty: 180, unit:"pcs", balance: 156, note:"Dairy Co. delivery" },
      { date:"2026-01-23", type:"OUT", reference:"POS sales", qty: 72, unit:"pcs", balance: -24, note:"Breakfast + bakery" },
      { date:"2026-01-23", type:"IN", reference:"PO-10440", qty: 180, unit:"pcs", balance: 48, note:"PO receipt (eggs)" }
    ],
    "1008": [
      { date:"2026-01-27", type:"OUT", reference:"POS sales", qty: 800, unit:"g", balance: 6000, note:"Bakery + kitchen usage" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77120", qty: 8000, unit:"g", balance: 6800, note:"Dairy Co. delivery" },
      { date:"2026-01-22", type:"OUT", reference:"Waste log", qty: 400, unit:"g", balance: -1200, note:"Melted / temp control issue" },
      { date:"2026-01-21", type:"IN", reference:"PO-10412", qty: 2000, unit:"g", balance: -800, note:"Small top-up order" }
    ],
    "2001": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 900, unit:"g", balance: 3200, note:"Guacamole / salads" },
      { date:"2026-01-27", type:"IN", reference:"RCV-77108", qty: 6000, unit:"g", balance: 4100, note:"Fresh Market delivery" },
      { date:"2026-01-26", type:"OUT", reference:"POS sales", qty: 1400, unit:"g", balance: -1900, note:"Pool bar snacks" },
      { date:"2026-01-25", type:"IN", reference:"PO-10433", qty: 2500, unit:"g", balance: -500, note:"Emergency purchase" }
    ],
    "2002": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 700, unit:"g", balance: 2500, note:"Salads" },
      { date:"2026-01-27", type:"IN", reference:"RCV-77108", qty: 4000, unit:"g", balance: 3200, note:"Fresh Market delivery" },
      { date:"2026-01-26", type:"OUT", reference:"POS sales", qty: 1100, unit:"g", balance: -800, note:"Dinner service" }
    ],
    "2006": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 1200, unit:"g", balance: 0, note:"Used last batch" },
      { date:"2026-01-27", type:"OUT", reference:"Waste log", qty: 600, unit:"g", balance: 1200, note:"Soft / damaged" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77108", qty: 3000, unit:"g", balance: 1800, note:"Partial delivery (short shipped)" }
    ],
    "5001": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 2500, unit:"g", balance: 14000, note:"Lunch + dinner" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77098", qty: 18000, unit:"g", balance: 16500, note:"Butcher delivery" },
      { date:"2026-01-24", type:"OUT", reference:"POS sales", qty: 4500, unit:"g", balance: -1500, note:"Weekend peak" }
    ],
    "3001": [
      { date:"2026-01-28", type:"OUT", reference:"POS sales", qty: 900, unit:"g", balance: 7000, note:"Breakfast specials" },
      { date:"2026-01-26", type:"IN", reference:"RCV-77098", qty: 6000, unit:"g", balance: 7900, note:"Butcher delivery" },
      { date:"2026-01-24", type:"OUT", reference:"POS sales", qty: 1600, unit:"g", balance: 1900, note:"Weekend peak" }
    ],
    "1001": [
      { date:"2026-01-18", type:"IN", reference:"Adjustment", qty: 20, unit:"g", balance: 790, note:"Stock count correction" },
      { date:"2026-01-15", type:"OUT", reference:"POS sales", qty: 80, unit:"g", balance: 770, note:"Recipe usage" },
      { date:"2026-01-10", type:"IN", reference:"PO-10405", qty: 1000, unit:"g", balance: 850, note:"Supplier delivery" }
    ],
    "1002": [
      { date:"2026-01-27", type:"OUT", reference:"POS sales", qty: 120, unit:"g", balance: 1100, note:"Kitchen usage" },
      { date:"2026-01-12", type:"IN", reference:"PO-10388", qty: 1200, unit:"g", balance: 1220, note:"Supplier delivery" }
    ],
    "1005": [
      { date:"2026-01-27", type:"OUT", reference:"POS sales", qty: 50, unit:"g", balance: 120, note:"Kitchen usage" },
      { date:"2026-01-05", type:"IN", reference:"PO-10360", qty: 300, unit:"g", balance: 170, note:"Supplier delivery" }
    ]
  },
  issues: [],
},
      // Item Master (single source of truth)
      // NOTE: UI modules still read `items` by sku, but internally we attach a stable `id`
      // so PR/PO, supplier catalogs, inventory movements can all reference the same item.
      items: [
        { id:'ITM-1001', sku:'1001', name:'Anise Star', uom:'g', category:'Spices', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1002', sku:'1002', name:'Balsamic Vinegar', uom:'g', category:'Sauces', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1003', sku:'1003', name:'Beans in Tomato Sauce', uom:'g', category:'Canned', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1004', sku:'1004', name:'Bechamel', uom:'g', category:'Sauces', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1005', sku:'1005', name:'Black Pepper', uom:'g', category:'Spices', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1006', sku:'1006', name:'Black Sesame', uom:'g', category:'Dry goods', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1007', sku:'1007', name:'Black Pepper Sauce', uom:'g', category:'Sauces', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1008', sku:'1008', name:'Butter', uom:'g', purchaseUom:'kg', purchaseToBase:1000, category:'Dairy', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1012', sku:'1012', name:'Milk', uom:'ml', purchaseUom:'L', purchaseToBase:1000, category:'Dairy', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-1016', sku:'1016', name:'Eggs', uom:'pcs', purchaseUom:'tray', purchaseToBase:30, category:'Dairy', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-2001', sku:'2001', name:'Avocado', uom:'g', purchaseUom:'kg', purchaseToBase:1000, category:'Produce', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-2002', sku:'2002', name:'Lettuce', uom:'g', purchaseUom:'kg', purchaseToBase:1000, category:'Produce', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-2006', sku:'2006', name:'Tomatoes', uom:'g', purchaseUom:'kg', purchaseToBase:1000, category:'Produce', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-3001', sku:'3001', name:'Bacon', uom:'g', purchaseUom:'kg', purchaseToBase:1000, category:'Meat & Poultry', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-3002', sku:'3002', name:'Beef', uom:'g', category:'Meat & Poultry', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-3003', sku:'3003', name:'Beef Minced Meat', uom:'g', category:'Meat & Poultry', active:true, createdAt: nowISO(), updatedAt: nowISO() },
        { id:'ITM-5001', sku:'5001', name:'Chicken breast', uom:'g', category:'Meat & Poultry', active:true, createdAt: nowISO(), updatedAt: nowISO() }
      ],
      supplierItems: [
        // Dairy Co.
        { supplierId:'SUP-10001', sku:'1008', unitPrice: 140, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10001', sku:'1012', unitPrice: 15, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10001', sku:'1016', unitPrice: 2500, currency:'IDR', active:true, updatedAt: nowISO() },
        // Fresh Market
        { supplierId:'SUP-10002', sku:'1001', unitPrice: 230, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10002', sku:'2001', unitPrice: 120, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10002', sku:'2002', unitPrice: 40, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10002', sku:'2006', unitPrice: 45, currency:'IDR', active:true, updatedAt: nowISO() },
        // Butcher
        { supplierId:'SUP-10003', sku:'3001', unitPrice: 220, currency:'IDR', active:true, updatedAt: nowISO() },
        { supplierId:'SUP-10003', sku:'5001', unitPrice: 85, currency:'IDR', active:true, updatedAt: nowISO() },
      ],
      suppliers: [
        {
          id: 'SUP-10001',
          name: 'Dairy Co.',
          status: 'Active',
          category: 'Dairy',
          currency: 'IDR',
          contactName: 'Ayu',
          email: 'sales@dairyco.example',
          phone: '+62 812-0000-0001',
          paymentTerms: 'Net 14',
          leadTimeDays: 2,
          minOrderValue: 0,
          deliveryWindow: 'Mon–Sat 08:00–14:00',
          address: 'Denpasar, Bali',
          posVendorId: 'VEND-DAIRY-01',
          qbVendorId: 'QB-DAIRY-01',
          bankRef: '**** 1234',
          onTimeRate: 95,
          qualityScore: 92,
          notes: 'Preferred for butter, milk, eggs.',
          createdAt: nowISO()
        },
        {
          id: 'SUP-10002',
          name: 'Fresh Market',
          status: 'Active',
          category: 'Produce',
          currency: 'IDR',
          contactName: 'Made',
          email: 'orders@freshmarket.example',
          phone: '+62 812-0000-0002',
          paymentTerms: 'Due on receipt',
          leadTimeDays: 1,
          minOrderValue: 0,
          deliveryWindow: 'Daily 06:00–11:00',
          address: 'Badung, Bali',
          posVendorId: 'VEND-PRODUCE-01',
          qbVendorId: 'QB-PRODUCE-01',
          bankRef: '**** 7788',
          onTimeRate: 90,
          qualityScore: 88,
          notes: 'Morning delivery only.',
          createdAt: nowISO()
        },
        {
          id: 'SUP-10003',
          name: 'Butcher',
          status: 'Active',
          category: 'Meat & Poultry',
          currency: 'IDR',
          contactName: 'Komang',
          email: 'hello@butcher.example',
          phone: '+62 812-0000-0003',
          paymentTerms: 'Net 7',
          leadTimeDays: 2,
          minOrderValue: 0,
          deliveryWindow: 'Tue–Sun 09:00–15:00',
          address: 'Ubud, Bali',
          posVendorId: 'VEND-MEAT-01',
          qbVendorId: 'QB-MEAT-01',
          bankRef: '**** 9911',
          onTimeRate: 92,
          qualityScore: 93,
          notes: 'Confirm cut size in PO notes.',
          createdAt: nowISO()
        }
      ]
    };
  }

  // ------------------------------
  // Bills / Invoices / Payments
  // ------------------------------
  function parseNetDays(paymentTerms){
    const t = String(paymentTerms||'').trim().toLowerCase();
    if (!t) return 0;
    if (t.includes('due on receipt')) return 0;
    const m = t.match(/net\s*(\d+)/i);
    if (m) return Math.max(0, Number(m[1]||0));
    return 0;
  }

  function addDays(dateISO, days){
    const d = new Date(dateISO);
    if (Number.isNaN(d.getTime())) return dateISO;
    d.setDate(d.getDate() + Number(days||0));
    return d.toISOString().slice(0,10);
  }

  function computeDueDateForSupplier(store, supplierId, invoiceDate){
    const sup = (store.suppliers||[]).find(s=>String(s.id)===String(supplierId));
    const net = parseNetDays(sup?.paymentTerms);
    const base = invoiceDate || new Date().toISOString().slice(0,10);
    return addDays(base, net);
  }

  function billSubtotal(bill){
    return (bill.lines||[]).reduce((s,ln)=> s + (Number(ln.invoicedQty||0) * Number(ln.invoicedUnitPrice||0)), 0);
  }
  function billCreditsTotal(bill){
    return (bill.appliedCredits||[]).reduce((s,c)=> s + Number(c.amount||0), 0);
  }
  function billTotal(bill){
    return Math.max(0, billSubtotal(bill) - billCreditsTotal(bill));
  }
  function billPaid(store, billId){
    return (store.payments||[]).filter(p=>String(p.billId)===String(billId)).reduce((s,p)=> s + Number(p.amount||0), 0);
  }

  function billPaymentStatus(store, bill){
    const total = billTotal(bill);
    const paid = billPaid(store, bill.id);
    if (paid <= 0) return 'Unpaid';
    if (paid + 0.00001 < total) return 'Partially paid';
    return 'Paid';
  }

  function billMatchSummary(bill){
    let qtyMismatch = false;
    let priceMismatch = false;
    (bill.lines||[]).forEach(ln=>{
      const recv = Number(ln.receivedQty||0);
      const inv = Number(ln.invoicedQty||0);
      if (inv > recv + 1e-9) qtyMismatch = true;
      const poP = Number(ln.poUnitPrice||0);
      const invP = Number(ln.invoicedUnitPrice||0);
      if (poP && invP && (invP > poP + 1e-9)) priceMismatch = true;
    });
    if (qtyMismatch && priceMismatch) return 'Qty & price mismatch';
    if (qtyMismatch) return 'Qty mismatch';
    if (priceMismatch) return 'Price mismatch';
    return 'Matched';
  }

  function createBillFromPO(poId, opts){
    const store = getStore();
    const po = (store.pos||[]).find(p=>String(p.id)===String(poId));
    if (!po) return null;
    const supplierId = po.supplierId || (store.suppliers||[]).find(s=>s.name===po.supplier)?.id || '';
    // Find latest receiving for this PO (prefer completed)
    const rcvs = (store.receivings||[]).filter(r=>String(r.poId)===String(po.id));
    const rcv = rcvs.find(r=>String(r.status)==='Completed') || rcvs[0] || null;
    const invoiceDate = (opts && opts.invoiceDate) ? String(opts.invoiceDate) : new Date().toISOString().slice(0,10);
    const dueDate = computeDueDateForSupplier(store, supplierId, invoiceDate);
    const bill = {
      id: id('BILL'),
      createdAt: nowISO(),
      status: 'Draft',
      supplierId,
      supplier: po.supplier || '',
      poId: po.id,
      receivingId: rcv ? rcv.id : null,
      invoiceNo: (opts && opts.invoiceNo) ? String(opts.invoiceNo) : ('INV-' + (po.supplier||'SUP').toUpperCase().slice(0,4) + '-' + Math.floor(Math.random()*9000+1000)),
      invoiceDate,
      dueDate,
      currency: 'IDR',
      notes: '',
      appliedCredits: [],
      lines: (po.items||[]).map(it=>{
        const r = rcv ? (rcv.items||[]).find(x=>x.sku===it.sku) : null;
        const receivedQty = r ? Number(r.receivedQty||0) : Number(it.receivedQty||0);
        const useReceived = (opts && opts.useReceivedQty != null) ? !!opts.useReceivedQty : true;
        const orderedQty = Number(it.orderedQty||0);
        // 3-way match guardrail: an invoice line can never exceed what was received.
        // (If the supplier invoice is higher than received, this should be handled as a dispute,
        // not by letting the system drift out of sync.)
        const invoicedCandidate = useReceived ? receivedQty : orderedQty;
        return {
          sku: it.sku,
          itemId: it.itemId || stableItemIdFromSku(it.sku),
          name: it.name,
          uom: it.uom,
          poOrderedQty: orderedQty,
          receivedQty,
          invoicedQty: Math.max(0, Math.min(invoicedCandidate, receivedQty)),
          poUnitPrice: Number(it.unitPrice||0),
          invoicedUnitPrice: Number(it.unitPrice||0)
        };
      }),
      activity: [
        { at: nowISO(), text: 'Bill created from PO ' + po.id }
      ]
    };
    store.bills = store.bills || [];
    store.bills.unshift(bill);
    saveStore(store);
    return bill;
  }

  // ------------------------------
  // Inventory posting (Receiving -> Inventory)
  // ------------------------------
  function postInventoryFromReceiving(receivingId){
    const store = getStore();
    const rcv = (store.receivings||[]).find(r=>String(r.id)===String(receivingId));
    if (!rcv) return { ok:false, reason:'Receiving not found' };
    if (String(rcv.status)!=='Completed') return { ok:false, reason:'Receiving not completed' };
    if (rcv.inventoryPostedAt) return { ok:true, already:true, postedAt: rcv.inventoryPostedAt, moved:0 };

    store.inventory = store.inventory || seedStore().inventory;
    store.inventory.balances = store.inventory.balances || {};
    store.inventory.movements = store.inventory.movements || {};

    const postedDate = (rcv.receivedAt || new Date().toISOString().slice(0,10));
    let moved = 0;

    (rcv.items||[]).forEach(it=>{
      const sku = String(it.sku||'').trim();
      if (!sku) return;
      const qty = Number(it.receivedQty||0);
      if (!(qty>0)) return;

      const meta = getUomMeta(store, sku);
      const uom = it.uom || meta.baseUom || 'unit';
      const qtyBase = toBaseQty(store, sku, qty, uom);
      if (!(qtyBase>0)) return;

      const prev = Number(store.inventory.balances[sku]||0);
      const next = prev + qtyBase;
      store.inventory.balances[sku] = next;
      if (!Array.isArray(store.inventory.movements[sku])) store.inventory.movements[sku] = [];

      const note = (meta.purchaseUom && meta.purchaseToBase && String(uom).toLowerCase()===String(meta.purchaseUom).toLowerCase())
        ? ('Goods receipt for ' + (rcv.poId || 'PO') + ` (${qty} ${uom} -> ${qtyBase} ${meta.baseUom})`)
        : ('Goods receipt for ' + (rcv.poId || 'PO'));

      store.inventory.movements[sku].unshift({
        date: postedDate,
        type: 'IN',
        reference: rcv.id,
        qty: qtyBase,
        unit: meta.baseUom,
        balance: next,
        note
      });
      moved += 1;
    });

    rcv.inventoryPostedAt = nowISO();
    rcv.activity = rcv.activity || [];
    rcv.activity.unshift({ at: nowISO(), text: 'Inventory updated from goods receipt' });
    saveStore(store);
    return { ok:true, moved, postedAt: rcv.inventoryPostedAt };
  }

  function recordPayment(billId, payment){
    const store = getStore();
    const bill = (store.bills||[]).find(b=>String(b.id)===String(billId));
    if (!bill) return null;
    const pay = Object.assign({
      id: id('PAY'),
      billId: bill.id,
      date: new Date().toISOString().slice(0,10),
      method: 'Bank transfer',
      reference: '',
      amount: 0,
      createdAt: nowISO()
    }, payment||{});
    pay.amount = Math.max(0, Number(pay.amount||0));
    store.payments = store.payments || [];
    store.payments.unshift(pay);
    bill.activity = bill.activity || [];
    bill.activity.unshift({ at: nowISO(), text: 'Payment recorded: ' + pay.amount + ' ' + (bill.currency||'') });
    saveStore(store);
    return pay;
  }

  function applyCreditToBill(billId, creditId, amount){
    const store = getStore();
    const bill = (store.bills||[]).find(b=>String(b.id)===String(billId));
    const crd = (store.credits||[]).find(c=>String(c.id)===String(creditId));
    if (!bill || !crd) return false;
    const maxAmt = (crd.items||[]).reduce((s,it)=> s + Number(it.amount||0), 0);
    const amt = Math.max(0, Math.min(Number(amount||maxAmt), maxAmt));
    bill.appliedCredits = bill.appliedCredits || [];
    // prevent duplicates
    bill.appliedCredits = bill.appliedCredits.filter(x=>String(x.creditId)!==String(creditId));
    bill.appliedCredits.push({ creditId: crd.id, amount: amt, appliedAt: nowISO() });
    crd.status = 'Applied';
    crd.billId = bill.id;
    crd.activity = crd.activity || [];
    crd.activity.unshift({ at: nowISO(), text: 'Applied to bill ' + bill.id });
    bill.activity = bill.activity || [];
    bill.activity.unshift({ at: nowISO(), text: 'Vendor credit applied: ' + crd.id });
    saveStore(store);
    return true;
  }

  // ------------------------------
  // Item Master (backend-only optimization)
  // ------------------------------
  function stableItemIdFromSku(sku){
    const s = String(sku||'').trim();
    // deterministic id (keeps refs stable across reloads/migrations)
    const clean = s.replace(/[^a-z0-9]/gi,'');
    return 'ITM-' + (clean || '0000');
  }

  function buildItemIndex(store){
    const idxBySku = {};
    const idxById = {};
    (store.items||[]).forEach(it=>{
      const sku = String(it.sku||'').trim();
      if (!sku) return;
      const idv = String(it.id||'').trim() || stableItemIdFromSku(sku);
      it.id = idv;
      it.sku = sku;
      if (it.active == null) it.active = true;
      if (!it.createdAt) it.createdAt = nowISO();
      if (!it.updatedAt) it.updatedAt = it.createdAt;
      idxBySku[sku] = it;
      idxById[idv] = it;
    });
    return { idxBySku, idxById };
  }

  function collectReferencedSkus(store){
    const skus = new Set();
    // Inventory balances keys
    try{
      Object.keys(store.inventory?.balances || {}).forEach(k=> skus.add(String(k)));
    }catch(e){}
    // Supplier catalogs
    (store.supplierItems||[]).forEach(r=>{ if (r && (r.sku!=null || r.itemId!=null)) skus.add(String(r.sku||'')); });
    // PR/PO line items
    (store.prs||[]).forEach(pr => (pr.items||[]).forEach(li=>{ if (li && li.sku!=null) skus.add(String(li.sku)); }));
    (store.pos||[]).forEach(po => (po.items||[]).forEach(li=>{ if (li && li.sku!=null) skus.add(String(li.sku)); }));
    // Receivings (some prototypes copy PO items)
    (store.receivings||[]).forEach(rcv => (rcv.items||[]).forEach(li=>{ if (li && li.sku!=null) skus.add(String(li.sku)); }));
    // Clean blanks
    skus.delete('');
    return Array.from(skus);
  }

  function ensureItemMaster(store){
    store.itemMaster = store.itemMaster || {};
    // Idempotent: only run migrations when needed
    const current = Number(store.itemMaster.version || 0);
    if (current >= ITEM_MASTER_VERSION){
      // Still make sure indexes are consistent (ids present)
      buildItemIndex(store);
      return;
    }

    // 1) Normalize and de-duplicate items by SKU (keep best metadata)
    const bySku = {};
    (store.items||[]).forEach(raw=>{
      const sku = String(raw?.sku||'').trim();
      if (!sku) return;
      const existing = bySku[sku];
      const merged = existing ? Object.assign({}, existing) : {};
      // Prefer non-empty fields
      ['name','uom','category'].forEach(k=>{
        const v = raw?.[k];
        if (v != null && String(v).trim() && (!merged[k] || !String(merged[k]).trim())) merged[k] = v;
      });
      merged.sku = sku;
      merged.id = String(raw?.id||'').trim() || merged.id || stableItemIdFromSku(sku);
      merged.active = (raw?.active == null) ? (merged.active==null ? true : merged.active) : raw.active;
      merged.createdAt = raw?.createdAt || merged.createdAt || nowISO();
      merged.updatedAt = raw?.updatedAt || merged.updatedAt || merged.createdAt;
      bySku[sku] = merged;
    });
    store.items = Object.values(bySku);

    // 2) Ensure all referenced SKUs exist in the master
    const idx = buildItemIndex(store).idxBySku;
    const referenced = collectReferencedSkus(store);
    referenced.forEach(sku=>{
      if (!sku) return;
      if (!idx[sku]){
        // Try to infer a name from PR/PO line items
        let name = '';
        let uom = '';
        let category = '';
        const scan = (arr)=>{
          (arr||[]).some(doc=>{
            return (doc.items||[]).some(li=>{
              if (String(li.sku||'') === sku){
                name = name || (li.name||'');
                uom = uom || (li.uom||'');
                category = category || (li.category||'');
                return true;
              }
              return false;
            });
          });
        };
        scan(store.prs);
        scan(store.pos);
        const it = {
          id: stableItemIdFromSku(sku),
          sku,
          name: name || ('Item ' + sku),
          uom: uom || '—',
          category: category || '—',
          active: true,
          createdAt: nowISO(),
          updatedAt: nowISO()
        };
        store.items.push(it);
        idx[sku] = it;
      }
    });

    // 3) Attach itemId references to all documents (storage-only; UI still uses sku/name)
    const idx2 = buildItemIndex(store);
    function attachItemRef(li){
      if (!li) return;
      const sku = String(li.sku||'').trim();
      if (sku && idx2.idxBySku[sku]){
        li.itemId = idx2.idxBySku[sku].id;
        // Backfill missing display fields from master
        if (!li.name) li.name = idx2.idxBySku[sku].name;
        if (!li.uom) li.uom = idx2.idxBySku[sku].uom;
      } else if (li.itemId && idx2.idxById[String(li.itemId)]){
        const it = idx2.idxById[String(li.itemId)];
        li.sku = li.sku || it.sku;
        li.name = li.name || it.name;
        li.uom = li.uom || it.uom;
      }
    }

    (store.supplierItems||[]).forEach(r=>{
      if (!r) return;
      // Keep sku for backward compatibility, but also store itemId.
      const sku = String(r.sku||'').trim();
      if (sku && idx2.idxBySku[sku]){
        r.itemId = idx2.idxBySku[sku].id;
        r.sku = sku;
      } else if (r.itemId && idx2.idxById[String(r.itemId)]){
        r.sku = idx2.idxById[String(r.itemId)].sku;
      }
      if (!r.updatedAt) r.updatedAt = nowISO();
      if (r.active == null) r.active = true;
    });

    (store.prs||[]).forEach(pr => (pr.items||[]).forEach(attachItemRef));
    (store.pos||[]).forEach(po => (po.items||[]).forEach(attachItemRef));
    (store.receivings||[]).forEach(rcv => (rcv.items||[]).forEach(attachItemRef));

    store.itemMaster.version = ITEM_MASTER_VERSION;
    store.itemMaster.migratedAt = nowISO();
  }

  function normalizeStore(store){
    // Ensure new keys exist when user already has older localStorage data.
    store = store || {};
    if (!store.user) store.user = seedStore().user;
    if (!store.user.role) store.user.role = 'staff';
    if (!store.settings) store.settings = seedStore().settings;
    // Backfill new settings keys without overwriting existing values
    if (!store.settings.reorderPoints) store.settings.reorderPoints = seedStore().settings.reorderPoints;
    if (!Array.isArray(store.settings.thresholds)) store.settings.thresholds = seedStore().settings.thresholds;
    if (!Array.isArray(store.prs)) store.prs = [];
    // Seed / backfill a few realistic PRs so the Approvals inbox has data.
    // We DO NOT wipe existing user data. Instead, if there are no pending PRs,
    // we append a small demo set (by id) that won't duplicate.
    const demoPRs = seedStore().prs.slice();
    const existingIds = new Set((store.prs||[]).map(p=>String(p.id||'')));
    const pendingCount = (store.prs||[]).filter(p=>String(p.status||'')==='Pending approval').length;
    if (store.prs.length === 0){
      store.prs = demoPRs.slice();
    } else if (pendingCount === 0){
      // append only the pending demo PRs (and keep approved/rejected as-is)
      demoPRs.filter(p=>String(p.status||'')==='Pending approval').forEach(p=>{
        if (!existingIds.has(String(p.id||''))) store.prs.push(p);
      });
    }
    if (!Array.isArray(store.pos)) store.pos = [];
    if (!Array.isArray(store.receivings)) store.receivings = [];
    if (!Array.isArray(store.credits)) store.credits = [];
    if (!Array.isArray(store.bills)) store.bills = [];
    if (!Array.isArray(store.payments)) store.payments = [];
    if (!Array.isArray(store.bills)) store.bills = [];
    if (!Array.isArray(store.payments)) store.payments = [];
    if (!store.inventory) store.inventory = seedStore().inventory;
    if (!store.inventory.balances) store.inventory.balances = seedStore().inventory.balances;
    if (!store.inventory.movements) store.inventory.movements = seedStore().inventory.movements;

    if (!Array.isArray(store.items)) store.items = seedStore().items;
    if (!Array.isArray(store.supplierItems)) store.supplierItems = seedStore().supplierItems;
    if (!Array.isArray(store.suppliers)) store.suppliers = seedStore().suppliers;

    // Seed a minimal end-to-end bill demo only when the user has no procurement docs yet.
    // This keeps existing prototypes intact.
    if ((store.bills||[]).length===0 && (store.pos||[]).length===0 && (store.receivings||[]).length===0){
      const demoPO = {
        id: 'PO-14001',
        createdAt: nowISO(),
        supplierId: 'SUP-10001',
        supplier: 'Dairy Co.',
        deliveryTo: 'Main kitchen',
        expectedDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10),
        linkedPR: 'PR-11990',
        status: 'Received',
        items: [
          { name:'Milk', sku:'1012', uom:'ml', orderedQty: 25000, receivedQty: 25000, unitPrice: 8 },
          { name:'Butter', sku:'1008', uom:'g', orderedQty: 8000, receivedQty: 7800, unitPrice: 150 }
        ],
        activity: [{ at: nowISO(), text:'PO created' }, { at: nowISO(), text:'Receiving completed: RCV-44001' }]
      };
      const demoRcv = {
        id: 'RCV-44001',
        createdAt: nowISO(),
        poId: demoPO.id,
        supplier: demoPO.supplier,
        supplierId: demoPO.supplierId,
        receivedDate: new Date().toISOString().slice(0,10),
        status: 'Completed',
        items: demoPO.items.map(it=>({ name:it.name, sku:it.sku, uom:it.uom, orderedQty:it.orderedQty, receivedQty:it.receivedQty, unitPrice:it.unitPrice })),
        activity: [{ at: nowISO(), text:'Receiving completed' }]
      };

      // Ensure seeded goods receipt also updates inventory balances & movements
      store.inventory = store.inventory || { balances:{}, movements:{} };
      store.inventory.balances = store.inventory.balances || {};
      store.inventory.movements = store.inventory.movements || {};
      demoRcv.inventoryPostedAt = nowISO();
      (demoRcv.items||[]).forEach(it=>{
        const sku = String(it.sku||'').trim();
        const qty = Number(it.receivedQty||0);
        if (!sku || qty <= 0) return;
        const prev = Number(store.inventory.balances[sku]||0);
        const next = prev + qty;
        store.inventory.balances[sku] = next;
        store.inventory.movements[sku] = Array.isArray(store.inventory.movements[sku]) ? store.inventory.movements[sku] : [];
        store.inventory.movements[sku].unshift({
          date: demoRcv.receivedDate,
          type: 'IN',
          reference: demoRcv.id,
          qty,
          unit: it.uom || '',
          balance: next,
          note: 'Goods receipt from ' + demoPO.id
        });
      });
      store.pos.unshift(demoPO);
      store.receivings.unshift(demoRcv);
      const demoBill = {
        id: 'BILL-55001',
        createdAt: nowISO(),
        status: 'Posted',
        supplierId: demoPO.supplierId,
        supplier: demoPO.supplier,
        poId: demoPO.id,
        receivingId: demoRcv.id,
        invoiceNo: 'INV-DAIRY-00921',
        invoiceDate: new Date().toISOString().slice(0,10),
        dueDate: computeDueDateForSupplier(store, demoPO.supplierId, new Date().toISOString().slice(0,10)),
        currency: 'IDR',
        notes: '',
        appliedCredits: [],
        lines: demoPO.items.map(it=>({
          sku: it.sku,
          itemId: stableItemIdFromSku(it.sku),
          name: it.name,
          uom: it.uom,
          poOrderedQty: it.orderedQty,
          receivedQty: it.receivedQty,
          invoicedQty: it.receivedQty,
          poUnitPrice: it.unitPrice,
          invoicedUnitPrice: it.unitPrice
        })),
        activity: [{ at: nowISO(), text:'Bill created from PO ' + demoPO.id }, { at: nowISO(), text:'Bill posted' }]
      };
      store.bills.unshift(demoBill);
      store.payments.unshift({
        id: 'PAY-77001',
        billId: demoBill.id,
        date: new Date().toISOString().slice(0,10),
        method: 'Bank transfer',
        reference: 'TRX-001',
        amount: 200000,
        createdAt: nowISO()
      });
    }

    // Backend-only: unify material master data so all modules reference the same items.
    // This does NOT change how the UI renders.
    ensureItemMaster(store);

    return store;
  }

  function getStore(){
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if (raw){
        const normalized = normalizeStore(JSON.parse(raw));
        // Persist migrations/backfills immediately (safe, additive)
        saveStore(normalized);
        return normalized;
      }
    }catch(e){}
    const seed = seedStore();
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(seed)); }catch(e){}
    return seed;
  }

  function saveStore(store){
    try{ localStorage.setItem(STORE_KEY, JSON.stringify(store)); }catch(e){}
  }

  function getOrCreateDraftPR(opts){
    const store = getStore();
    let pr = store.prs.find(p => p.status === 'Draft');
    if (!pr){
      const supplierId = opts && opts.supplierId ? String(opts.supplierId) : null;
      pr = {
        id: id('PR'),
        createdAt: nowISO(),
        requester: 'HY',
        scope: 'Full store',
        location: 'Main kitchen',
        neededBy: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
        status: 'Draft',
        approvals: [],
        items: [],
        preferredSupplierId: supplierId,
        activity: [{ at: nowISO(), text: 'Draft requisition created' }]
      };
      store.prs.unshift(pr);
      saveStore(store);
    }
    return pr;
  }

  // Always creates a new draft PR (used when launching a PR from a supplier context)
  function createDraftPR(opts){
    const store = getStore();
    const supplierId = opts && opts.supplierId ? String(opts.supplierId) : null;
    const pr = {
      id: id('PR'),
      createdAt: nowISO(),
      requester: 'HY',
      scope: 'Full store',
      location: 'Main kitchen',
      neededBy: new Date(Date.now()+7*86400000).toISOString().slice(0,10),
      status: 'Draft',
      approvals: [],
      items: [],
      preferredSupplierId: supplierId,
      activity: [{ at: nowISO(), text: 'Draft requisition created' }]
    };
    store.prs.unshift(pr);
    saveStore(store);
    return pr;
  }

  function addItemToDraftPR(item){
    const store = getStore();
    const pr = store.prs.find(p => p.status === 'Draft') || getOrCreateDraftPR();
    // Normalize supplier info when adding from quick actions
    let supplierId = item.supplierId ? String(item.supplierId) : '';
    if (!supplierId && item.supplier){
      const s = (store.suppliers||[]).find(x => String(x.name||'').toLowerCase() === String(item.supplier||'').toLowerCase());
      if (s) supplierId = String(s.id);
    }
    if (supplierId) item.supplierId = supplierId;

    const found = (pr.items||[]).find(x => x.sku === item.sku && String(x.supplierId||'') === String(item.supplierId||''));
    if (found){
      found.qty = (found.qty||0) + (item.qty||0);
      // Keep latest unit price
      if (item.estUnitPrice != null) found.estUnitPrice = item.estUnitPrice;
    } else {
      pr.items = pr.items || [];
      pr.items.push(item);
    }
    pr.activity = pr.activity || [];
    pr.activity.unshift({ at: nowISO(), text: 'Item added: ' + (item.name||'Item') });
    saveStore(store);
    window.ProcurementDemo?.toast?.('Added to draft PR');
  }



  // ------------------------------
  // Item + UOM helpers
  // ------------------------------
  function getItemBySku(store, sku){
    const s = store || getStore();
    const idSku = String(sku||'').trim();
    return (s.items||[]).find(it=> String(it.sku||'').trim()===idSku) || null;
  }

  function getUomMeta(store, sku){
    const s = store || getStore();
    const item = getItemBySku(s, sku) || {};
    const baseUom = String(item.uom || 'unit');
    const purchaseUom = item.purchaseUom ? String(item.purchaseUom) : '';
    const purchaseToBase = (item.purchaseToBase!=null) ? Number(item.purchaseToBase||0) : 0;
    return { baseUom, purchaseUom, purchaseToBase };
  }

  function toBaseQty(store, sku, qty, uom){
    const q = Number(qty||0);
    if (!(q>0)) return 0;
    const meta = getUomMeta(store, sku);
    const u = String(uom||meta.baseUom||'').toLowerCase();
    if (meta.purchaseUom && meta.purchaseToBase && u === String(meta.purchaseUom).toLowerCase()){
      return q * meta.purchaseToBase;
    }
    return q;
  }

  function fromBaseQty(store, sku, qtyBase, targetUom){
    const q = Number(qtyBase||0);
    const meta = getUomMeta(store, sku);
    const u = String(targetUom||meta.baseUom||'').toLowerCase();
    if (meta.purchaseUom && meta.purchaseToBase && u === String(meta.purchaseUom).toLowerCase()){
      return q / meta.purchaseToBase;
    }
    return q;
  }

  function formatQty(store, sku, qtyBase, preferPurchase){
    const meta = getUomMeta(store, sku);
    const q = Number(qtyBase||0);
    if (preferPurchase && meta.purchaseUom && meta.purchaseToBase){
      const qp = Math.ceil(q / meta.purchaseToBase);
      return { primary: `${qp.toLocaleString('en-US')} ${meta.purchaseUom}`, secondary: `${q.toLocaleString('en-US')} ${meta.baseUom}` };
    }
    return { primary: `${q.toLocaleString('en-US')} ${meta.baseUom}`, secondary: '' };
  }

  // ------------------------------
  // Inventory usage / issue-out
  // ------------------------------
  function createStockIssue(payload){
    const store = getStore();
    store.inventory = store.inventory || seedStore().inventory;
    store.inventory.balances = store.inventory.balances || {};
    store.inventory.movements = store.inventory.movements || {};
    store.inventory.issues = store.inventory.issues || [];

    const issue = Object.assign({
      id: id('ISS'),
      date: new Date().toISOString().slice(0,10),
      location: 'Main kitchen',
      reason: 'Usage',
      reference: '',
      note: '',
      createdAt: nowISO(),
      lines: []
    }, payload||{});

    issue.lines = Array.isArray(issue.lines) ? issue.lines : [];

    issue.lines = issue.lines
      .map(l=>({
        sku: String(l.sku||'').trim(),
        qty: Number(l.qty||0),
        uom: String(l.uom||'').trim(),
        note: String(l.note||'').trim()
      }))
      .filter(l=> l.sku && l.qty>0);

    let moved = 0;

    // Validate: do not allow negative on-hand balances
    const requiredBySku = {};
    issue.lines.forEach(line=>{
      const sku = line.sku;
      const meta = getUomMeta(store, sku);
      const qtyBase = toBaseQty(store, sku, line.qty, line.uom||meta.baseUom);
      if (!(qtyBase>0)) return;
      requiredBySku[sku] = (requiredBySku[sku]||0) + qtyBase;
    });
    Object.keys(requiredBySku).forEach(sku=>{
      const prev = Number(store.inventory.balances[sku]||0);
      const meta = getUomMeta(store, sku);
      const need = Number(requiredBySku[sku]||0);
      if (need > prev){
        throw new Error(`Insufficient stock for SKU ${sku}. On-hand: ${prev} ${meta.baseUom}. Requested: ${need} ${meta.baseUom}.`);
      }
    });

    // Apply OUT movements
    issue.lines.forEach(line=>{
      const sku = line.sku;
      const meta = getUomMeta(store, sku);
      const qtyBase = toBaseQty(store, sku, line.qty, line.uom||meta.baseUom);
      if (!(qtyBase>0)) return;
      const prev = Number(store.inventory.balances[sku]||0);
      const next = prev - qtyBase;
      store.inventory.balances[sku] = next;
      if (!Array.isArray(store.inventory.movements[sku])) store.inventory.movements[sku] = [];

      const ref = issue.reference ? (issue.reference + ' / ' + issue.id) : issue.id;
      const baseNote = (issue.reason ? (issue.reason + ': ') : '') + (line.note || issue.note || 'Recorded usage');
      const convNote = (line.uom && meta.purchaseUom && meta.purchaseToBase && String(line.uom).toLowerCase()===String(meta.purchaseUom).toLowerCase())
        ? (baseNote + ` (${line.qty} ${line.uom} -> ${qtyBase} ${meta.baseUom})`)
        : baseNote;

      store.inventory.movements[sku].unshift({
        date: issue.date,
        type: 'OUT',
        reference: ref,
        qty: qtyBase,
        unit: meta.baseUom,
        balance: next,
        note: convNote
      });
      moved += 1;
    });

    store.inventory.issues.unshift(issue);
    saveStore(store);
    return { issue, moved };
  }

  // ------------------------------
  // Suggested ordering (reorder point -> PO)
  // ------------------------------
  function bestSupplierForSku(store, sku){
    const rows = (store.supplierItems||[]).filter(r=> String(r.sku||'').trim()===String(sku||'').trim() && (r.active!==false));
    if (!rows.length) return null;
    rows.sort((a,b)=> Number(a.unitPrice||0) - Number(b.unitPrice||0));
    const best = rows[0];
    const sup = (store.suppliers||[]).find(s=> String(s.id)===String(best.supplierId));
    return { supplierId: best.supplierId, supplier: sup?sup.name:(best.supplierId||'—'), unitPriceBase: Number(best.unitPrice||0) };
  }

  function getSuggestedOrders(opts){
    const store = getStore();
    const rpMap = (store.settings && store.settings.reorderPoints) ? store.settings.reorderPoints : {};
    const balances = (store.inventory && store.inventory.balances) ? store.inventory.balances : {};
    const buffer = (opts && typeof opts.bufferFactor==='number') ? opts.bufferFactor : 1.2;

    const out = [];
    Object.keys(rpMap||{}).forEach(sku=>{
      const rp = Number(rpMap[sku]||0);
      if (!(rp>0)) return;
      const onHand = Number(balances[sku]||0);
      if (onHand >= rp) return;
      const target = Math.ceil(rp * buffer);
      const suggestionBase = Math.max(0, target - onHand);
      const meta = getUomMeta(store, sku);
      const item = getItemBySku(store, sku);
      const sup = bestSupplierForSku(store, sku);

      const suggestedPurchaseQty = (meta.purchaseUom && meta.purchaseToBase) ? Math.ceil(suggestionBase / meta.purchaseToBase) : suggestionBase;
      const suggestedPurchaseUom = (meta.purchaseUom && meta.purchaseToBase) ? meta.purchaseUom : meta.baseUom;
      const unitPriceBase = sup ? Number(sup.unitPriceBase||0) : 0;
      const unitPricePurchase = (meta.purchaseUom && meta.purchaseToBase) ? unitPriceBase * meta.purchaseToBase : unitPriceBase;

      out.push({
        sku: String(sku),
        name: item ? item.name : ('SKU ' + sku),
        baseUom: meta.baseUom,
        purchaseUom: meta.purchaseUom,
        purchaseToBase: meta.purchaseToBase,
        supplierId: sup ? sup.supplierId : '',
        supplier: sup ? sup.supplier : '—',
        onHandBase: onHand,
        reorderPointBase: rp,
        targetBase: target,
        suggestedBase: suggestionBase,
        suggestedPurchaseQty,
        suggestedPurchaseUom,
        unitPriceBase,
        unitPricePurchase
      });
    });

    out.sort((a,b)=>{
      const ra = a.onHandBase / Math.max(1, a.reorderPointBase);
      const rb = b.onHandBase / Math.max(1, b.reorderPointBase);
      return ra - rb;
    });
    return out;
  }

  function createPODraftFromSuggested(supplierId){
    const store = getStore();
    const sid = String(supplierId||'').trim();
    if (!sid) return null;

    const suggestions = getSuggestedOrders({ bufferFactor: 1.2 }).filter(x=> String(x.supplierId||'')===sid);
    if (!suggestions.length) return null;

    const sup = (store.suppliers||[]).find(s=> String(s.id)===sid);
    const lead = sup ? Number(sup.leadTimeDays||0) : 2;
    const expected = new Date(Date.now() + Math.max(1,lead)*86400000).toISOString().slice(0,10);

    const po = {
      id: id('PO'),
      createdAt: nowISO(),
      supplierId: sid,
      supplier: sup ? sup.name : '—',
      location: 'Main kitchen',
      expectedDate: expected,
      status: 'Draft',
      linkedPR: '—',
      items: [],
      activity: [{ at: nowISO(), text: 'PO created from suggested ordering' }]
    };

    suggestions.forEach(sg=>{
      const qty = Number(sg.suggestedPurchaseQty||0);
      if (!(qty>0)) return;
      const uom = sg.suggestedPurchaseUom || sg.baseUom;
      const unitPrice = Math.max(0, Number(sg.unitPricePurchase||0));
      po.items.push({ name: sg.name, sku: sg.sku, uom: uom, orderedQty: qty, receivedQty: 0, unitPrice: unitPrice });
    });

    store.pos = store.pos || [];
    store.pos.unshift(po);
    saveStore(store);
    return po;
  }
  // ------------------------------
  // Permissions helpers
  // ------------------------------
  function getRole(){
    const store = getStore();
    return (store.user && store.user.role) ? String(store.user.role) : 'staff';
  }

  function setRole(role){
    const store = getStore();
    store.user = store.user || {};
    store.user.role = role === 'owner' ? 'owner' : 'staff';
    saveStore(store);
    return store.user.role;
  }

  function can(action){
    const role = getRole();
    if (role === 'owner') return true;
    const allow = {
      'create_pr': true,
      'view_pr': true,
      'view_po': true,
      'view_receiving': true
    };
    return !!allow[String(action||'')];
  }

  window.ProcurementDemo = window.ProcurementDemo || {};
  Object.assign(window.ProcurementDemo, {
    STORE_KEY,
    nowISO,
    id,
    getStore,
    saveStore,
    getOrCreateDraftPR,
    createDraftPR,
    addItemToDraftPR,
    getRole,
    setRole,
    can,
    // Bills API
    computeDueDateForSupplier,
    billSubtotal,
    billCreditsTotal,
    billTotal,
    billPaid,
    billPaymentStatus,
    billMatchSummary,
    createBillFromPO,
    postInventoryFromReceiving,
    recordPayment,
    applyCreditToBill,
    // Inventory + UOM
    getItemBySku,
    getUomMeta,
    toBaseQty,
    fromBaseQty,
    formatQty,
    createStockIssue,
    getSuggestedOrders,
    createPODraftFromSuggested
  });

  // Optional alias for convenience
  window.Auth = window.Auth || {};
  Object.assign(window.Auth, { getRole, setRole, can });
})();
