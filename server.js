// // server.js
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// require("dotenv").config();

// const app = express();

// // ===== Middleware =====
// app.use(cors({ origin: "*" }));
// app.use(bodyParser.json());

// // ===== MongoDB Connection =====
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ===== Models =====
// const AdminSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
// });
// const Admin = mongoose.model("Admin", AdminSchema);

// const Product = mongoose.model(
//   "Product",
//   new mongoose.Schema({
//     name: String,
//     description: String,
//     price: Number,
//     category: String,
//     image: String,
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
//   })
// );

// const Order = mongoose.model(
//   "Order",
//   new mongoose.Schema({
//     tableNumber: Number,
//     items: [
//       {
//         product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//         name: String,
//         price: Number,
//         quantity: Number,
//       },
//     ],
//     subtotal: Number,
//     tax: Number,
//     total: Number,
//     status: { type: String, default: "pending" },
//     createdAt: { type: Date, default: Date.now },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
//   })
// );

// const Settings = mongoose.model(
//   "Settings",
//   new mongoose.Schema({
//     restaurantName: String,
//     whatsappNumber: String,
//     taxRate: Number,
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
//   })
// );

// // ===== Middleware: Auth Check =====
// const authMiddleware = (req, res, next) => {
//   const token = req.headers["authorization"];
//   if (!token) return res.status(401).json({ message: "No token provided" });

//   jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(401).json({ message: "Invalid token" });
//     req.adminId = decoded.id;
//     next();
//   });
// };

// // ===== Auth Routes =====
// app.post("/api/auth/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existing = await Admin.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Email already exists" });

//     const hashed = await bcrypt.hash(password, 10);
//     const admin = new Admin({ name, email, password: hashed });
//     await admin.save();

//     res.status(201).json({ message: "Admin registered successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// app.get("/api/auth/verify", authMiddleware, async (req, res) => {
//   try {
//     const admin = await Admin.findById(req.adminId).select("-password");
//     if (!admin) return res.status(404).json({ message: "Admin not found" });
//     res.json({ admin });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const admin = await Admin.findOne({ email });
//     if (!admin) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ===== Products (Protected: Admin only) =====
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await Product.find().populate("createdBy", "name email");
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post("/api/products", authMiddleware, async (req, res) => {
//   try {
//     const product = new Product({ ...req.body, createdBy: req.adminId });
//     const newProduct = await product.save();
//     res.status(201).json(newProduct);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.put("/api/products/:id", authMiddleware, async (req, res) => {
//   try {
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updatedProduct);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.delete("/api/products/:id", authMiddleware, async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ===== Orders =====
// app.get("/api/orders", authMiddleware, async (req, res) => {
//   try {
//     const orders = await Order.find().populate("items.product").populate("createdBy", "name email").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Public: customers place orders
// app.post("/api/orders", async (req, res) => {
//   try {
//     const order = new Order(req.body);
//     const newOrder = await order.save();
//     res.status(201).json(newOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.put("/api/orders/:id/status", authMiddleware, async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status: req.body.status },
//       { new: true }
//     );
//     res.json(updatedOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // ===== Settings (Protected) =====
// app.get("/api/settings", async (req, res) => {
//   try {
//     let settings = await Settings.findOne();
//     res.json(settings || {});
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.put("/api/settings", authMiddleware, async (req, res) => {
//   try {
//     let settings = await Settings.findOne();
//     if (!settings) {
//       settings = new Settings({ ...req.body, createdBy: req.adminId });
//     } else {
//       settings.set(req.body);
//     }
//     const updatedSettings = await settings.save();
//     res.json(updatedSettings);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // ===== Test API =====
// app.get("/api", (req, res) => {
//   res.json({ message: "Welcome to the Restaurant Ordering System API" });
// });

// // ===== Start Server =====
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


// server.js
require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const helmet = require("helmet");
const twilio = require("twilio");

const app = express();

// ===== Basic Security & Middleware =====
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Ensure uploads dir exists
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOAD_DIR));

// ===== Multer (Image Upload) =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path.basename(file.originalname || "image", ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = /image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype);
    cb(ok ? null : new Error("Only image files are allowed (png, jpg, jpeg, webp, gif)"), ok);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Schemas & Models =====
const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);
const Admin = mongoose.model("Admin", AdminSchema);

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    visitCount: { type: Number, default: 1 },
    isLoyal: { type: Boolean, default: false },
    lastVisited: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);
