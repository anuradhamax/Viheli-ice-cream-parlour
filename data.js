// Product / Inventory Database
const productDb = {
    "CS73711": { description: "RED DHAL BULK", price: 224.00, stock: 150.500 },
    "FF30003": { description: "GOLDI SUPREME CHICKEN SAUSAGES", price: 1250.00, stock: 45.000 },
    "PL12984": { description: "CEYLON TEA PREMIUM 250G", price: 650.00, stock: 80.000 },
    "DY44820": { description: "ANCHOR MILK POWDER 1KG", price: 1890.00, stock: 32.000 },
    "BE77219": { description: "COCA COLA 2L BOTTLE", price: 450.00, stock: 64.000 },
    "FR88291": { description: "FRESH BANANAS 1KG", price: 320.00, stock: 95.200 },
    "DY10948": { description: "KOTMALE CHEESE BLOCK 200G", price: 780.00, stock: 20.000 },
    "FF99042": { description: "KELLS FRESH CHICKEN 1KG", price: 1450.00, stock: 18.500 }
};

// Customer Loyalty Database
const customerDb = {
    "0771234567": { name: "Nadun Perera", points: 845 },
    "0719876543": { name: "Shashikala Fernando", points: 1250 },
    "0812494896": { name: "Corporate Customer Account", points: 99420 }
};

// User / Authentication Database
const userDb = [
    { username: "KANCHANA", role: "Admin", pin: "1234", status: "Active" },
    { username: "PERERA", role: "Supervisor", pin: "0000", status: "Active" },
    { username: "KASUN", role: "Cashier", pin: "1111", status: "Active" }
];
// Sales Audit Log & Ledger Store
const salesLedger = [];