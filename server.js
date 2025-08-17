// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const path = require("path");
// require("dotenv").config();

// const app = express();

// // ===== Middleware =====
// app.use(cors({ origin: "*" }));
// app.use(bodyParser.json());


// // ===== MongoDB Connection =====
// mongoose
//   .connect("mongodb+srv://okosama06:okosama06@cluster0.z6rfrlw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to MongoDB"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ===== Models =====
// const Product = mongoose.model(
//   "Product",
//   new mongoose.Schema({
//     name: String,
//     description: String,
//     price: Number,
//     category: String,
//     image: String,
//   })
// );

// const Order = mongoose.model(
//   "Order",
//   new mongoose.Schema({
//     tableNumber: Number,
//     items: [
//       {
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
//   })
// );

// const Settings = mongoose.model(
//   "Settings",
//   new mongoose.Schema({
//     restaurantName: String,
//     whatsappNumber: String,
//     taxRate: Number,
//   })
// );

// // ===== API Routes =====

// // --- Products ----
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post("/api/products", async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     const newProduct = await product.save();
//     res.status(201).json(newProduct);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.put("/api/products/:id", async (req, res) => {
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

// app.delete("/api/products/:id", async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.json({ message: "Product deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // --- Orders ---
// app.get("/api/orders", async (req, res) => {
//   try {
//     const orders = await Order.find().sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post("/api/orders", async (req, res) => {
//   try {
//     const order = new Order(req.body);
//     const newOrder = await order.save();

//     // ===== WhatsApp Integration =====
//     const settings = await Settings.findOne();
//     if (settings && settings.whatsappNumber) {
//       const orderText = encodeURIComponent(
//         `New Order from Table ${newOrder.tableNumber}\n\n` +
//           newOrder.items
//             .map(
//               (item) => `${item.name} x${item.quantity} - ₹${item.price}`
//             )
//             .join("\n") +
//           `\n\nTotal: ₹${newOrder.total}`
//       );

//       const waLink = `https://wa.me/${settings.whatsappNumber}?text=${orderText}`;
//       console.log(`📩 WhatsApp Link: ${waLink}`);
//       // In production, send with WhatsApp API instead of just logging
//     }

//     res.status(201).json(newOrder);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.put("/api/orders/:id/status", async (req, res) => {
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

// // --- Settings ---
// app.get("/api/settings", async (req, res) => {
//   try {
//     let settings = await Settings.findOne();
//     if (!settings) {
//       settings = new Settings({
//         restaurantName: "My Restaurant",
//         whatsappNumber: "911234567890", // India format
//         taxRate: 10,
//       });
//       await settings.save();
//     }
//     res.json(settings);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.put("/api/settings", async (req, res) => {
//   try {
//     let settings = await Settings.findOne();
//     if (!settings) {
//       settings = new Settings(req.body);
//     } else {
//       settings.set(req.body);
//     }
//     const updatedSettings = await settings.save();
//     res.json(updatedSettings);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // ===== SPA Frontend Fallback =====


// app.get("/api", (req, res) => {
//   res.json({ message: "Welcome to the Restaurant Ordering System API" });
// });

// // ===== Start Server =====
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port http://localhost:${PORT}`);
// });




// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// ===== Middleware =====
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Models =====
const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});
const Admin = mongoose.model("Admin", AdminSchema);

const Product = mongoose.model(
  "Product",
  new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  })
);

const Order = mongoose.model(
  "Order",
  new mongoose.Schema({
    tableNumber: Number,
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: Number,
    tax: Number,
    total: Number,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  })
);

const Settings = mongoose.model(
  "Settings",
  new mongoose.Schema({
    restaurantName: String,
    whatsappNumber: String,
    taxRate: Number,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  })
);

// ===== Middleware: Auth Check =====
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.adminId = decoded.id;
    next();
  });
};

// ===== Auth Routes =====
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, password: hashed });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Products (Protected: Admin only) =====
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().populate("createdBy", "name email");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/products", authMiddleware, async (req, res) => {
  try {
    const product = new Product({ ...req.body, createdBy: req.adminId });
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===== Orders =====
app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate("items.product").populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: customers place orders
app.post("/api/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/orders/:id/status", authMiddleware, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Settings (Protected) =====
app.get("/api/settings", async (req, res) => {
  try {
    let settings = await Settings.findOne();
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
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===== Test API =====
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the Restaurant Ordering System API" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