const Customer = mongoose.model("Customer", CustomerSchema);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, index: true, trim: true },
    variants: [
      {
        size: {
          type: String,
          enum: ["half", "full", "small", "medium", "large", "regular", "custom"],
          required: true,
        },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    image: String,
    isAvailable: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", ProductSchema);

const OrderSchema = new mongoose.Schema(
  {
    tableNumber: Number,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        variant: String,
        price: Number,
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "preparing", "served", "completed", "cancelled"],
      default: "pending",
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    welcomeMessage: String,
    whatsappMessageId: String, // Store Twilio message ID for tracking
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", OrderSchema);

const SettingsSchema = new mongoose.Schema(
  {
    restaurantName: String,
    whatsappNumber: String,
    taxRate: { type: Number, default: 0 },
    loyaltyVisitsThreshold: { type: Number, default: 5 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);
const Settings = mongoose.model("Settings", SettingsSchema);

// ===== Auth Middleware =====
const authMiddleware = (req, res, next) => {
  try {
    const header = req.headers["authorization"] || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.adminId = decoded.id;
      next();
    });
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ===== Auth Routes =====
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email, password are required" });

    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, email, password: hashed });

    res.status(201).json({ message: "Admin registered successfully", adminId: admin._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/auth/verify", authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Settings =====
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/settings", authMiddleware, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ ...req.body, createdBy: req.adminId });
    } else {
      settings.set(req.body);
    }
    const updated = await settings.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Products =====
app.post(
  "/api/products",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        isAvailable = true,
        variants,
        imageUrl,
      } = req.body || {};

      if (!name) return res.status(400).json({ message: "name is required" });

      let parsedVariants = [];
      if (variants) {
        if (typeof variants === "string") {
          try {
            parsedVariants = JSON.parse(variants);
          } catch {
            return res
              .status(400)
              .json({ message: "variants must be a valid JSON array" });
          }
        } else if (Array.isArray(variants)) {
          parsedVariants = variants;
        }
      }

      let image = imageUrl || null;
      if (req.file) {
        image = `/uploads/${req.file.filename}`;
      }

      const product = await Product.create({
        name,
        description,
        category,
        variants: parsedVariants,
        image,
        isAvailable,
        createdBy: req.adminId,
      });

      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put(
  "/api/products/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const updates = { ...req.body };

      if (updates.variants && typeof updates.variants === "string") {
        try {
          updates.variants = JSON.parse(updates.variants);
        } catch {
          return res
            .status(400)
            .json({ message: "variants must be a valid JSON array" });
        }
      }

      if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// app.delete("/api/products/:id", authMiddleware, async (req, res) => {
//   try {
//     const doc = await Product.findByIdAndDelete(req.params.id);
//     if (!doc) return res.status(404).json({ message: "Product not found" });
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // If product has image in /uploads, delete it
    if (product.image && product.image.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "uploads", path.basename(product.image));
      // example result: .../yourproject/uploads/1756415019589_Screenshot.png

      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Error deleting file:", err);
        } else {
          console.log("🗑️ Deleted file:", imagePath);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product and image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ===== Customers =====
app.get("/api/customers", authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ updatedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/customers/lookup", async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: "phone is required" });
    const customer = await Customer.findOne({ phone });
    res.json(customer || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Helper Functions =====
async function calculateTotals(items) {
  const subtotal = (items || []).reduce((sum, it) => {
    const price = Number(it.price || 0);
    const qty = Number(it.quantity || 1);
    return sum + price * qty;
  }, 0);
  const settings = (await Settings.findOne()) || { taxRate: 0 };
  const tax = Math.round(((settings.taxRate || 0) / 100) * subtotal * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

// Helper to process customer from phone number
async function processCustomerFromPhone(phone, name = null) {
  if (!phone) return { customer: null, welcomeMessage: "Welcome!" };
  
  let customer = await Customer.findOne({ phone });
  let welcomeMessage = "Welcome, first time customer!";
  
  if (customer) {
    customer.visitCount += 1;
    customer.lastVisited = new Date();
    
    const settings = await Settings.findOne() || { loyaltyVisitsThreshold: 5 };
    const threshold = settings.loyaltyVisitsThreshold || 5;
    
    if (customer.visitCount >= threshold) {
      customer.isLoyal = true;
    }
    
    await customer.save();
    welcomeMessage = customer.isLoyal 
      ? "Welcome back, Loyal Customer!" 
      : "Welcome back!";
  } else {
    // Create new customer with phone number
    customer = await Customer.create({
      name: name || `Customer ${phone}`,
      phone,
      visitCount: 1,
      isLoyal: false,
      lastVisited: new Date(),
    });
  }
  
  return { customer, welcomeMessage };
}

// ===== Orders =====
// Public: place order (with or without customer details)
app.post("/api/orders", async (req, res) => {
  try {
    const { tableNumber, customer, items, whatsappPhone } = req.body || {};
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Process customer - prioritize phone number from WhatsApp if available
    const phoneToUse = whatsappPhone || (customer ? customer.phone : null);
    const { customer: customerDoc, welcomeMessage } = await processCustomerFromPhone(
      phoneToUse, 
      customer ? customer.name : null
    );

    // Resolve products/variants to snapshot price if not already provided
    const normalizedItems = [];
    for (const it of items) {
      if (it.product && it.variant && (it.price === undefined || it.price === null)) {
        const p = await Product.findById(it.product);
        if (!p) return res.status(400).json({ message: `Product not found: ${it.product}` });
        const v = (p.variants || []).find((x) => x.size === it.variant);
        if (!v) {
          return res.status(400).json({ message: `Variant "${it.variant}" not found for ${p.name}` });
        }
        normalizedItems.push({
          product: p._id,
          name: p.name,
          variant: v.size,
          price: v.price,
          quantity: it.quantity || 1,
        });
      } else {
        normalizedItems.push({
          product: it.product || null,
          name: it.name,
          variant: it.variant,
          price: it.price,
          quantity: it.quantity || 1,
        });
      }
    }

    const totals = await calculateTotals(normalizedItems);

    const order = await Order.create({
      tableNumber,
      customerId: customerDoc ? customerDoc._id : undefined,
      items: normalizedItems,
      ...totals,
      status: "pending",
      welcomeMessage,
    });

    res.status(201).json({ order, message: welcomeMessage });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// WhatsApp order endpoint - receives order from Twilio webhook
app.post("/api/orders/whatsapp", async (req, res) => {
  try {
    // Extract phone number from Twilio webhook
    const from = req.body.From;
    const phone = from.replace('whatsapp:', '');
    
    // Parse order details from message body (simplified example)
    const messageBody = req.body.Body;
    
    // In a real implementation, you'd parse the message body to extract order details
    // For this example, we'll assume a simple format or use default items
    const items = [
      {
        name: "Sample Product",
        variant: "regular",
        price: 100,
        quantity: 1
      }
    ];
    
    // Process customer from WhatsApp phone number
    const { customer: customerDoc, welcomeMessage } = await processCustomerFromPhone(phone);
    
    const totals = await calculateTotals(items);
    
    const order = await Order.create({
      customerId: customerDoc ? customerDoc._id : undefined,
      items: items,
      ...totals,
      status: "pending",
      welcomeMessage,
      whatsappMessageId: req.body.MessageSid
    });
    
    // Send confirmation via WhatsApp
    try {
      const settings = await Settings.findOne();
      const restaurantName = settings?.restaurantName || "Our Restaurant";
      
      await twilioClient.messages.create({
        body: `Thank you for your order at ${restaurantName}! Your order #${order._id} has been received. ${welcomeMessage}`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: from
      });
    } catch (twilioError) {
      console.error("Twilio error:", twilioError);
      // Don't fail the order if WhatsApp message fails
    }
    
    res.status(201).json({ 
      success: true, 
      orderId: order._id,
      message: "Order received via WhatsApp"
    });
  } catch (err) {
    console.error("WhatsApp order error:", err);
    res.status(400).json({ message: err.message });
  }
});

// Admin: list orders
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("items.product")
      .populate("customerId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update order status
app.put("/api/orders/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ["pending", "preparing", "served", "completed", "cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${allowed.join(", ")}` });
    }
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Order not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate WhatsApp link for ordering
app.get("/api/whatsapp/link", async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.whatsappNumber) {
      return res.status(404).json({ message: "WhatsApp number not configured" });
    }
    
    // Create a pre-filled message with restaurant name
    const restaurantName = settings.restaurantName || "Our Restaurant";
    const message = `Hello, I'd like to place an order at ${restaurantName}`;
    
    // URL encode the message
    const encodedMessage = encodeURIComponent(message);
    
    // Create the WhatsApp link
    const whatsappLink = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    
    res.json({ link: whatsappLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Test API =====
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Restaurant Ordering System API with WhatsApp integration" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});