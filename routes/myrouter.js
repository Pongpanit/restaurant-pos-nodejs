const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const connectDB = require("../config/db");

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/menus')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".jpg")
    }
})

const upload = multer({
    storage: storage
})

const Menu = require('../models/menus');
const Order = require('../models/order');

//หน้าหลัก
router.get('/', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.render("index", { menus: menus, title: 'Home' });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//หน้าจัดการเมนู
router.get('/manage', async (req, res) => {
    const title = "Manage Menu";
    try {
        const menus = await Menu.find();
        res.render("manage", { menus: menus, title: title });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
})

//หน้าเพิ่มเมนู
router.get('/form', async (req, res) => {
    const title = "Add new Menu"
    try {
        res.render("form", { title: title });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
})

//ฟังก์ชันใส่ข้อมูลเมนู
router.post('/insert', upload.single("image"), async (req, res) => {
    try {
        const { name, price, description, category } = req.body
        const newMenu = new Menu({
            name: name,
            price: price,
            description: description,
            category: category,
            image: req.file.filename
        })
        const savedMenu = await newMenu.save();
        res.redirect('/')
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message })
    }
})

//อัปเดตสถานะของเมนู
router.post('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await Menu.findByIdAndUpdate(id, { status });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//หน้าแก้ไขเมนู
router.post('/edit', async (req, res) => {
    const title = "Edit Menu";
    try {
        const edit_id = req.body.id;

        menu = await Menu.findOne({ _id: edit_id }).exec();

        res.render('edit', { menu: menu, title: title });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//อัปเดตข้อมูลเมนู
router.post('/update', upload.single("image"), async (req, res) => {
    try {
        const id = req.body.id;
        const data = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category
        };
        if (req.file) {
            data.image = req.file.filename;
        }

        await Menu.findByIdAndUpdate(id, data, { useFindAndModify: false }).exec();
        res.redirect('/manage');

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//ลบเมนูออกจาก DB
router.get('/delete/:id', async (req, res) => {
    try {
        Menu.findByIdAndDelete(req.params.id, { useFindAndModify: false }).exec();
        res.redirect('/manage');
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
})

//หน้าเลือกเมนูเพื่อสั่งซื้อ เฉพาะเมนูที่ Active
router.get('/order', async (req, res) => {
    try {
        const menus = await Menu.find({ status: 'Active' });

        res.render("order", { menus: menus, title: "Manage Order"});
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// รับข้อมูลการสั่งซื้อจากฟอร์ม แล้วบันทึกลง DB
router.post('/submit-order', async (req, res) => {
    // แก้ไขตรงนี้: ตรวจสอบว่าเป็น Array หรือไม่ ถ้าไม่ใช่ให้ทำให้เป็น Array
    let menuIds = req.body.menuIds;
    let quantities = req.body.quantities;

    if (!menuIds) {
        return res.status(400).send("กรุณาเลือกอย่างน้อย 1 เมนู");
    }

    // ถ้าส่งมาค่าเดียวมันจะเป็น String ให้เปลี่ยนเป็น Array
    if (!Array.isArray(menuIds)) {
        menuIds = [menuIds];
        quantities = [quantities];
    }

    const validItems = menuIds.map((menuId, index) => {
        const quantity = parseInt(quantities[index]);
        if (quantity > 0) {
            return { menuId, quantity };
        }
        return null;
    }).filter(item => item !== null);

    // ... ส่วนที่เหลือของโค้ดคงเดิม ...
    try {
        if (validItems.length === 0) {
            return res.status(400).send("จำนวนสินค้าต้องมากกว่า 0");
        }
        
        const menus = await Menu.find({ '_id': { $in: validItems.map(item => item.menuId) } });

        const items = validItems.map(item => {
            const menu = menus.find(m => m._id.toString() === item.menuId);
            return {
                menu,
                quantity: item.quantity
            };
        });

        const totalPrice = items.reduce((sum, item) => sum + (item.quantity * item.menu.price), 0);

        const newOrder = new Order({
            items,
            totalPrice
        });

        await newOrder.save();
        res.redirect('/history');
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//หน้าประวัติการสั่งซื้อทั้งหมด
router.get('/history', async (req, res) => {
    const title = "Order History";
    try {
        const orders = await Order.find().populate('items.menu').sort({ createdAt: -1 });
        res.render("history", { orders: orders, title: title });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

//หน้าสลิปใบเสร็จ
router.get('/receipt/:id', async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('items.menu');
      if (!order) {
        return res.status(404).send('ไม่พบคำสั่งซื้อนี้');
      }
      res.render('receipt', { order, title: 'Receipt' });
    } catch (error) {
      res.status(500).send('Server Error: ' + error.message);
    }
  });
  
module.exports = router;
